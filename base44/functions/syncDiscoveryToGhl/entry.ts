import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { name, email, formData } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOHIGHLEVEL_API_KEY');
    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    if (!apiKey || !locationId) {
      return Response.json({ error: 'GHL credentials not configured' }, { status: 500 });
    }

    // Build notes from form responses
    const notes = formData
      ? Object.entries(formData)
          .filter(([, v]) => v && typeof v === 'string')
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : '';

    // Upsert contact in GHL
    const contactPayload = {
      locationId,
      email,
      name: name || email,
      tags: ['discovery-questionnaire', 'hangouts-1on1-intake'],
      customField: [
        { key: 'discovery_notes', field_value: notes.slice(0, 3000) },
        { key: 'source', field_value: 'TOP100 Discovery Questionnaire / Hangouts 1:1' },
      ],
    };

    const contactRes = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(contactPayload),
    });

    const contactData = await contactRes.json();
    const contactId = contactData?.contact?.id;

    // Add a note to the contact with the full responses
    if (contactId && notes) {
      await fetch(`https://rest.gohighlevel.com/v1/contacts/${contactId}/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          userId: Deno.env.get('GOHIGHLEVEL_USER_ID') || '',
          body: `Discovery Questionnaire Responses:\n\n${notes}`,
        }),
      });
    }

    console.log(`[GHL Sync] Contact upserted: ${email}, contactId: ${contactId}`);
    return Response.json({ success: true, contactId });
  } catch (error) {
    console.error('[GHL Sync Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
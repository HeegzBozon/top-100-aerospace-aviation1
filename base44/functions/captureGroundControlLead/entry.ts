import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

async function ghlRequest(path, options = {}) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Version': GHL_VERSION,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: response.ok, status: response.status, data };
}

// Loom-First Hybrid Model: hand-raiser → GHL contact + trigger tag → Loom delivery workflow
const INTEREST_CONFIG = {
  audit: {
    label: 'Free Audit',
    triggerTag: 'Trigger: Ground Control Audit Loom',
  },
  trial: {
    label: 'Free Trial',
    triggerTag: 'Trigger: Ground Control Trial Activation',
  },
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, company, link, interest_type = 'audit' } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    if (!locationId) {
      return Response.json({ error: 'GHL location not configured' }, { status: 500 });
    }

    const config = INTEREST_CONFIG[interest_type] || INTEREST_CONFIG.audit;
    const tags = ['Ground Control', `Interest: ${config.label}`, config.triggerTag];

    const contactPayload = {
      locationId,
      email,
      name: name || email,
      firstName: name ? name.split(' ')[0] : undefined,
      source: `TOP 100 Ground Control - ${config.label}`,
      tags,
      customFields: [
        { key: 'source', field_value: `Ground Control - ${config.label}` },
      ],
    };

    const result = await ghlRequest('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify(contactPayload),
    });

    if (!result.ok) {
      console.error('[Ground Control Lead] GHL error:', result.data);
    }

    const contactId = result.data?.contact?.id;

    // Attach a note with the full context
    if (contactId) {
      const userId = Deno.env.get('GOHIGHLEVEL_USER_ID') || '';
      const noteBody = [
        `Ground Control ${config.label} request`,
        '',
        `Name: ${name || '(not provided)'}`,
        `Company: ${company || '(not provided)'}`,
        `Link: ${link || '(not provided)'}`,
        `Interest: ${config.label}`,
      ].join('\n');
      await ghlRequest(`/contacts/${contactId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ userId, body: noteBody }),
      });
    }

    console.log(`[Ground Control Lead] ${email} | interest: ${interest_type} | GHL contact: ${contactId} | tags: ${tags.join(', ')}`);

    return Response.json({
      success: true,
      contact_id: contactId,
      interest_type,
      tags_applied: tags,
    });
  } catch (error) {
    console.error('[captureGroundControlLead] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
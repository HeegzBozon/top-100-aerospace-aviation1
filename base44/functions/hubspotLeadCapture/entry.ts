// MIGRATED: HubSpot replaced by GoHighLevel (GHL)
// This function previously mocked a HubSpot POST — it now routes to GHL.
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, source } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');

    // Save locally
    await base44.asServiceRole.entities.LiveStreamLead.create({ email, source });

    // Upsert to GHL (replaces former HubSpot mock)
    if (locationId) {
      const result = await ghlRequest('/contacts/upsert', {
        method: 'POST',
        body: JSON.stringify({
          locationId,
          email,
          name: email.split('@')[0],
          source: `TOP 100 Lead Capture - ${source || 'unknown'}`,
          tags: ['Lead Capture', source ? `Source: ${source}` : 'Source: Unknown', 'Newsletter Subscriber'],
        }),
      });
      const contactId = result.data?.contact?.id;
      console.log(`[GHL Lead Capture] ${email} | source: ${source} | contactId: ${contactId}`);
      return Response.json({ success: true, contact_id: contactId, message: 'Lead captured in GHL' });
    }

    console.log(`[GHL Lead Capture] Location ID missing — saved locally only. Email: ${email}`);
    return Response.json({ success: true, message: 'Lead captured locally (GHL location not configured)' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
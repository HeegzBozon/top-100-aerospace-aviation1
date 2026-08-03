import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

// GHL tag mapping per RSVP experience
const EXPERIENCE_TAGS = {
  launch_party: ['RSVP', 'Launch Party', 'TOP 100 2026', "New Year's Eve"],
  live_build: ['Waitlist', 'Live Build'],
  workshop: ['Waitlist', 'Workshop'],
  ama: ['Waitlist', 'AMA'],
  lets_talk: ['Booked a Call', "Let's Talk"],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { experience_type, status, user_email, user_name, party_size, notes } = body;

    if (!experience_type || !user_email) {
      return Response.json({ error: 'experience_type and user_email are required' }, { status: 400 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    const tags = EXPERIENCE_TAGS[experience_type] || ['RSVP'];
    const resolvedStatus = status || (experience_type === 'launch_party' ? 'rsvp' : 'waitlist');

    // Upsert contact in GHL with experience-specific tags
    if (locationId) {
      const contactPayload = {
        locationId,
        email: user_email,
        name: user_name || user_email.split('@')[0],
        firstName: user_name ? user_name.split(' ')[0] : undefined,
        source: `TOP 100 RSVP - ${experience_type}`,
        tags,
        customFields: [
          { key: 'rsvp_experience', field_value: experience_type },
          { key: 'rsvp_status', field_value: resolvedStatus },
          { key: 'rsvp_at', field_value: new Date().toISOString() },
        ],
      };
      const result = await ghlRequest('/contacts/upsert', {
        method: 'POST',
        body: JSON.stringify(contactPayload),
      });
      if (!result.ok) {
        console.error('[captureRsvp] GHL error:', result.data);
      }
    }

    // Save local Rsvp record
    const record = await base44.asServiceRole.entities.Rsvp.create({
      experience_type,
      status: resolvedStatus,
      user_email,
      user_name: user_name || '',
      party_size: experience_type === 'launch_party' ? (party_size || 1) : 1,
      notes: notes || '',
    });

    return Response.json({
      success: true,
      record_id: record.id,
      tags_applied: tags,
      status: resolvedStatus,
    });
  } catch (error) {
    console.error('[captureRsvp] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
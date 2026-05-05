import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';
const APP_USER_TAG = 'TOP 100 App User';

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

  if (!response.ok) {
    return { ok: false, status: response.status, data };
  }

  return { ok: true, status: response.status, data };
}

function buildContactPayload(user, locationId) {
  const tags = [APP_USER_TAG];
  if (user.role) tags.push(`Role: ${user.role}`);

  return {
    locationId,
    name: user.full_name || user.email,
    email: user.email,
    source: 'TOP 100 App User Sync',
    tags,
    createNewIfDuplicateAllowed: false,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (currentUser?.role !== 'admin') {
      return Response.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    if (!locationId) {
      return Response.json({ success: false, error: 'Missing GoHighLevel location ID' }, { status: 200 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const limit = Math.min(Number(body.limit || 100), 500);
    const users = await base44.asServiceRole.entities.User.list('-created_date', limit);

    const payloads = users
      .filter(user => user.email)
      .map(user => buildContactPayload(user, locationId));

    if (dryRun) {
      return Response.json({ success: true, dryRun: true, count: payloads.length, contacts: payloads });
    }

    const results = [];
    for (const payload of payloads) {
      const result = await ghlRequest('/contacts/upsert', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      results.push({ email: payload.email, success: result.ok, status: result.status, details: result.ok ? null : result.data });
    }

    const synced = results.filter(result => result.success).length;
    const failed = results.length - synced;

    return Response.json({ success: failed === 0, synced, failed, results });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});
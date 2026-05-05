import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';
const NOMINEE_TAG = 'TOP 100 Nominee';

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

function cleanEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function addTag(tags, label, value) {
  const cleanValue = cleanText(value);
  if (cleanValue) tags.push(`${label}: ${cleanValue}`);
}

function buildContactPayload(nominee, locationId, seasonById = {}) {
  const email = cleanEmail(nominee.nominee_email);
  const tags = [NOMINEE_TAG];
  const companyName = cleanText(nominee.company) || cleanText(nominee.organization);
  const website = cleanText(nominee.website_url) || cleanText(nominee.linkedin_profile_url);
  const seasonName = cleanText(seasonById[nominee.season_id]?.name);

  addTag(tags, 'Nominee Status', nominee.status);
  addTag(tags, 'Claim Status', nominee.claim_status);
  addTag(tags, 'Season', seasonName);
  addTag(tags, 'Season ID', nominee.season_id);
  addTag(tags, 'Country', nominee.country);
  addTag(tags, 'Continent', nominee.continent);
  addTag(tags, 'Industry', nominee.industry);
  addTag(tags, 'Category', nominee.category);
  addTag(tags, 'Verified Status', nominee.verified_status || nominee.verified_status);
  addTag(tags, 'Aura Rank', nominee.aura_rank_name);

  if (nominee.claimed_by_user_email || nominee.claim_requested_by) tags.push('Profile Claim Activity');
  if (nominee.linkedin_profile_url) tags.push('Has LinkedIn');
  if (nominee.bio || nominee.bio_extended) tags.push('Has Bio');

  return {
    locationId,
    name: nominee.name || email,
    email,
    companyName: companyName || undefined,
    website: website || undefined,
    source: 'TOP 100 Nominee Sync',
    tags: [...new Set(tags)],
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
    const skip = Math.max(Number(body.skip || 0), 0);
    const nominees = await base44.asServiceRole.entities.Nominee.list('-updated_date', limit, skip);
    const seasons = await base44.asServiceRole.entities.Season.list('-created_date', 200);
    const seasonById = Object.fromEntries(seasons.map(season => [season.id, season]));

    const seenEmails = new Set();
    const payloads = nominees
      .filter(nominee => isValidEmail(cleanEmail(nominee.nominee_email)))
      .map(nominee => buildContactPayload(nominee, locationId, seasonById))
      .filter(payload => {
        if (seenEmails.has(payload.email)) return false;
        seenEmails.add(payload.email);
        return true;
      });

    if (dryRun) {
      return Response.json({ success: true, dryRun: true, nomineeCount: nominees.length, contactCount: payloads.length, contacts: payloads });
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
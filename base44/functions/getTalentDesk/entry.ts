import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// The Talent Desk's roster. Public, signed-out, and deliberately narrow: it reads
// only the fields a desk card is composed from and never returns an email address.
//
// Ordering is institutional. The roster is alphabetical by name, always. Intent,
// availability and engagement state are shown as information and are never used to
// order, rank, weight, or feature anyone — that is the governance line this surface
// must not cross.

const PUBLIC_STATUSES_EXCLUDED = ['rejected'];

function rows(page) {
  return Array.isArray(page) ? page : page?.items || [];
}

function personFrom(nominee, settings) {
  return {
    id: nominee.id,
    name: nominee.name || '',
    title: nominee.title || nominee.professional_role || '',
    company: nominee.company || nominee.organization || '',
    discipline: nominee.discipline || settings?.domain_accent || '',
    country: nominee.country || '',
    avatar_url: nominee.avatar_url || nominee.photo_url || '',
    verified_status: nominee.verified_status || 'unverified',
    modes: {
      hire: settings?.intent_hire_enabled === true,
      commercial: settings?.intent_commercial_enabled === true,
    },
    hire_availability: settings?.hire_availability || '',
    hire_work_preference: settings?.hire_work_preference || '',
    hire_capabilities: (settings?.hire_capabilities || []).slice(0, 6),
    hire_pitch: settings?.hire_pitch || '',
    commercial_engagements: settings?.commercial_engagements || '',
    commercial_offerings: (settings?.commercial_offerings || []).slice(0, 6),
    commercial_pitch: settings?.commercial_pitch || '',
    sector_keys: settings?.commercial_sectors || [],
  };
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const body = await req.json().catch(() => ({}));

  const mode = ['hire', 'commercial'].includes(body.mode) ? body.mode : 'all';
  const discipline = typeof body.discipline === 'string' ? body.discipline : '';
  const search = String(body.search || '').trim().toLowerCase().slice(0, 80);

  const query =
    mode === 'hire'
      ? { intent_hire_enabled: true }
      : mode === 'commercial'
        ? { intent_commercial_enabled: true }
        : { $or: [{ intent_hire_enabled: true }, { intent_commercial_enabled: true }] };

  const settingsRows = rows(
    await base44.asServiceRole.entities.FellowProfileSettings.filter(query, { limit: 400 }).catch(() => [])
  ).filter((row) => row.fellow_email);

  if (!settingsRows.length) return Response.json({ people: [], total: 0 });

  const ids = settingsRows.map((row) => row.fellow_id).filter(Boolean);
  const emails = settingsRows.map((row) => row.fellow_email);

  const [byId, byEmail] = await Promise.all([
    ids.length
      ? base44.asServiceRole.entities.Nominee.filter({ id: { $in: ids.slice(0, 300) } }).catch(() => [])
      : Promise.resolve([]),
    emails.length
      ? base44.asServiceRole.entities.Nominee.filter({ nominee_email: { $in: emails.slice(0, 300) } }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const nomineeById = new Map();
  for (const nominee of [...rows(byId), ...rows(byEmail)]) {
    if (!nominee?.id) continue;
    if (PUBLIC_STATUSES_EXCLUDED.includes(nominee.status)) continue;
    nomineeById.set(nominee.id, nominee);
  }

  const people = [];
  const seen = new Set();
  for (const settings of settingsRows) {
    const nominee =
      (settings.fellow_id && nomineeById.get(settings.fellow_id)) ||
      rows(byEmail).find((row) => row.nominee_email === settings.fellow_email);
    if (!nominee || !nominee.id || seen.has(nominee.id)) continue;
    seen.add(nominee.id);

    const person = personFrom(nominee, settings);
    if (discipline && person.discipline !== discipline) continue;
    if (search) {
      const haystack = `${person.name} ${person.title} ${person.company} ${person.country}`.toLowerCase();
      if (!haystack.includes(search)) continue;
    }
    people.push(person);
  }

  // Alphabetical. Not by availability, not by intent, not by recency of an
  // enquiry, not by verification tier.
  people.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en'));

  const facets = {};
  for (const person of people) {
    if (!person.discipline) continue;
    facets[person.discipline] = (facets[person.discipline] || 0) + 1;
  }

  return Response.json({ people, total: people.length, facets });
}
// Shared pool-aware nomination linking. One resolver for every approval surface
// (Nomination Intake, Nominee Manager, Finalize Pool wizard) so they never diverge.
// Identity is resolved by canonical LinkedIn slug first, then strict-valid email.
import { canonicalLinkedInSlug, isValidEmail } from './nomineeResolve.ts';

export const TRACK_LABELS = { women: 'TOP 100 Women', men: 'TOP 100 Men', angels: 'TOP 100 Angels' };

const ek = (e) => (e || '').toLowerCase().trim();
const uniq = (arr) => [...new Set(arr.filter(Boolean))];
const hasVal = (v) => v !== undefined && v !== null && String(v).trim() !== '';
export const isMerged = (n) => !!n?.raw_nomination_data?.merged_into;

export async function loadPool(sr) {
  return await sr.entities.Nominee.list('-created_date', 5000);
}

// Normalized full name: strips accents, honorifics, initials and punctuation.
// Requires two or more remaining tokens so single names never match.
const HONORIFICS = new Set(['dr', 'mr', 'mrs', 'ms', 'miss', 'prof', 'professor', 'phd', 'md', 'capt', 'captain',
  'col', 'colonel', 'maj', 'major', 'lt', 'gen', 'sir', 'dame', 'eng', 'engr', 'jr', 'sr', 'ii', 'iii', 'iv']);
export function nameKey(name) {
  const t = String(name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !HONORIFICS.has(w));
  return t.length >= 2 ? t.join(' ') : '';
}

export function nomineeKeys(n) {
  return {
    slug: canonicalLinkedInSlug(n.linkedin_profile_url),
    emails: uniq([n.nominee_email, ...(n.secondary_emails || [])].filter(isValidEmail).map(ek)),
    name: nameKey(n.name),
  };
}

export function intakeKeys(i) {
  return {
    slug: canonicalLinkedInSlug(i.link),
    emails: [i.nominee_email].filter(isValidEmail).map(ek),
    name: nameKey(i.nominee_name),
  };
}

function keysOverlap(a, b) {
  if (a.slug && b.slug && a.slug === b.slug) return true;
  if (a.emails.some((e) => b.emails.includes(e))) return true;
  return !!a.name && a.name === b.name;
}

export function seasonTrack(seasonName) {
  const s = (seasonName || '').toLowerCase();
  if (s.includes('women')) return 'women';
  if (s.includes('angel')) return 'angels';
  if (/\bmen\b/.test(s)) return 'men';
  return null;
}

export function slimNominee(n) {
  return {
    id: n.id, name: n.name, nominee_email: n.nominee_email || '', linkedin_profile_url: n.linkedin_profile_url || '',
    status: n.status, season_id: n.season_id, created_date: n.created_date,
    nomination_count: n.nomination_count || 0, company: n.company || '', title: n.title || '',
  };
}

export function slimIntake(i) {
  return {
    id: i.id, nominee_name: i.nominee_name, nominee_email: i.nominee_email || '', link: i.link || '',
    nomination_type: i.nomination_type, nominator_email: i.nominator_email, status: i.status, created_date: i.created_date,
  };
}

const byOldest = (a, b) => String(a.created_date || '').localeCompare(String(b.created_date || ''));

// Find an existing live master for a set of identity keys. Slug, then email, then name.
// `scope` optionally narrows the candidates (e.g. this season only).
export function findPoolMatch(pool, keys, excludeId, scope = () => true) {
  const live = pool.filter((n) => n.id !== excludeId && !isMerged(n) && n.status !== 'rejected' && scope(n));
  const pick = (arr) => [...arr].sort((a, b) =>
    (b.raw_nomination_data?.is_master ? 1 : 0) - (a.raw_nomination_data?.is_master ? 1 : 0) || byOldest(a, b))[0];
  if (keys.slug) {
    const m = live.filter((n) => nomineeKeys(n).slug === keys.slug);
    if (m.length) return { match: pick(m), matched_on: 'linkedin' };
  }
  if (keys.emails.length) {
    const m = live.filter((n) => nomineeKeys(n).emails.some((e) => keys.emails.includes(e)));
    if (m.length) return { match: pick(m), matched_on: 'email' };
  }
  if (keys.name) {
    const m = live.filter((n) => nomineeKeys(n).name === keys.name);
    if (m.length) return { match: pick(m), matched_on: 'name' };
  }
  return { match: null, matched_on: null };
}

// Profile fields carried from a prior-season record into a returning honoree's new season record.
const CARRY_FIELDS = ['name', 'nominee_email', 'secondary_emails', 'linkedin_profile_url', 'instagram_url', 'tiktok_url',
  'youtube_url', 'website_url', 'title', 'company', 'organization', 'country', 'continent', 'industry', 'description',
  'professional_role', 'bio', 'avatar_url', 'photo_url', 'discipline', 'six_word_story',
  'claim_status', 'claimed_by_user_id', 'claimed_by_user_email', 'claim_method'];

// Approve a NominationIntake into the pool. Links to this season's record if one exists;
// a prior-season match is a returning honoree and gets a new record in this season
// (prior-season archival records are never mutated); otherwise creates a new master.
export async function linkIntakeToPool(sr, intake, seasonId, pool) {
  if (intake.nominee_id) return { status: 'already_linked', nominee_id: intake.nominee_id };
  const keys = intakeKeys(intake);
  let { match, matched_on } = findPoolMatch(pool, keys, null, (n) => n.season_id === seasonId);
  let prior = null;
  if (!match) {
    const p = findPoolMatch(pool, keys, null, (n) => n.season_id !== seasonId);
    if (p.match) { prior = p.match; matched_on = p.matched_on; }
  }
  const link = intake.link || '';
  const isLinkedIn = link.includes('linkedin.com');
  const validEmail = isValidEmail(intake.nominee_email) ? intake.nominee_email.trim() : '';
  let nomineeId;
  let nomineeName;

  if (match) {
    const r = match.raw_nomination_data || {};
    const parts = Array.isArray(r.season_participation) ? r.season_participation : [];
    const updatedParts = parts.some((p) => p.season_id === seasonId)
      ? parts : [...parts, { nominee_id: match.id, season_id: seasonId, status: 'pending' }];
    const ids = uniq([...(match.linked_nomination_ids || []), intake.id]);
    const fill = (cur, val) => (hasVal(cur) ? cur : (val || ''));
    const patch = {
      raw_nomination_data: { ...r, is_master: true, season_participation: updatedParts },
      linked_nomination_ids: ids,
      nomination_count: ids.length,
      nominee_email: isValidEmail(match.nominee_email) ? match.nominee_email : (validEmail || match.nominee_email || ''),
      linkedin_profile_url: fill(match.linkedin_profile_url, isLinkedIn ? link : ''),
      website_url: fill(match.website_url, link && !isLinkedIn ? link : ''),
      title: fill(match.title, intake.role_org || intake.firm),
      company: fill(match.company, intake.firm),
      country: fill(match.country, intake.location),
      nomination_reason: fill(match.nomination_reason, intake.reason),
    };
    await sr.entities.Nominee.update(match.id, patch);
    Object.assign(match, patch);
    nomineeId = match.id;
    nomineeName = match.name;
  } else {
    const fresh = {
      name: intake.nominee_name,
      nominee_email: validEmail,
      linkedin_profile_url: isLinkedIn ? link : '',
      website_url: link && !isLinkedIn ? link : '',
      title: intake.role_org || intake.firm || '',
      company: intake.firm || '',
      country: intake.location || '',
      description: intake.reason || `${intake.nominee_name} was submitted through the unified nomination hub.`,
    };
    const carried = {};
    if (prior) for (const f of CARRY_FIELDS) if (hasVal(prior[f])) carried[f] = prior[f];
    const created = await sr.entities.Nominee.create({
      ...fresh,
      ...carried,
      season_id: seasonId,
      nomination_reason: intake.reason || '',
      nominated_by: intake.nominator_email,
      category: TRACK_LABELS[intake.nomination_type] || intake.nomination_type,
      status: 'pending',
      linked_nomination_ids: [intake.id],
      nomination_count: 1,
      raw_nomination_data: {
        is_master: true,
        season_participation: [{ nominee_id: null, season_id: seasonId, status: 'pending' }],
        merged_nominee_ids: [],
        ...(prior ? { returning_from_nominee_id: prior.id, returning_from_season_id: prior.season_id } : {}),
      },
    });
    pool.push(created);
    nomineeId = created.id;
    nomineeName = created.name;
  }

  const status = match ? 'linked' : prior ? 'returning' : 'created';
  const note = {
    linked: `Linked to pool master (${matched_on} match).`,
    returning: `Returning honoree (${matched_on} match to ${prior?.id}); carried into this season.`,
    created: 'Created new pool master.',
  }[status];
  await sr.entities.NominationIntake.update(intake.id, {
    status: 'approved',
    nominee_id: nomineeId,
    admin_notes: `${intake.admin_notes ? intake.admin_notes + '\n' : ''}${note}`,
  });
  return { status, matched_on, nominee_id: nomineeId, nominee_name: nomineeName, returning_from: prior ? slimNominee(prior) : null };
}

// Approve a Nominee from the Nominee Manager with the same resolver.
export async function approveNomineeInPool(sr, nominee, pool, intakes, force) {
  const keys = nomineeKeys(nominee);
  // Only same-season matches are conflicts; prior-season matches are returning honorees.
  const { match, matched_on } = findPoolMatch(pool, keys, nominee.id, (n) => n.season_id === nominee.season_id);
  if (match && !force) return { status: 'conflict', matched_on, duplicate: slimNominee(match) };

  const hits = intakes.filter((i) => !i.nominee_id && !['rejected', 'archived'].includes(i.status) && keysOverlap(intakeKeys(i), keys));
  const ids = uniq([
    ...(nominee.linked_nomination_ids || []),
    ...intakes.filter((i) => i.nominee_id === nominee.id).map((i) => i.id),
    ...hits.map((i) => i.id),
  ]);
  for (const i of hits) {
    await sr.entities.NominationIntake.update(i.id, { status: 'approved', nominee_id: nominee.id });
  }
  await sr.entities.Nominee.update(nominee.id, { status: 'approved', linked_nomination_ids: ids, nomination_count: ids.length });
  return { status: 'approved', linked_intakes: hits.length, nomination_count: ids.length, duplicate: match ? slimNominee(match) : null };
}

// Read-only duplicate audit. Merges are proposed only WITHIN the season so that
// finalized archival records in prior seasons are never mutated; cross-season
// matches are reported as returning honorees.
export function scanSeasonDuplicates(pool, seasonId) {
  const live = pool.filter((n) => !isMerged(n) && n.status !== 'rejected');
  const parent = live.map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  const seen = new Map();
  live.forEach((n, i) => {
    const k = nomineeKeys(n);
    const all = [...(k.slug ? ['s:' + k.slug] : []), ...k.emails.map((e) => 'e:' + e), ...(k.name ? ['n:' + k.name] : [])];
    for (const key of all) {
      if (seen.has(key)) union(i, seen.get(key)); else seen.set(key, i);
    }
  });
  const groups = new Map();
  live.forEach((n, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(n); });

  const mergeable = [];
  let returning = 0;
  for (const members of groups.values()) {
    const inSeason = members.filter((n) => n.season_id === seasonId).sort(byOldest);
    if (inSeason.length >= 2) {
      const shared = (vals) => vals.length !== new Set(vals).size;
      const ks = inSeason.map(nomineeKeys);
      const matched_on = shared(ks.map((k) => k.slug).filter(Boolean)) ? 'linkedin'
        : shared(ks.flatMap((k) => k.emails)) ? 'email' : 'name';
      mergeable.push({ matched_on, members: inSeason.map(slimNominee) });
    } else if (inSeason.length === 1 && members.length > 1) {
      returning++;
    }
  }
  return {
    groups: mergeable,
    returning_count: returning,
    season_pool_size: live.filter((n) => n.season_id === seasonId).length,
  };
}

export function findOrphans(pool, intakes, seasonId, track) {
  const linked = new Set(intakes.filter((i) => i.nominee_id).map((i) => i.nominee_id));
  const unlinked_intakes = intakes
    .filter((i) => i.status === 'approved' && !i.nominee_id && (!track || i.nomination_type === track))
    .map(slimIntake);
  const unbacked_nominees = pool
    .filter((n) => n.season_id === seasonId && ['pending', 'approved'].includes(n.status) && !isMerged(n)
      && !linked.has(n.id) && !(n.linked_nomination_ids || []).length)
    .map(slimNominee);
  return { unlinked_intakes, unbacked_nominees };
}

const STATUS_ORDER = ['rejected', 'pending', 'approved', 'active', 'finalist', 'winner'];
const FILL_FIELDS = ['linkedin_profile_url', 'description', 'bio', 'title', 'company', 'country', 'industry',
  'photo_url', 'avatar_url', 'professional_role', 'website_url', 'nomination_reason', 'instagram_url'];

// Merge a within-season duplicate group. Oldest record survives as master;
// duplicates are retired (status 'rejected' + merged_into) rather than deleted,
// so the merge is reversible from the pre-flight backup.
export async function mergeGroup(sr, members, intakes) {
  const sorted = [...members].sort(byOldest);
  const master = sorted[0];
  const dups = sorted.slice(1);
  const dupIds = dups.map((d) => d.id);
  const patch = {};
  for (const f of FILL_FIELDS) {
    if (!hasVal(master[f])) { const d = dups.find((x) => hasVal(x[f])); if (d) patch[f] = d[f]; }
  }
  const emails = uniq(sorted.flatMap((n) => [n.nominee_email, ...(n.secondary_emails || [])]).filter(isValidEmail).map(ek));
  const primary = isValidEmail(master.nominee_email) ? ek(master.nominee_email) : (emails[0] || '');
  if (primary && primary !== ek(master.nominee_email)) patch.nominee_email = primary;
  patch.secondary_emails = emails.filter((e) => e !== primary);

  const relink = intakes.filter((i) => dupIds.includes(i.nominee_id));
  const ids = uniq([
    ...sorted.flatMap((n) => n.linked_nomination_ids || []),
    ...intakes.filter((i) => i.nominee_id === master.id).map((i) => i.id),
    ...relink.map((i) => i.id),
  ]);
  patch.linked_nomination_ids = ids;
  patch.nomination_count = ids.length;
  patch.status = sorted.map((n) => n.status).sort((a, b) => STATUS_ORDER.indexOf(b) - STATUS_ORDER.indexOf(a))[0] || master.status;
  const r = master.raw_nomination_data || {};
  patch.raw_nomination_data = { ...r, is_master: true, merged_nominee_ids: uniq([...(r.merged_nominee_ids || []), ...dupIds]) };

  await sr.entities.Nominee.update(master.id, patch);
  for (const i of relink) await sr.entities.NominationIntake.update(i.id, { nominee_id: master.id });
  const now = new Date().toISOString();
  for (const d of dups) {
    await sr.entities.Nominee.update(d.id, {
      status: 'rejected',
      raw_nomination_data: { ...(d.raw_nomination_data || {}), merged_into: master.id, merged_at: now, pre_merge_status: d.status },
    });
  }
  return { master_id: master.id, master_name: master.name, merged_ids: dupIds, relinked_intakes: relink.length };
}

function trackFromCategory(name) {
  const s = (name || '').toLowerCase();
  if (s.includes('women')) return 'women';
  if (s.includes('angel')) return 'angels';
  if (/\bmen\b/.test(s)) return 'men';
  return 'women';
}

// Idempotent one-way migration of the retired legacy Nomination entity.
export async function migrateLegacyNominations(sr) {
  const [legacy, intakes, cats, pool] = await Promise.all([
    sr.entities.Nomination.list('-created_date', 5000),
    sr.entities.NominationIntake.list('-created_date', 5000),
    sr.entities.Category.list('-created_date', 500),
    loadPool(sr),
  ]);
  const key = (a, b, t) => `${ek(a)}|${ek(b)}|${t}`;
  const existing = new Set(intakes.map((i) => key(i.nominator_email, i.nominee_email, i.nomination_type)));
  const migratedIds = new Set(intakes.map((i) => i.migrated_from_nomination_id).filter(Boolean));
  const statusMap = { pending: 'new', approved: 'approved', rejected: 'rejected' };
  let migrated = 0, skipped = 0;
  for (const n of legacy) {
    const type = trackFromCategory(cats.find((c) => c.id === n.category_id)?.name);
    const k = key(n.nominator_email, n.nominee_email, type);
    if (migratedIds.has(n.id) || existing.has(k)) { skipped++; continue; }
    const person = pool.find((p) => nomineeKeys(p).emails.includes(ek(n.nominee_email)));
    await sr.entities.NominationIntake.create({
      nomination_type: type,
      nominee_name: person?.name || n.nominee_email,
      nominee_email: n.nominee_email,
      reason: n.justification || '',
      nominator_email: n.nominator_email,
      source: 'legacy_nomination',
      status: statusMap[n.status] || 'new',
      migrated_from_nomination_id: n.id,
      admin_notes: `Migrated from legacy Nomination (cycle ${n.cycle_year || 'n/a'}).`,
    });
    existing.add(k);
    migrated++;
  }
  return { total: legacy.length, migrated, skipped };
}
// A Fellow's ranked ballot begins with the people they put forward.
//
// Nomination and the ballot are one system: a Fellow who named someone has already made
// a judgement about them, so that judgement opens their ballot — seeded, in the order they
// submitted it, and editable like any other set of choices. Seeded is not cast, though. A
// seed is a draft until the voter saves it, and the ledger keeps the two apart so a
// nomination is never quietly counted as a vote.

const VOTABLE = ['active', 'approved', 'winner', 'finalist'];

// Intake that was refused or retired carries no nomination worth seeding from.
const RETIRED_INTAKE = ['rejected', 'archived'];

const normEmail = (value) => String(value || '').trim().toLowerCase();

function cohortKey(season) {
  return String(season?.cohort_key || '').trim().toLowerCase();
}

// Every nominee id in the list that can actually stand in this cohort.
async function standingIds(service, ids, seasonId) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Set();

  const found = [];
  const chunks = Math.ceil(unique.length / 100);
  for (let index = 0; index !== chunks; index += 1) {
    const chunk = unique.slice(index * 100, index * 100 + 100);
    const rows = await service.entities.Nominee
      .filter({ id: { $in: chunk } })
      .catch(() => []);
    found.push(...(rows || []));
  }

  const valid = new Set();
  for (const nominee of found) {
    if (!VOTABLE.includes(nominee.status)) continue;
    const standing = [nominee.season_id, ...(nominee.season_ids || [])].filter(Boolean);
    if (standing.includes(seasonId)) valid.add(nominee.id);
  }
  return valid;
}

async function listIntake(service) {
  const all = [];
  let cursor = null;
  let rounds = 0;
  while (rounds !== 20) {
    rounds += 1;
    const options: Record<string, unknown> = { sort: '-created_date', limit: 200 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.NominationIntake.filter({}, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
}

// One draft ballot per voter per cohort, built from the nominations they submitted.
// Cohorts are matched on their own key, so a name filed for the Women cohort seeds the
// Women ballot and nothing else.
export async function resolveSeededBallots(service, cohorts = []) {
  const byKey = new Map();
  (cohorts || []).forEach((c) => {
    const key = cohortKey(c);
    if (key && !byKey.has(key)) byKey.set(key, c.id);
  });
  if (!byKey.size) return [];

  const intake = (await listIntake(service)).filter(
    (r) =>
      r.nominee_id &&
      r.nominator_email &&
      !RETIRED_INTAKE.includes(String(r.status || '').toLowerCase())
  );
  if (!intake.length) return [];

  const drafts = new Map();
  for (const row of intake) {
    const seasonId = byKey.get(String(row.nomination_type || '').trim().toLowerCase());
    if (!seasonId) continue;
    const key = `${normEmail(row.nominator_email)}|${seasonId}`;
    const draft =
      drafts.get(key) || {
        voter_email: normEmail(row.nominator_email),
        season_id: seasonId,
        nominee_ids: [],
        intake_ids: [],
        first_at: row.created_date || null,
        last_at: row.created_date || null,
      };
    if (!draft.nominee_ids.includes(row.nominee_id)) draft.nominee_ids.push(row.nominee_id);
    draft.intake_ids.push(row.id);
    if (row.created_date && (!draft.last_at || row.created_date > draft.last_at)) draft.last_at = row.created_date;
    drafts.set(key, draft);
  }

  const seasonOf = new Map();
  (cohorts || []).forEach((c) => seasonOf.set(c.id, c));
  const validCache = new Map();
  const out = [];

  for (const draft of drafts.values()) {
    if (!validCache.has(draft.season_id)) {
      const everyId = [...drafts.values()]
        .filter((d) => d.season_id === draft.season_id)
        .flatMap((d) => d.nominee_ids);
      validCache.set(draft.season_id, await standingIds(service, everyId, draft.season_id));
    }
    const valid = validCache.get(draft.season_id);
    const ids = draft.nominee_ids.filter((id) => valid.has(id));
    if (!ids.length) continue;
    out.push({
      ...draft,
      nominee_ids: ids,
      count: ids.length,
      cohort: seasonOf.get(draft.season_id)?.cohort_label || null,
    });
  }

  return out;
}

// The same seed, for one voter's own ballot. Reading their draft never writes a vote:
// the record only exists once they save it.
export async function seedBallotForVoter(service, { email, seasonId } = {}) {
  const voter = normEmail(email);
  if (!voter || !seasonId) return { ids: [], count: 0, nominated_at: null };

  const season = await service.entities.Season.get(seasonId).catch(() => null);
  if (!season) return { ids: [], count: 0, nominated_at: null };

  const key = cohortKey(season);
  const rows = await service.entities.NominationIntake
    .filter({ nominator_email: email }, '-created_date', 200)
    .catch(() => []);

  const mine = (rows || [])
    .filter(
      (r) =>
        r.nominee_id &&
        !RETIRED_INTAKE.includes(String(r.status || '').toLowerCase()) &&
        (!key || String(r.nomination_type || '').trim().toLowerCase() === key)
    )
    .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));

  if (!mine.length) return { ids: [], count: 0, nominated_at: null };

  const valid = await standingIds(service, mine.map((r) => r.nominee_id), seasonId);
  const ids = [];
  for (const row of mine) {
    if (valid.has(row.nominee_id) && !ids.includes(row.nominee_id)) ids.push(row.nominee_id);
  }

  return { ids, count: ids.length, nominated_at: mine[0]?.created_date || null };
}
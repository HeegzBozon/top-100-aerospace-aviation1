// Link-model season membership for Nominee records.
// A nominee is a member of every season in `season_ids`; `season_id` stays as a
// denormalized primary-season pointer for backward-compatible reads. Rollover and
// backfill add a season here instead of copying the record, so one person carries
// forward across years without duplicate records.

import { canonicalLinkedInSlug, isValidEmail } from './nomineeResolve.ts';

// Flat score fields mirrored into each season_scores[seasonId] snapshot.
export const SCORE_FIELDS = [
  'elo_rating', 'borda_score', 'direct_vote_count',
  'community_elo_rating', 'nominee_elo_rating', 'community_borda_score',
  'nominee_borda_score', 'community_direct_score', 'nominee_direct_score',
  'pairwise_appearance_count', 'total_votes', 'rising_star_count',
  'rock_star_count', 'super_star_count', 'north_star_count',
  'endorsement_score', 'starpower_score', 'aura_score', 'holistic_score',
  'total_wins', 'total_losses', 'win_percentage', 'total_spotlights', 'clout',
];

// Compat season-pool query. A nominee is "in" a season if their season_ids array
// contains it (link model) OR their legacy season_id equals it (copy model /
// pre-migration). Safe before migration (season_ids empty -> only season_id
// matches) and after (season_ids populated -> both clauses may match, still one
// document, no double-count).
export function seasonPoolQuery(seasonId: string) {
  return { $or: [{ season_ids: seasonId }, { season_id: seasonId }] };
}

export function isInSeason(n: any, seasonId: string): boolean {
  const arr = Array.isArray(n?.season_ids) ? n.season_ids : null;
  if (arr && arr.includes(seasonId)) return true;
  return n?.season_id === seasonId;
}

// Reset score snapshot for a fresh season membership (rollover / backfill).
export function seedSeasonScores(status: string = 'active') {
  return {
    status,
    elo_rating: 1200, borda_score: 0, direct_vote_count: 0,
    community_elo_rating: 1200, nominee_elo_rating: 1200,
    community_borda_score: 0, nominee_borda_score: 0,
    community_direct_score: 0, nominee_direct_score: 0,
    pairwise_appearance_count: 0, total_votes: 0,
    rising_star_count: 0, rock_star_count: 0, super_star_count: 0, north_star_count: 0,
    endorsement_score: 0, starpower_score: 0, aura_score: 0, holistic_score: 0,
    total_wins: 0, total_losses: 0, win_percentage: 0, total_spotlights: 0, clout: 0,
  };
}

// Idempotently link a nominee into a season: push seasonId onto season_ids and
// seed a reset score snapshot for that season if absent. Never mutates season_id.
// Returns the patch applied, or null if already a member with scores.
export async function linkToSeason(sr: any, nominee: any, seasonId: string, status: string = 'active') {
  const ids = Array.isArray(nominee.season_ids) ? [...nominee.season_ids] : [];
  const scores: Record<string, any> = { ...(nominee.season_scores || {}) };
  let changed = false;
  if (!ids.includes(seasonId)) { ids.push(seasonId); changed = true; }
  if (!scores[seasonId]) { scores[seasonId] = seedSeasonScores(status); changed = true; }
  if (!changed) return null;
  const patch = { season_ids: ids, season_scores: scores };
  await sr.entities.Nominee.update(nominee.id, patch);
  Object.assign(nominee, patch);
  return patch;
}

// Pure (no DB) variant of linkToSeason: returns {id, ...patch} for bulkUpdate, or
// null if already a member with scores. Used by batched rollover/backfill so one
// bulkUpdate call replaces hundreds of sequential updates.
export function linkToSeasonPatch(nominee: any, seasonId: string, status: string = 'active') {
  const ids = Array.isArray(nominee.season_ids) ? [...nominee.season_ids] : [];
  const scores: Record<string, any> = { ...(nominee.season_scores || {}) };
  let changed = false;
  if (!ids.includes(seasonId)) { ids.push(seasonId); changed = true; }
  if (!scores[seasonId]) { scores[seasonId] = seedSeasonScores(status); changed = true; }
  if (!changed) return null;
  const patch = { season_ids: ids, season_scores: scores };
  Object.assign(nominee, patch);
  return { id: nominee.id, ...patch };
}

// Snapshot a nominee's current flat scores into season_scores[seasonId]. Used by
// the one-time migration to seed per-season snapshots from existing flat fields.
export function snapshotFlatScores(n: any, seasonId: string, status?: string) {
  const snap: Record<string, any> = { status: status || n.status || 'active' };
  for (const f of SCORE_FIELDS) {
    const v = (n as any)[f];
    snap[f] = typeof v === 'number' ? v : 0;
  }
  // elo-family fields default to 1200, not 0.
  ['elo_rating', 'community_elo_rating', 'nominee_elo_rating'].forEach((f) => {
    if (snap[f] === 0) snap[f] = 1200;
  });
  return snap;
}

// Identity keys for cross-season dedupe (slug first, then valid email).
export function personKeys(n: any) {
  const slug = canonicalLinkedInSlug(n?.linkedin_profile_url);
  const email = isValidEmail(n?.nominee_email) ? String(n.nominee_email).toLowerCase().trim() : '';
  return { slug, email };
}

// Union-find groups of records that share a slug or a valid email. Returns an
// array of groups (arrays of indices into `records`). Reused by backfill and
// rollover so the same person isn't linked into a season twice.
export function groupByPerson(records: any[]): number[][] {
  const parent = records.map((_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  const slugToIdx = new Map<string, number>();
  const emailToIdx = new Map<string, number>();
  for (let i = 0; i < records.length; i++) {
    const { slug, email } = personKeys(records[i]);
    if (slug) {
      if (slugToIdx.has(slug)) union(i, slugToIdx.get(slug)!);
      else slugToIdx.set(slug, i);
    }
    if (email) {
      if (emailToIdx.has(email)) union(i, emailToIdx.get(email)!);
      else emailToIdx.set(email, i);
    }
  }
  const groups = new Map<number, number[]>();
  for (let i = 0; i < records.length; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r)!.push(i);
  }
  return [...groups.values()];
}
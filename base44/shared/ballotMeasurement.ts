// THE ONE DEFINITION OF BALLOT ACTIVITY, SERVER SIDE.
//
// Both monitors read their raw counts through here — the committee's live monitor (via
// getBallotMeasurement) and the selection desk (via getSelectionAnalytics) — so the pool a
// reading is scaled against, and the nominees it has reached, are the same records in both
// places. The derived figures (sittings, depth, targets) are computed once, from these
// counts, in src/lib/ballotMeasurement.js.
//
// The recorder writes five marks to a sitting (see functions/submitAnchorVote): the top over
// each of the two neutrals, the top over the bottom, each neutral over the bottom. The
// middle-versus-middle edge is deliberately not imputed. One mark involves two nominees.
//
// Five is the writer's own figure, not a convention: scripts/check-ballot-parity.mjs fails if
// this constant drifts from what submitAnchorVote actually applies.

export const CARDS_PER_SITTING = 4;
export const MARKS_PER_SITTING = 5;
export const NOMINEE_TOUCHES_PER_MARK = 2;

// The statuses a nominee can be weighed under, everywhere in the platform.
export const VOTABLE_STATUSES = ['active', 'approved', 'winner', 'finalist'];

// ── THE POOL IS THE FIELD THE BALLOT DEALS FROM ─────────────────────────────
// A Fellow weighs the professional field, not one season's list: the cards come out of the
// master index — every nominee with a live place in any season, deduped by name in favour of
// the master record (functions/AnchorVoting reads it the same way). A mark is then stamped
// with whichever cohort was counting when it was cast. So the pool a reading is scaled
// against is that field, and a nominee from an older season who was dealt is inside it, not
// outside the cohort: scaling a counting cohort's marks against its own membership alone
// (fifteen records, say) against thousands of marks cast from the whole field would report a
// thousand per cent of the floor.
//
// Coverage is bounded by this field, and a nominee the field does not hold — rejected, or
// with no live place anywhere — can never stand as coverage.
export async function listPool(service: any, seasonIds: string[]) {
  const all: any[] = [];
  let cursor: string | null = null;
  let rounds = 0;
  while (rounds !== 8) {
    rounds += 1;
    const options: any = { sort: '-created_date', limit: 500 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.Nominee.filter({}, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }

  // Deduped by name, preferring the master record — one person is one card.
  const byName = new Map<string, any>();
  for (const n of all) {
    const key = String(n.name || '').trim().toLowerCase();
    if (!key) continue;
    const held = byName.get(key);
    const isMaster = Boolean(n.raw_nomination_data?.is_master);
    if (!held || (isMaster && !held.raw_nomination_data?.is_master)) byName.set(key, n);
  }

  return Array.from(byName.values()).filter((n) => {
    // A record rejected on its own file is never a card, whatever its participation index
    // says: the index can still read "pending" on a nomination that was turned down, which
    // is how a rejected record was being dealt against the field.
    if (!VOTABLE_STATUSES.includes(n.status)) return false;
    const parts = n.raw_nomination_data?.season_participation;
    if (Array.isArray(parts) && parts.length) {
      return parts.some((p: any) => p.status && p.status !== 'rejected');
    }
    // Legacy records without the index fall back to a votable status on a cohort in scope.
    const held = [n.season_id, ...(n.season_ids || [])].filter(Boolean);
    return VOTABLE_STATUSES.includes(n.status) && held.some((id: string) => seasonIds.includes(id));
  });
}

// The nominees a lane's marks have touched. Read as two grouped counts rather than as rows:
// one group per nominee is a page, the rows themselves are thousands.
async function reachedIn(service: any, seasonIds: string[], isTest: boolean) {
  const query = {
    season_id: { $in: seasonIds },
    is_test: isTest ? true : { $ne: true },
  };
  const [wins, losses] = await Promise.all([
    service.entities.PairwiseVote.aggregate({ query, groupBy: 'winner_nominee_id' }).catch(() => null),
    service.entities.PairwiseVote.aggregate({ query, groupBy: 'loser_nominee_id' }).catch(() => null),
  ]);
  const ids = new Set<string>();
  (wins?.rows || []).forEach((row: any) => { if (row?.winner_nominee_id) ids.add(row.winner_nominee_id); });
  (losses?.rows || []).forEach((row: any) => { if (row?.loser_nominee_id) ids.add(row.loser_nominee_id); });
  return ids;
}

function countsAgainst(fieldIds: Set<string>, reached: Set<string>) {
  let found = 0;
  reached.forEach((id) => { if (fieldIds.has(id)) found += 1; });
  return found;
}

// One reading of one scope: the field, the marks each lane has written, and how much of the
// field each lane has reached. `pool` may be handed in when the caller has already read it.
export async function readBallotMeasurement(service: any, seasonIds: string[], opts: any = {}) {
  const ids = (seasonIds || []).filter(Boolean);
  if (!ids.length) return null;

  const pool = opts?.pool || (await listPool(service, ids));
  const fieldIds = new Set<string>(pool.map((n: any) => n.id).filter(Boolean));

  const [live, test, liveMarks, testMarks] = await Promise.all([
    reachedIn(service, ids, false),
    reachedIn(service, ids, true),
    service.entities.PairwiseVote
      .count({ season_id: { $in: ids }, is_test: { $ne: true } })
      .catch(() => 0),
    service.entities.PairwiseVote.count({ season_id: { $in: ids }, is_test: true }).catch(() => 0),
  ]);

  // Per cohort the field is the same one — the ballot deals from it for every counting
  // cohort — but each cohort's coverage is read off its own marks, so the dive can still
  // say what a given edition's sittings reached.
  const by_cohort = [];
  for (const id of ids) {
    const single = ids.length === 1;
    const [cohortLive, cohortTest] = single
      ? [live, test]
      : await Promise.all([reachedIn(service, [id], false), reachedIn(service, [id], true)]);
    by_cohort.push({
      season_id: id,
      pool: fieldIds.size,
      covered_live: countsAgainst(fieldIds, cohortLive),
      covered_test: countsAgainst(fieldIds, cohortTest),
    });
  }

  return {
    pool: fieldIds.size,
    comparisons_live: Number(liveMarks) || 0,
    comparisons_test: Number(testMarks) || 0,
    covered_live: countsAgainst(fieldIds, live),
    covered_test: countsAgainst(fieldIds, test),
    by_cohort,
  };
}
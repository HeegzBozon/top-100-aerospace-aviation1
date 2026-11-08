// THE ONE DEFINITION OF BALLOT ACTIVITY, SERVER SIDE.
//
// Both monitors read their raw counts through here — the committee's live monitor (via
// getBallotMeasurement) and the selection desk (via getSelectionAnalytics) — so the pool
// a reading is scaled against and the nominees it has reached are the same records in both
// places. The derived figures (sittings, depth, targets) are computed once, from these
// counts, in src/lib/ballotMeasurement.js.
//
// The recorder writes five marks to a sitting (see functions/submitAnchorVote): the top over
// each of the two neutrals, the top over the bottom, each neutral over the bottom. The
// middle-versus-middle edge is deliberately not imputed. One mark involves two nominees.
//
// Five is the writer's own figure, not a convention: scripts/check-ballot-parity.mjs reads
// the recorder's neutral guard and the pairs it applies, and fails if this constant drifts
// from them.
//
// COVERAGE is cohort-scoped and clamped: a nominee reached by another cohort's marks, or one
// the pool does not hold, is never counted.

export const CARDS_PER_SITTING = 4;
export const MARKS_PER_SITTING = 5;
export const NOMINEE_TOUCHES_PER_MARK = 2;

// The statuses a nominee can be weighed under, everywhere in the platform.
export const VOTABLE_STATUSES = ['active', 'approved', 'winner', 'finalist'];

// Cohort membership, written once: the link model (season_ids) or the legacy pointer
// (season_id), never a rejected record.
export function poolQuery(seasonIds: string[]) {
  return {
    status: { $in: VOTABLE_STATUSES },
    $or: seasonIds.flatMap((id) => [{ season_ids: id }, { season_id: id }]),
  };
}

// The whole pool, not a page of it: a capped slice would score a different field than the
// one being watched.
export async function listPool(service: any, seasonIds: string[]) {
  if (!seasonIds.length) return [];
  const query = poolQuery(seasonIds);
  const all: any[] = [];
  let cursor: string | null = null;
  let rounds = 0;
  while (rounds !== 40) {
    rounds += 1;
    const options: any = { sort: '-elo_rating', limit: 500 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.Nominee.filter(query, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
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

function countsAgainst(poolIds: Set<string>, reached: Set<string>) {
  let found = 0;
  reached.forEach((id) => { if (poolIds.has(id)) found += 1; });
  return found;
}

// One reading of one scope: the pool, the marks each lane has written, and how much of the
// pool each lane has reached. `pool` may be handed in when the caller has already read it.
export async function readBallotMeasurement(service: any, seasonIds: string[], opts: any = {}) {
  const ids = (seasonIds || []).filter(Boolean);
  if (!ids.length) return null;

  const pool = opts?.pool || (await listPool(service, ids));
  const poolIds = new Set<string>(pool.map((n: any) => n.id).filter(Boolean));

  const [live, test, liveMarks, testMarks] = await Promise.all([
    reachedIn(service, ids, false),
    reachedIn(service, ids, true),
    service.entities.PairwiseVote
      .count({ season_id: { $in: ids }, is_test: { $ne: true } })
      .catch(() => 0),
    service.entities.PairwiseVote.count({ season_id: { $in: ids }, is_test: true }).catch(() => 0),
  ]);

  // The pool cut by cohort, so a cohort's coverage is bounded by its own field.
  const members = new Map<string, Set<string>>();
  ids.forEach((id) => members.set(id, new Set()));
  pool.forEach((n: any) => {
    const held = [n.season_id, ...(n.season_ids || [])].filter(Boolean);
    held.forEach((id: string) => { if (members.has(id)) members.get(id)!.add(n.id); });
  });

  const by_cohort = ids.map((id) => {
    const own = members.get(id)!;
    return {
      season_id: id,
      pool: own.size,
      covered_live: countsAgainst(own, live),
      covered_test: countsAgainst(own, test),
    };
  });

  return {
    pool: poolIds.size,
    comparisons_live: Number(liveMarks) || 0,
    comparisons_test: Number(testMarks) || 0,
    covered_live: countsAgainst(poolIds, live),
    covered_test: countsAgainst(poolIds, test),
    by_cohort,
  };
}
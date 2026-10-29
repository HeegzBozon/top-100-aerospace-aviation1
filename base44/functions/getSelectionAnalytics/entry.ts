import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveCohorts } from '../../shared/votingWindow.ts';
import { LEVELS, ALL_MILESTONES } from '../../shared/votingProgress.ts';
import { resolveSeededBallots } from '../../shared/ballotSeed.ts';

// Selection analytics, across every cohort at once, read-only.
//
// Admin only, and deliberately so: this is the ledger of who weighed whom, alongside
// the tallies those weights produced. Detail at this grain never reaches a Fellow's
// surface — a ballot is sealed, and only the operator reads the seam.
//
// The combined index below is a single ordering hint for the operator's own review. It
// is not a published measurement, and no weight of it is returned: the platform shows
// influence bands, never formulas.

const VOTABLE = ['active', 'approved', 'winner', 'finalist'];

function normalise(values) {
  const nums = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!nums.length) return { min: 0, max: 0 };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

// The whole pool, not a page of it. A single filter call answers a capped slice, which
// silently hides the back of the field from the operator who is meant to be watching it.
async function listPool(service, scopedIds) {
  const query = {
    status: { $in: VOTABLE },
    $or: scopedIds.flatMap((id) => [{ season_ids: id }, { season_id: id }]),
  };
  const all = [];
  let cursor = null;
  let rounds = 0;
  while (rounds !== 40) {
    rounds += 1;
    const options = { sort: '-elo_rating', limit: 500 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.Nominee.filter(query, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
}

// Saved ballots, read to their end so the ledger can name every voter who cast one.
async function listSavedBallots(service, seasonQuery) {
  const all = [];
  let cursor = null;
  let rounds = 0;
  while (rounds !== 25) {
    rounds += 1;
    const options = { sort: '-created_date', limit: 200 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.RankedVote.filter(seasonQuery, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
}

const voterKey = (email, seasonId) => `${String(email || '').trim().toLowerCase()}|${seasonId}`;

// Every mark in the view, not a page of them. The baseline below is recomputed from the
// whole set, and a capped slice would score a different field than the one being watched.
async function listMarks(service, query) {
  const all = [];
  let cursor = null;
  let rounds = 0;
  while (rounds !== 8) {
    rounds += 1;
    const options = { sort: '-created_date', limit: 500 };
    if (cursor) options.cursor = cursor;
    const page = await service.entities.PairwiseVote.filter(query, options).catch(() => null);
    const items = page?.items || (Array.isArray(page) ? page : []);
    all.push(...items);
    if (!page?.has_more || !page?.next_cursor) break;
    cursor = page.next_cursor;
  }
  return all;
}

// Elo recomputed from the marks of one view alone, oldest first, everyone starting level.
// It is a reading, never a write: the internal view is the operator's own baseline, and
// no figure from it reaches a Fellow's record, a ladder, or a published number.
function eloFromMarks(marks) {
  const order = [...marks].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const ratings = new Map();
  const tally = new Map();
  const current = (id) => (ratings.has(id) ? ratings.get(id) : 1200);
  const bump = (id, won) => {
    const row = tally.get(id) || { wins: 0, losses: 0, appearances: 0 };
    row.appearances += 1;
    won ? (row.wins += 1) : (row.losses += 1);
    tally.set(id, row);
  };
  order.forEach((m) => {
    const w = m.winner_nominee_id;
    const l = m.loser_nominee_id;
    if (!w || !l) return;
    const rw = current(w);
    const rl = current(l);
    const expected = 1 / (1 + Math.pow(10, (rl - rw) / 400));
    const delta = Math.round(24 * (1 - expected));
    ratings.set(w, rw + delta);
    ratings.set(l, rl - delta);
    bump(w, true);
    bump(l, false);
  });
  return { ratings, tally };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body?.season_ids) ? body.season_ids.filter(Boolean) : [];
    // Two readings of the same ledger: the community's own record, or the internal
    // review sets an administrator cast. They are never mixed in one view, because a
    // baseline is only a baseline if nothing else is weighing inside it.
    const mode = body?.mode === 'internal' ? 'internal' : 'live';

    const service = base44.asServiceRole;
    const { cohorts, groups, open } = await resolveCohorts(service);

    // With no scope named, "every cohort" means every cohort that could be counting: the
    // open ones, or — before anything opens — the current ones. Archived editions hold
    // their own immutable pools and never weigh into a live total.
    const liveIds = (open.length ? open : cohorts.filter((c) => c.status !== 'archived')).map((c) => c.id);
    const scopedIds = requested.length ? requested : liveIds;
    const seasonQuery = { season_id: { $in: scopedIds } };

    // One row per cohort — the honest denominator. Counted where the ballot counts it
    // (link-model membership or the legacy pointer, never rejected), because the
    // standings page below is a top slice and cannot stand in for a pool size.
    const scopedCohorts = cohorts.filter((c) => scopedIds.includes(c.id));
    const labelById: Record<string, string> = {};
    cohorts.forEach((c) => { labelById[c.id] = c.cohort_label || c.name; });

    // The ballots already in the record, and the drafts the nominations hold beside them.
    // Both are read here so a cohort line and the ledger beneath it never disagree.
    const savedBallots = await listSavedBallots(service, seasonQuery);
    const savedKeys = new Set(savedBallots.map((b) => voterKey(b.voter_email, b.season_id)));
    const seededBallots = await resolveSeededBallots(service, scopedCohorts).catch(() => []);
    const openDrafts = seededBallots.filter((d) => !savedKeys.has(voterKey(d.voter_email, d.season_id)));

    const cohortStats = await Promise.all(
      scopedCohorts.map(async (c) => {
        // Marks are counted twice over: the ones the community cast, and the ones an
        // administrator cast walking the flow. A test set is recorded but never scored, so
        // it is counted apart rather than folded into the cohort's weight.
        const [pool, marks, testMarks, fellows] = await Promise.all([
          service.entities.Nominee
            .count({ status: { $in: VOTABLE }, $or: [{ season_ids: c.id }, { season_id: c.id }] })
            .catch(() => 0),
          service.entities.PairwiseVote.count({ season_id: c.id, is_test: { $ne: true } }).catch(() => 0),
          service.entities.PairwiseVote.count({ season_id: c.id, is_test: true }).catch(() => 0),
          service.entities.VotingContribution.count({ season_id: c.id }).catch(() => 0),
        ]);
        return {
          season_id: c.id,
          label: c.cohort_label || c.name,
          set_id: c.parent_season_id || c.id,
          set_name: c.parent_name || c.cohort_label || c.name,
          status: c.status,
          open: c.open,
          within_window: c.within_window,
          voting_start: c.voting_start,
          voting_end: c.voting_end,
          pool,
          ballots: savedBallots.filter((b) => b.season_id === c.id).length,
          seeded: openDrafts.filter((d) => d.season_id === c.id).length,
          comparisons: mode === 'internal' ? testMarks : marks,
          comparisons_live: marks,
          comparisons_test: testMarks,
          contributors: fellows,
        };
      })
    );

    // ── The tallies ──────────────────────────────────────────────────────────────
    const liveMarkQuery = { ...seasonQuery, is_test: { $ne: true } };
    const internalMarkQuery = { ...seasonQuery, is_test: true };
    const markQuery = mode === 'internal' ? internalMarkQuery : liveMarkQuery;

    const [liveMarkCount, internalMarkCount, contributorCount, contributions, marks, nominees] = await Promise.all([
      service.entities.PairwiseVote.count(liveMarkQuery).catch(() => 0),
      service.entities.PairwiseVote.count(internalMarkQuery).catch(() => 0),
      service.entities.VotingContribution.count({ season_id: { $in: scopedIds } }).catch(() => 0),
      service.entities.VotingContribution
        .filter({ season_id: { $in: scopedIds } }, '-xp', 60)
        .catch(() => []),
      // Every mark of this view: the baseline is scored from the whole set, and the ledger
      // prints its most recent page of them.
      listMarks(service, markQuery),
      listPool(service, scopedIds),
    ]);

    const comparisons = mode === 'internal' ? internalMarkCount : liveMarkCount;
    const ledger = marks.slice(0, 240);
    const baseline = eloFromMarks(marks);

    const ballots = savedBallots;
    const ballotCount = savedBallots.length;

    // ── Live standings ───────────────────────────────────────────────────────────
    const scoped = nominees.filter((n) => {
      const ids = [n.season_id, ...(n.season_ids || [])].filter(Boolean);
      return ids.some((id) => scopedIds.includes(id));
    });

    // Borda, read two ways. The recorded score is whatever the last scoring run wrote; the
    // projection is tallied here from the ballots in hand — the ones cast and the ones
    // seeded from nominations, read as if cast. A draft is never a vote: nothing below is
    // written anywhere, and no projection reaches a Fellow's surface or a published figure.
    const tallyBorda = (lists) => {
      const scores = new Map();
      lists.forEach((list) => {
        (Array.isArray(list) ? list : []).forEach((id, index) => {
          const points = Math.max(0, 100 - index);
          if (points > 0) scores.set(id, (scores.get(id) || 0) + points);
        });
      });
      return scores;
    };
    const castBorda = tallyBorda(ballots.map((b) => b.ballot));
    const projectedBorda = tallyBorda([
      ...ballots.map((b) => b.ballot),
      ...openDrafts.map((d) => d.nominee_ids),
    ]);

    const rows = scoped.map((n) => ({
      id: n.id,
      name: n.name,
      title: n.title || n.professional_role || null,
      company: n.company || n.organization || null,
      cohort: n.season_id || null,
      cohort_label: labelById[n.season_id] || null,
      avatar_url: n.avatar_url || n.photo_url || null,
      // The Elo column is scored from this view's marks alone, so the two readings can be
      // compared like for like. The recorded rating travels beside it for reference.
      elo: baseline.ratings.get(n.id) || 1200,
      elo_recorded: n.elo_rating || 1200,
      borda: n.borda_score || 0,
      borda_cast: castBorda.get(n.id) || 0,
      borda_projected: projectedBorda.get(n.id) || 0,
      holistic: n.holistic_score || 0,
      wins: baseline.tally.get(n.id)?.wins || 0,
      losses: baseline.tally.get(n.id)?.losses || 0,
      appearances: baseline.tally.get(n.id)?.appearances || 0,
      claimed: n.claim_status === 'approved',
    }));

    const e = normalise(rows.map((r) => r.elo));
    // The hint reads the projected Borda, so the board is meaningful before the first
    // ballot is filed. It stays a projection: an ordering to review, never a result.
    const b = normalise(rows.map((r) => r.borda_projected));
    const h = normalise(rows.map((r) => r.holistic));
    const norm = (v, range) =>
      range.max === range.min ? 0 : (v - range.min) / (range.max - range.min);

    const standings = rows
      .map((r) => {
        const index =
          (0.4 * norm(r.elo, e) + 0.35 * norm(r.borda_projected, b) + 0.25 * norm(r.holistic, h)) * 100;
        return { ...r, combined_index: Math.round(index * 10) / 10 };
      })
      .sort((x, y) => y.combined_index - x.combined_index)
      .map((r, i) => ({ ...r, position: i + 1 }));

    // ── Ballot tracking ──────────────────────────────────────────────────────────
    // Every voter identity on record, resolved once: the ballots, the drafts standing
    // from nominations, and the voter named against each pairwise mark.
    const voterEmails = Array.from(
      new Set(
        [
          ...ballots.map((x) => x.voter_email),
          ...openDrafts.map((x) => x.voter_email),
          ...ledger.map((x) => x.voter_email),
        ].filter(Boolean)
      )
    );
    const voters = voterEmails.length
      ? await service.entities.User
          .filter({ email: { $in: voterEmails } })
          .catch(() => [])
      : [];
    const names: Record<string, string> = {};
    voters.forEach((u) => {
      if (u.email) names[String(u.email).toLowerCase()] = u.full_name || u.email;
    });
    const nameOf = (email) => names[String(email || '').toLowerCase()] || email || 'Unknown voter';

    const ballotTracking = [
      ...ballots.map((x) => ({
        id: x.id,
        voter_email: x.voter_email,
        voter_name: nameOf(x.voter_email),
        season_id: x.season_id,
        cohort: labelById[x.season_id] || null,
        length: Array.isArray(x.ballot) ? x.ballot.length : 0,
        state: 'Cast',
        source: 'saved',
        submitted_at: x.created_date,
        updated_at: x.updated_date,
      })),
      ...openDrafts.map((x) => ({
        id: `seed:${x.voter_email}:${x.season_id}`,
        voter_email: x.voter_email,
        voter_name: nameOf(x.voter_email),
        season_id: x.season_id,
        cohort: x.cohort || labelById[x.season_id] || null,
        length: x.count,
        state: 'Seeded',
        source: 'nominations',
        submitted_at: null,
        updated_at: null,
        nominated_at: x.last_at || x.first_at || null,
      })),
    ].sort((a, b) => {
      const at = (row) => new Date(row.submitted_at || row.nominated_at || 0).getTime();
      return at(b) - at(a);
    });

    // ── The pairwise ledger ──────────────────────────────────────────────────────
    const nominatedIds = Array.from(
      new Set(ledger.flatMap((v) => [v.winner_nominee_id, v.loser_nominee_id]).filter(Boolean))
    );
    const named = nominatedIds.length
      ? await service.entities.Nominee
          .filter({ id: { $in: nominatedIds } })
          .catch(() => [])
      : [];
    const nomineeNames = named.reduce((acc, n) => {
      acc[n.id] = n.name || 'Unknown nominee';
      return acc;
    }, {});

    // One anchor set is five to seven marks written at the same instant by one voter, so
    // the voter and the write time name the set: the ledger is read set by set, not mark
    // by mark, because that is the unit a Fellow actually cast.
    const ledgerRows = ledger.map((v) => ({
      id: v.id,
      at: v.created_date,
      set_key: `${String(v.voter_email || '').toLowerCase()}|${v.created_date}`,
      is_test: !!v.is_test,
      voter_role: v.voter_role || null,
      voter_email: v.voter_email,
      voter_name: nameOf(v.voter_email),
      winner: nomineeNames[v.winner_nominee_id] || 'Deleted nominee',
      loser: nomineeNames[v.loser_nominee_id] || 'Deleted nominee',
      season_id: v.season_id,
      cohort: labelById[v.season_id] || null,
    }));

    // ── Contribution ladder ──────────────────────────────────────────────────────
    const ladder = LEVELS.map((step) => ({
      level: step.level,
      name: step.name,
      at: step.at,
      fellows: contributions.filter((c) => (c.level || 1) === step.level).length,
    }));

    const contributors = contributions.slice(0, 40).map((c) => ({
      fellow_email: c.fellow_email,
      fellow_name: c.fellow_name || c.fellow_email,
      xp: c.xp || 0,
      level: c.level || 1,
      level_name: c.level_name || null,
      sets_completed: c.sets_completed || 0,
      ballots_saved: c.ballots_saved || 0,
      comparisons_recorded: c.comparisons_recorded || 0,
      milestones: c.milestones || [],
      last_action_at: c.last_action_at || null,
    }));

    return Response.json({
      success: true,
      generated_at: new Date().toISOString(),
      mode,
      scope: { season_ids: scopedIds, requested },
      cohorts,
      groups,
      cohort_stats: cohortStats,
      open_count: open.length,
      totals: {
        cohorts: cohorts.length,
        open_cohorts: open.length,
        comparisons,
        comparisons_live: liveMarkCount,
        comparisons_test: internalMarkCount,
        contributors: contributorCount,
        ballots: ballotCount,
        seeded: openDrafts.length,
        ballots_on_record: ballotCount + openDrafts.length,
        pool: cohortStats.reduce((n, c) => n + c.pool, 0),
        votes_per_contributor:
          contributorCount > 0 ? Math.round((comparisons / contributorCount) * 10) / 10 : 0,
      },
      standings,
      ballot_tracking: ballotTracking,
      ledger: ledgerRows,
      ladder,
      milestones: ALL_MILESTONES,
      contributors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
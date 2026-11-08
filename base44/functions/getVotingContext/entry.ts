import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveCohorts, windowState } from '../../shared/votingWindow.ts';
import { levelFor, milestonesFor, nextMilestoneFor, ALL_MILESTONES, XP_PER_SET } from '../../shared/votingProgress.ts';
import { MARKS_PER_SITTING } from '../../shared/ballotMeasurement.ts';

// Everything the ballot needs to open, in one call: which cohorts are counting, and where
// the window stands, the Fellow's saved ballot, and the contribution ladder they have
// already climbed. The ladder arrives by name — every mark on it is one the house calls
// something (see shared/votingProgress.ts) — so the ballot never has to say "the 25-set mark".
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const service = base44.asServiceRole;
    const now = new Date();
    const { cohorts, groups, open } = await resolveCohorts(service, now);

    // The season a ballot is recorded against: the first open cohort, or the open
    // cohort named by the caller.
    const body = await req.json().catch(() => ({}));
    const requested = body?.season_id || null;
    const target =
      open.find((c) => c.id === requested) ||
      open[0] ||
      null;

    const seasons = [target?.id, ...open.map((c) => c.id)].filter(Boolean);
    const uniqueSeasons = Array.from(new Set(seasons));

    const [contributions, rankedVotes] = await Promise.all([
      uniqueSeasons.length
        ? service.entities.VotingContribution
            .filter({ fellow_email: user.email, season_id: { $in: uniqueSeasons } })
            .catch(() => [])
        : Promise.resolve([]),
      target
        ? service.entities.RankedVote
            .filter({ voter_email: user.email, season_id: target.id })
            .catch(() => [])
        : Promise.resolve([]),
    ]);

    // Totals across every season this Fellow has contributed in, so the ladder does
    // not reset when a cohort rolls over.
    const totals = (contributions || []).reduce(
      (acc, c) => ({
        xp: acc.xp + (c.xp || 0),
        sets: acc.sets + (c.sets_completed || 0),
        ballots: acc.ballots + (c.ballots_saved || 0),
        comparisons: acc.comparisons + (c.comparisons_recorded || 0),
        milestones: Array.from(new Set([...acc.milestones, ...(c.milestones || [])])),
      }),
      { xp: 0, sets: 0, ballots: 0, comparisons: 0, milestones: [] }
    );

    // The tester's own lane, kept apart from the Fellow's: a walkthrough of the ballot
    // climbs this one and never the ladder above.
    const testTotals = (contributions || []).reduce(
      (acc, c) => ({
        xp: acc.xp + (c.test_xp || 0),
        sets: acc.sets + (c.test_sets_completed || 0),
        comparisons: acc.comparisons + (c.test_comparisons_recorded || 0),
      }),
      { xp: 0, sets: 0, comparisons: 0 }
    );

    // The ledger is the ground truth. Every recorded review writes seven comparisons
    // against the voter, stamped test or not, so the count is read back from the votes
    // themselves: a ladder row that was never written (or written by an older recorder)
    // can no longer hold the tally at zero.
    const ledgerQuery = (isTest) => ({
      voter_email: user.email,
      is_test: isTest ? true : { $ne: true },
      ...(uniqueSeasons.length ? { season_id: { $in: uniqueSeasons } } : {}),
    });
    const [fellowVotes, testVotes] = uniqueSeasons.length
      ? await Promise.all([
          service.entities.PairwiseVote.count(ledgerQuery(false)).catch(() => 0),
          service.entities.PairwiseVote.count(ledgerQuery(true)).catch(() => 0),
        ])
      : [0, 0];
    // The mark count of a sitting, read from the one definition the monitors are built on
    // (shared/ballotMeasurement.ts) rather than typed in here a second time.
    const COMPARISONS_PER_REVIEW = MARKS_PER_SITTING;
    totals.sets = Math.max(totals.sets, Math.floor(fellowVotes / COMPARISONS_PER_REVIEW));
    totals.comparisons = Math.max(totals.comparisons, fellowVotes);
    // Experience is sets measured, and only sets measured — so it is counted from the
    // ledger rather than read back off a stored figure that a retired ladder may have
    // inflated.
    totals.xp = totals.sets * XP_PER_SET;
    testTotals.sets = Math.max(testTotals.sets, Math.floor(testVotes / COMPARISONS_PER_REVIEW));
    testTotals.comparisons = Math.max(testTotals.comparisons, testVotes);
    testTotals.xp = testTotals.sets * XP_PER_SET;

    const level = levelFor(totals.xp);
    const fellowLane = {
      ...level,
      sets_completed: totals.sets,
      ballots_saved: totals.ballots,
      comparisons_recorded: totals.comparisons,
      milestones: totals.milestones,
      next_milestone: nextMilestoneFor(totals.sets),
    };
    // The house's own testers climb a ladder of their own. Their reviews are stamped as
    // tests and never move the field, so their experience is kept apart from the
    // community's: the lane an internal tester sees is theirs alone.
    const tester = user.role === 'admin';
    const testLane = {
      ...levelFor(testTotals.xp),
      sets_completed: testTotals.sets,
      ballots_saved: 0,
      comparisons_recorded: testTotals.comparisons,
      milestones: milestonesFor(testTotals.sets, 0),
      next_milestone: nextMilestoneFor(testTotals.sets),
    };

    return Response.json({
      success: true,
      now: now.toISOString(),
      open: open.length > 0,
      cohorts: cohorts.map((c) => ({
        id: c.id,
        name: c.name,
        cohort_key: c.cohort_key,
        cohort_label: c.cohort_label,
        status: c.status,
        open: c.open,
        voting_end: c.voting_end,
        voting_start: c.voting_start,
      })),
      groups,
      target,
      ballot: rankedVotes?.[0]?.ballot || [],
      progress: {
        // The caller's own lane, already chosen: a tester reads the tester ladder, a
        // Fellow reads the community's. The surface never has to pick.
        ...(tester ? testLane : fellowLane),
        lane: tester ? 'test' : 'fellow',
        ladder: ALL_MILESTONES,
        fellow: fellowLane,
        test: testLane,
        by_season: (contributions || []).map((c) => ({
          season_id: c.season_id,
          xp: c.xp || 0,
          sets_completed: c.sets_completed || 0,
          ballots_saved: c.ballots_saved || 0,
          last_action_at: c.last_action_at || null,
        })),
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
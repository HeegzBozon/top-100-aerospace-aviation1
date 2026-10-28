import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveCohorts, windowState } from '../../shared/votingWindow.ts';
import { levelFor, ALL_MILESTONES } from '../../shared/votingProgress.ts';

// Everything the ballot needs to open, in one call: which cohorts are counting, and where
// the window stands, the Fellow's saved ballot, and the contribution ladder they have
// already climbed.
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

    const level = levelFor(totals.xp);

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
        ...level,
        sets_completed: totals.sets,
        ballots_saved: totals.ballots,
        comparisons_recorded: totals.comparisons,
        milestones: totals.milestones,
        ladder: ALL_MILESTONES,
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
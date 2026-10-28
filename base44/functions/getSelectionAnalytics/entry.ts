import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveCohorts } from '../../shared/votingWindow.ts';
import { LEVELS, ALL_MILESTONES } from '../../shared/votingProgress.ts';

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

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const requested = Array.isArray(body?.season_ids) ? body.season_ids.filter(Boolean) : [];

    const service = base44.asServiceRole;
    const { cohorts, groups, open } = await resolveCohorts(service);

    const scopedIds = requested.length ? requested : cohorts.map((c) => c.id);
    const seasonQuery = { season_id: { $in: scopedIds } };

    // ── The tallies ──────────────────────────────────────────────────────────────
    const [
      comparisons,
      contributorCount,
      ballotCount,
      contributions,
      ballots,
      ledger,
      nominees,
    ] = await Promise.all([
      service.entities.PairwiseVote.count(seasonQuery).catch(() => 0),
      service.entities.VotingContribution.count({ season_id: { $in: scopedIds } }).catch(() => 0),
      service.entities.RankedVote.count({ season_id: { $in: scopedIds } }).catch(() => 0),
      service.entities.VotingContribution
        .filter({ season_id: { $in: scopedIds } }, '-xp', 60)
        .catch(() => []),
      service.entities.RankedVote
        .filter({ season_id: { $in: scopedIds } }, '-created_date', 60)
        .catch(() => []),
      service.entities.PairwiseVote
        .filter(seasonQuery, '-created_date', 25)
        .catch(() => []),
      service.entities.Nominee
        .filter({ status: { $in: VOTABLE } }, '-elo_rating', 250)
        .catch(() => []),
    ]);

    // ── Live standings ───────────────────────────────────────────────────────────
    const scoped = requested.length
      ? nominees.filter((n) => {
          const ids = [n.season_id, ...(n.season_ids || [])].filter(Boolean);
          return ids.some((id) => scopedIds.includes(id)) ||
            Array.isArray(n.raw_nomination_data?.season_participation);
        })
      : nominees;

    const rows = scoped.map((n) => ({
      id: n.id,
      name: n.name,
      title: n.title || n.professional_role || null,
      company: n.company || n.organization || null,
      cohort: n.season_id || null,
      avatar_url: n.avatar_url || n.photo_url || null,
      elo: n.elo_rating || 1200,
      borda: n.borda_score || 0,
      holistic: n.holistic_score || 0,
      wins: n.total_wins || 0,
      losses: n.total_losses || 0,
      appearances: n.pairwise_appearance_count || 0,
      claimed: n.claim_status === 'approved',
    }));

    const e = normalise(rows.map((r) => r.elo));
    const b = normalise(rows.map((r) => r.borda));
    const h = normalise(rows.map((r) => r.holistic));
    const norm = (v, range) =>
      range.max === range.min ? 0 : (v - range.min) / (range.max - range.min);

    const standings = rows
      .map((r) => {
        const index =
          (0.4 * norm(r.elo, e) + 0.35 * norm(r.borda, b) + 0.25 * norm(r.holistic, h)) * 100;
        return { ...r, combined_index: Math.round(index * 10) / 10 };
      })
      .sort((x, y) => y.combined_index - x.combined_index)
      .slice(0, 50)
      .map((r, i) => ({ ...r, position: i + 1 }));

    // ── Ballot tracking ──────────────────────────────────────────────────────────
    const ballotEmails = Array.from(new Set(ballots.map((x) => x.voter_email).filter(Boolean)));
    const voters = ballotEmails.length
      ? await service.entities.User
          .filter({ email: { $in: ballotEmails } })
          .catch(() => [])
      : [];
    const names = voters.reduce((acc, u) => {
      acc[u.email] = u.full_name || u.email;
      return acc;
    }, {});

    const ballotTracking = ballots.map((x) => ({
      id: x.id,
      voter_email: x.voter_email,
      voter_name: names[x.voter_email] || x.voter_email,
      season_id: x.season_id,
      length: Array.isArray(x.ballot) ? x.ballot.length : 0,
      submitted_at: x.created_date,
      updated_at: x.updated_date,
    }));

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

    const ledgerRows = ledger.map((v) => ({
      id: v.id,
      at: v.created_date,
      voter_email: v.voter_email,
      winner: nomineeNames[v.winner_nominee_id] || 'Deleted nominee',
      loser: nomineeNames[v.loser_nominee_id] || 'Deleted nominee',
      season_id: v.season_id,
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
      scope: { season_ids: scopedIds, requested },
      cohorts,
      groups,
      open_count: open.length,
      totals: {
        cohorts: cohorts.length,
        open_cohorts: open.length,
        comparisons,
        contributors: contributorCount,
        ballots: ballotCount,
        pool: rows.length,
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
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Standard ELO expected score (zero-sum per comparison).
function expectedScore(ra, rb) {
  return 1 / (1 + Math.pow(10, (rb - ra) / 400));
}

// An "anchor selection" is one Fellow judging four nominees: tap the one to
// advance FIRST, then tap the one to advance LAST. That yields 5 observed
// pairwise comparisons — top beats each of the other three, and each of the
// two middle nominees beats the bottom. The 1 middle-vs-middle edge is
// intentionally NOT imputed (Bradley-Terry handles the missing edge natively).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { top_nominee_id, bottom_nominee_id, neutral_nominee_ids, season_id } = await req.json();
    if (!top_nominee_id || !bottom_nominee_id || !season_id) {
      return Response.json({ error: 'Missing required parameters.' }, { status: 400 });
    }
    const neutrals = Array.isArray(neutral_nominee_ids) ? neutral_nominee_ids.filter(Boolean) : [];
    if (neutrals.length !== 2) {
      return Response.json({ error: 'Exactly two neutral nominees are required.' }, { status: 400 });
    }

    const ids = [top_nominee_id, ...neutrals, bottom_nominee_id];
    if (new Set(ids).size !== 4) {
      return Response.json({ error: 'All four nominees must be distinct.' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const fetched = await Promise.all(ids.map((id) => service.entities.Nominee.get(id)));
    const nominees = {};
    fetched.forEach((n, i) => { nominees[ids[i]] = n; });
    for (const id of ids) {
      if (!nominees[id]) return Response.json({ error: 'Nominee not found: ' + id }, { status: 404 });
    }

    // In-memory ELO snapshot so all 7 comparisons apply to a consistent baseline.
    const elo = {};
    const wins = {};
    const losses = {};
    const apps = {};
    ids.forEach((id) => {
      elo[id] = nominees[id].elo_rating || 1200;
      wins[id] = nominees[id].total_wins || 0;
      losses[id] = nominees[id].total_losses || 0;
      apps[id] = nominees[id].pairwise_appearance_count || 0;
    });

    const K = 32;
    const comparisons = [];
    function apply(winnerId, loserId) {
      const eW = expectedScore(elo[winnerId], elo[loserId]);
      const delta = Math.round(K * (1 - eW));
      elo[winnerId] += delta;
      elo[loserId] -= delta;
      wins[winnerId] += 1;
      losses[loserId] += 1;
      apps[winnerId] += 1;
      apps[loserId] += 1;
      comparisons.push([winnerId, loserId]);
    }

    // top > each neutral (3), top > bottom (1), each neutral > bottom (3) = 7
    neutrals.forEach((nid) => apply(top_nominee_id, nid));
    apply(top_nominee_id, bottom_nominee_id);
    neutrals.forEach((nid) => apply(nid, bottom_nominee_id));

    const voteRecords = comparisons.map(([w, l]) => ({
      voter_email: user.email,
      winner_nominee_id: w,
      loser_nominee_id: l,
      season_id,
    }));

    await Promise.all([
      service.entities.PairwiseVote.bulkCreate(voteRecords),
      ...ids.map((id) => service.entities.Nominee.update(id, {
        elo_rating: elo[id],
        aura_score: elo[id],
        total_wins: wins[id],
        total_losses: losses[id],
        pairwise_appearance_count: apps[id],
      })),
    ]);

    const ratings = {};
    ids.forEach((id) => { ratings[id] = elo[id]; });

    return Response.json({ success: true, comparisons: comparisons.length, ratings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
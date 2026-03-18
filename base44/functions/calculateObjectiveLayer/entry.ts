import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { nominee_id } = await req.json();

    const nominees = await base44.asServiceRole.entities.Nominee.filter({ id: nominee_id });
    if (!nominees || nominees.length === 0) {
      return Response.json({ error: 'Nominee not found' }, { status: 404 });
    }
    const nominee = nominees[0];

    // Extract metrics objects
    const impact = nominee.impact_metrics || {};
    const leadership = nominee.leadership_metrics || {};
    const innovation = nominee.innovation_metrics || {};
    const community = nominee.community_metrics || {};
    const trajectory = nominee.trajectory_metrics || {};

    // Impact score (0-20)
    let impactScore = 0;
    impactScore += Math.min(10, (impact.patents_count || 0) * 2);
    impactScore += Math.min(5, (impact.citations_count || 0) / 10);
    impactScore += Math.min(5, (impact.missions_flown || 0) * 2);

    // Leadership score (0-20)
    let leadershipScore = 0;
    leadershipScore += Math.min(10, (leadership.team_size_managed || 0) / 5);
    leadershipScore += Math.min(5, (leadership.budget_responsibility || 0) / 1000000);
    leadershipScore += Math.min(5, (leadership.awards?.length || 0) * 2);

    // Innovation score (0-20)
    let innovationScore = 0;
    innovationScore += Math.min(10, (innovation.patents_filed || 0) * 2);
    innovationScore += Math.min(5, (innovation.startups_founded || 0) * 5);
    innovationScore += Math.min(5, (innovation.tech_commercialized?.length || 0) * 2);

    // Community score (0-20)
    let communityScore = 0;
    communityScore += Math.min(10, (community.mentorship_hours || 0) / 10);
    communityScore += Math.min(5, (community.speaking_engagements || 0) * 1);
    communityScore += Math.min(5, (community.board_memberships?.length || 0) * 2);

    // Trajectory score (0-20)
    let trajectoryScore = 0;
    trajectoryScore += Math.min(10, (trajectory.promotion_velocity || 0) * 5);
    trajectoryScore += Math.min(5, (trajectory.funding_raised || 0) / 1000000);
    trajectoryScore += Math.min(5, (trajectory.momentum_score || 0) / 20);

    // Total score (0-100)
    const score = impactScore + leadershipScore + innovationScore + communityScore + trajectoryScore;

    return Response.json({
      score: Math.round(score * 100) / 100,
      breakdown: {
        impact: impactScore,
        leadership: leadershipScore,
        innovation: innovationScore,
        community: communityScore,
        trajectory: trajectoryScore
      }
    });

  } catch (error) {
    console.error('Error calculating objective layer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
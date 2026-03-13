import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      nominee_id,
      mini_game_type,
      technical_excellence,
      innovation_impact,
      leadership_influence,
      community_contribution,
      future_potential,
      evaluation_context
    } = await req.json();

    // Calculate weighted score
    // Technical 25%, Innovation 25%, Leadership 20%, Community 15%, Future 15%
    const weighted_score = (
      (technical_excellence * 0.25) +
      (innovation_impact * 0.25) +
      (leadership_influence * 0.20) +
      (community_contribution * 0.15) +
      (future_potential * 0.15)
    );

    // Save evaluation
    const evaluation = await base44.asServiceRole.entities.NomineeEvaluation.create({
      nominee_id,
      evaluator_email: user.email,
      mini_game_type,
      technical_excellence,
      innovation_impact,
      leadership_influence,
      community_contribution,
      future_potential,
      weighted_score,
      evaluation_context: evaluation_context || {}
    });

    // Update nominee aggregate scores
    const allEvaluations = await base44.asServiceRole.entities.NomineeEvaluation.filter({
      nominee_id
    });

    if (allEvaluations.length > 0) {
      const avgTechnical = allEvaluations.reduce((sum, e) => sum + e.technical_excellence, 0) / allEvaluations.length;
      const avgInnovation = allEvaluations.reduce((sum, e) => sum + e.innovation_impact, 0) / allEvaluations.length;
      const avgLeadership = allEvaluations.reduce((sum, e) => sum + e.leadership_influence, 0) / allEvaluations.length;
      const avgCommunity = allEvaluations.reduce((sum, e) => sum + e.community_contribution, 0) / allEvaluations.length;
      const avgFuture = allEvaluations.reduce((sum, e) => sum + e.future_potential, 0) / allEvaluations.length;
      const avgWeighted = allEvaluations.reduce((sum, e) => sum + e.weighted_score, 0) / allEvaluations.length;

      await base44.asServiceRole.entities.Nominee.update(nominee_id, {
        rubric_technical_excellence: avgTechnical,
        rubric_innovation_impact: avgInnovation,
        rubric_leadership_influence: avgLeadership,
        rubric_community_contribution: avgCommunity,
        rubric_future_potential: avgFuture,
        rubric_weighted_score: avgWeighted,
        rubric_evaluation_count: allEvaluations.length
      });
    }

    return Response.json({ 
      success: true, 
      evaluation,
      insight_awarded: 25
    });

  } catch (error) {
    console.error('Error saving evaluation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
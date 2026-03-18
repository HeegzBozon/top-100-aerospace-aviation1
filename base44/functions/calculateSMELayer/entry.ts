import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { nominee_id } = await req.json();

    // Get all SME evaluations for this nominee
    const evaluations = await base44.asServiceRole.entities.SMEEvaluation.filter({ 
      nominee_id,
      status: 'approved'
    });

    if (!evaluations || evaluations.length === 0) {
      // No SME evaluations yet - return neutral score
      return Response.json({
        score: 50,
        breakdown: {
          count: 0,
          average: 50,
          confidence: 0
        }
      });
    }

    // Calculate weighted average based on confidence
    let totalScore = 0;
    let totalWeight = 0;

    evaluations.forEach(evaluation => {
      const avgScore = (
        (evaluation.impact_score || 5) +
        (evaluation.leadership_score || 5) +
        (evaluation.innovation_score || 5) +
        (evaluation.community_score || 5) +
        (evaluation.trajectory_score || 5)
      ) / 5;

      const confidence = evaluation.confidence_level || 0.5;
      totalScore += avgScore * confidence * 10; // Convert 1-10 to 0-100
      totalWeight += confidence;
    });

    const score = totalWeight > 0 ? totalScore / totalWeight : 50;

    return Response.json({
      score: Math.round(score * 100) / 100,
      breakdown: {
        count: evaluations.length,
        average: Math.round((totalScore / totalWeight) * 100) / 100,
        confidence: Math.round((totalWeight / evaluations.length) * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error calculating SME layer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nominee_id } = await req.json();

    // Fetch nominee data
    const nominees = await base44.asServiceRole.entities.Nominee.filter({ id: nominee_id });
    if (!nominees || nominees.length === 0) {
      return Response.json({ error: 'Nominee not found' }, { status: 404 });
    }
    const nominee = nominees[0];

    // Calculate each layer in parallel
    const [
      perceptionScore,
      objectiveScore,
      smeScore,
      narrativeScore,
      normalizationScore
    ] = await Promise.all([
      base44.asServiceRole.functions.invoke('calculatePerceptionLayer', { nominee_id }),
      base44.asServiceRole.functions.invoke('calculateObjectiveLayer', { nominee_id }),
      base44.asServiceRole.functions.invoke('calculateSMELayer', { nominee_id }),
      base44.asServiceRole.functions.invoke('calculateNarrativeLayer', { nominee_id }),
      base44.asServiceRole.functions.invoke('calculateNormalizationLayer', { nominee_id })
    ]);

    // Extract scores
    const perception = perceptionScore.data.score || 0;
    const objective = objectiveScore.data.score || 0;
    const sme = smeScore.data.score || 0;
    const narrative = narrativeScore.data.score || 0;
    const normalization = normalizationScore.data.score || 0;

    // Calculate final holistic score (weighted average)
    const holistic_score = (
      perception * 0.30 +
      objective * 0.30 +
      sme * 0.20 +
      narrative * 0.10 +
      normalization * 0.10
    );

    // Update nominee with all scores
    await base44.asServiceRole.entities.Nominee.update(nominee_id, {
      perception_layer_score: perception,
      objective_layer_score: objective,
      sme_layer_score: sme,
      narrative_layer_score: narrative,
      normalization_layer_score: normalization,
      holistic_score
    });

    return Response.json({
      success: true,
      nominee_id,
      scores: {
        perception,
        objective,
        sme,
        narrative,
        normalization,
        holistic_score
      }
    });

  } catch (error) {
    console.error('Error calculating holistic score:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
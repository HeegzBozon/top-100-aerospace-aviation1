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

    // Check if narrative analysis already exists
    if (nominee.narrative_analysis && nominee.narrative_analysis.arc_strength) {
      const analysis = nominee.narrative_analysis;
      const score = (
        (analysis.arc_strength || 50) * 0.30 +
        (analysis.clarity_score || 50) * 0.30 +
        (analysis.persuasion_strength || 50) * 0.25 +
        (analysis.domain_mastery || 50) * 0.15
      );
      return Response.json({ score: Math.round(score * 100) / 100 });
    }

    // Analyze bio text using AI
    const bioText = nominee.bio || nominee.description || '';
    
    if (!bioText || bioText.length < 50) {
      return Response.json({ score: 30 }); // Minimal score for incomplete bio
    }

    // Use LLM for narrative analysis
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze this aerospace/aviation professional's biography for narrative strength. Return scores 0-100 for:
1. Arc strength (hero's journey, overcoming challenges)
2. Clarity (clear communication, structure)
3. Persuasion strength (compelling, influential)
4. Domain mastery (technical depth, expertise signals)

Biography:
${bioText}

Return ONLY a JSON object with these four scores.`,
      response_json_schema: {
        type: "object",
        properties: {
          arc_strength: { type: "number" },
          clarity_score: { type: "number" },
          persuasion_strength: { type: "number" },
          domain_mastery: { type: "number" }
        }
      }
    });

    const analysis = response;

    // Save analysis to nominee
    await base44.asServiceRole.entities.Nominee.update(nominee_id, {
      narrative_analysis: analysis
    });

    // Calculate weighted score
    const score = (
      analysis.arc_strength * 0.30 +
      analysis.clarity_score * 0.30 +
      analysis.persuasion_strength * 0.25 +
      analysis.domain_mastery * 0.15
    );

    return Response.json({
      score: Math.round(score * 100) / 100,
      breakdown: analysis
    });

  } catch (error) {
    console.error('Error calculating narrative layer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
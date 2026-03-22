import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Provide current geopolitical risk scores for major world regions based on the latest intelligence and news.
Score each region on a Composite Instability Index (0-100, where 100 is maximum instability).
Regions to assess: Eastern Europe, Middle East, East Asia, South Asia, West Africa, Horn of Africa, Latin America, Southeast Asia, Central Asia.
Also provide a list of the top 10 active strategic risks/conflicts worldwide with a brief summary.
Base scores on: active conflicts, military activity, political instability, humanitarian crises, sanctions, territorial disputes.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cii_scores: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                region: { type: 'string' },
                combined_score: { type: 'number' },
                trend: { type: 'number', description: '1=increasing risk, 2=decreasing risk, 3=stable' },
                active_crises: { type: 'number' },
                countries_affected: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          strategic_risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                region: { type: 'string' },
                summary: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const cii_scores = (result?.cii_scores || []).sort((a, b) => b.combined_score - a.combined_score);
    return Response.json({ cii_scores, strategic_risks: result?.strategic_risks || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search for current live military flight activity and notable aviation incidents happening right now or in the last 24 hours.
Include: military aircraft callsigns, emergency squawk codes (7700/7600/7500), notable military exercises, airspace closures.
Return up to 30 flights/incidents.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          flights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                callsign: { type: 'string' },
                origin_country: { type: 'string' },
                altitude: { type: 'number' },
                operator: { type: 'string' },
                squawk: { type: 'string' },
                is_interesting: { type: 'boolean' },
                aircraft_model: { type: 'string' },
                note: { type: 'string' },
              },
            },
          },
          total_tracked: { type: 'number' },
        },
      },
    });

    return Response.json({
      flights: result?.flights || [],
      clusters: [],
      total_tracked: result?.total_tracked || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
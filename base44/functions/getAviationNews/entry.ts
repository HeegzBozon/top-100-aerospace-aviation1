import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search for the latest aerospace and aviation news from the last 48 hours. 
Include news about: Boeing, Airbus, NASA, SpaceX, FAA, ICAO, military aviation, commercial airlines, satellite launches, space missions.
Return exactly 20 news items. For each item, include: title, snippet (2 sentence summary), url (real URL if available), source_name, published_at (ISO date), and matched_entities (array of relevant entities from: boeing, airbus, nasa, spacex, faa, icao, aviation, aerospace, satellite, rocket, space, launch, military, defense).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                snippet: { type: 'string' },
                url: { type: 'string' },
                source_name: { type: 'string' },
                published_at: { type: 'string' },
                matched_entities: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    });

    return Response.json({ items: result?.items || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search for current GPS jamming and GNSS interference events happening in the last 7 days worldwide.
Focus on regions with known jamming activity: Eastern Europe (Ukraine/Russia border), Middle East (Israel/Lebanon/Syria), Eastern Mediterranean, Baltic region, GPS spoofing incidents.
Return all detected interference events with location and severity details.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                region: { type: 'string' },
                location_name: { type: 'string' },
                type: { type: 'string', description: 'GNSS Jamming, GPS Spoofing, GNSS Interference, etc.' },
                severity: { type: 'string', description: 'low, medium, or high' },
                detected_at: { type: 'string', description: 'ISO date' },
                longitude: { type: 'number' },
                latitude: { type: 'number' },
              },
            },
          },
        },
      },
    });

    return Response.json({ events: result?.events || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
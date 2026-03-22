import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Provide a current list of notable active satellites in orbit. Include military reconnaissance satellites, weather satellites, space stations, and recently launched satellites from 2024-2025.
Return 40 satellites with their details.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          satellites: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                country: { type: 'string' },
                type: { type: 'string', description: 'One of: military, weather, communication, station, reconnaissance, navigation' },
                alt: { type: 'number', description: 'Orbital altitude in km' },
                inclination: { type: 'number' },
                launch_date: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json({ satellites: result?.satellites || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
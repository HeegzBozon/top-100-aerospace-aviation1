import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Provide a comprehensive news digest for today covering these 4 categories:
1. aerospace: Latest commercial and civil aviation news, airline industry, aircraft, airports
2. space: Space launches, satellites, NASA, SpaceX, ESA, space stations, Mars/Moon missions  
3. defense: Military aviation, defense contracts, weapons systems, air forces worldwide
4. geopolitics: International conflicts, diplomatic tensions, sanctions, border disputes relevant to aerospace/aviation

Return 15 news items per category. Each item should have a title, link (real URL if known), source, published_at, and threat level (1=low, 2=medium, 3=high, 4=critical) for defense/geopolitics items.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          categories: {
            type: 'object',
            properties: {
              aerospace: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        link: { type: 'string' },
                        source: { type: 'string' },
                        published_at: { type: 'string' },
                        location_name: { type: 'string' },
                        threat: {
                          type: 'object',
                          properties: { level: { type: 'number' } },
                        },
                      },
                    },
                  },
                },
              },
              space: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        link: { type: 'string' },
                        source: { type: 'string' },
                        published_at: { type: 'string' },
                        threat: {
                          type: 'object',
                          properties: { level: { type: 'number' } },
                        },
                      },
                    },
                  },
                },
              },
              defense: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        link: { type: 'string' },
                        source: { type: 'string' },
                        published_at: { type: 'string' },
                        location_name: { type: 'string' },
                        threat: {
                          type: 'object',
                          properties: { level: { type: 'number' } },
                        },
                      },
                    },
                  },
                },
              },
              geopolitics: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        link: { type: 'string' },
                        source: { type: 'string' },
                        published_at: { type: 'string' },
                        location_name: { type: 'string' },
                        threat: {
                          type: 'object',
                          properties: { level: { type: 'number' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return Response.json({ categories: result?.categories || {} });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// POST /v1/flights — 7-area batch query for live ADS-B positions.
// 4 launch corridors (Cape Canaveral, Boca Chica, Vandenberg, Mahia) +
// 3 active conflict theaters (Eastern Med, Baltic, Black Sea).
// Cache TTL: 30 seconds — callers may impose their own in-memory cache.

const AREAS = [
  { alias: 'cape_canaveral', by: 'radius', la: 28.3922,  lo: -80.6077,  rad: 200, unit: 'km' },
  { alias: 'boca_chica',     by: 'radius', la: 25.9969,  lo: -97.1572,  rad: 200, unit: 'km' },
  { alias: 'vandenberg',     by: 'radius', la: 34.7420,  lo: -120.5724, rad: 200, unit: 'km' },
  { alias: 'mahia',          by: 'radius', la: -39.2594, lo: 177.8645,  rad: 200, unit: 'km' },
  { alias: 'eastern_med',    by: 'box',    la: 34.5,     lo: 28.0,      w: 900,   h: 700, unit: 'km' },
  { alias: 'baltic',         by: 'box',    la: 58.0,     lo: 14.0,      w: 900,   h: 700, unit: 'km' },
  { alias: 'black_sea',      by: 'box',    la: 43.0,     lo: 28.0,      w: 900,   h: 600, unit: 'km' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const WINGBITS_KEY = Deno.env.get('WINGBITS_API_KEY');
    if (!WINGBITS_KEY) return Response.json({ error: 'No Wingbits key configured' }, { status: 503 });

    const res = await fetch('https://customer-api.wingbits.com/v1/flights', {
      method: 'POST',
      headers: {
        'x-api-key': WINGBITS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(AREAS),
    });

    if (res.status === 401) return Response.json({ error: 'Invalid Wingbits API key' }, { status: 502 });
    if (res.status === 402) return Response.json({ error: 'Wingbits plan quota exceeded' }, { status: 502 });
    if (res.status === 429) return Response.json({ error: 'Wingbits rate limit hit' }, { status: 429 });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return Response.json({ error: `Wingbits ${res.status}: ${body}` }, { status: 502 });
    }

    const data = await res.json();
    // data: Array<{ alias: string, data: Flight[] }>
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

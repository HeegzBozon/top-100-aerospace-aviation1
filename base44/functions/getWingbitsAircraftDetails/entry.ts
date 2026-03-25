import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// GET /v1/flights/details/{icao24} — static aircraft data (manufacturer, operator, owner).
// Accepts: { icao24 } in request body (POST) or ?icao24= query param (GET).
// Returns: registration, manufacturerName, model, typecode, operator, operatorIcao, etc.
// Cache TTL: 7 days — static aircraft metadata never changes.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const WINGBITS_KEY = Deno.env.get('WINGBITS_API_KEY');
    if (!WINGBITS_KEY) return Response.json({ error: 'No Wingbits key configured' }, { status: 503 });

    // Accept icao24 from POST body or GET query param
    let icao24: string | null = null;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      icao24 = body?.icao24 || null;
    } else {
      icao24 = new URL(req.url).searchParams.get('icao24');
    }

    if (!icao24) return Response.json({ error: 'icao24 is required' }, { status: 400 });

    const key = icao24.toLowerCase();
    const res = await fetch(`https://customer-api.wingbits.com/v1/flights/details/${key}`, {
      headers: { 'x-api-key': WINGBITS_KEY },
    });

    if (res.status === 401) return Response.json({ error: 'Invalid Wingbits API key' }, { status: 502 });
    if (res.status === 402) return Response.json({ error: 'Wingbits plan quota exceeded' }, { status: 502 });
    if (res.status === 429) return Response.json({ error: 'Wingbits rate limit hit' }, { status: 429 });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return Response.json({ error: `Wingbits ${res.status}: ${body}` }, { status: 502 });
    }

    const data = await res.json();
    // All fields nullable: registration, manufacturerName, model, typecode, operator,
    // operatorCallsign, operatorIcao, operatorIata, owner, engines, icaoAircraftType,
    // categoryDescription, status, built, adsb
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

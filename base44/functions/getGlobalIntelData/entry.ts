// ── Theater bounding boxes [lamin, lomin, lamax, lomax] ──
const THEATER_BOUNDS = {
  EUCOM:    [35,  -10,  72,  40],
  CENTCOM:  [12,   25,  42,  60],
  INDOPACOM:[-10,  60,  50, 145],
  NORTHCOM: [15, -140,  70, -50],
};

const MILITARY_HEX_PREFIXES = [
  'AE', 'A0', '43', '44', '45', '46', '47', '48',
  '3C', '3D', '3E', '3F', '50', '51', '52',
  '7C', '76', '77', '78', '34', '35', '36', '40',
];

function isMilitary(icao24) {
  const hex = (icao24 || '').toUpperCase();
  return MILITARY_HEX_PREFIXES.some(p => hex.startsWith(p));
}

// ── OpenSky fetch ──────────────────────────────────────────────────────────────
async function fetchOpenSky() {
  const user = Deno.env.get('OPENSKY_USERNAME');
  const pass = Deno.env.get('OPENSKY_PASSWORD');
  const headers = user && pass
    ? { Authorization: `Basic ${btoa(`${user}:${pass}`)}` }
    : {};

  const regions = Object.entries(THEATER_BOUNDS);
  const results = await Promise.allSettled(
    regions.map(([, [lamin, lomin, lamax, lomax]]) =>
      fetch(
        `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
        { headers }
      ).then(r => r.ok ? r.json() : Promise.reject(r.status))
    )
  );

  const allStates = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value?.states || []);

  // Deduplicate by icao24
  const seen = new Set();
  const states = allStates.filter(s => {
    if (!s[0] || seen.has(s[0])) return false;
    seen.add(s[0]);
    return true;
  });

  const flights = states
    .filter(s => s[5] && s[6] && !s[8]) // has lon, lat, not on ground
    .filter(s => isMilitary(s[0]))
    .map(s => ({
      icao24: s[0],
      callsign: (s[1] || '').trim(),
      country: s[2],
      lon: s[5],
      lat: s[6],
      altitudeFt: s[7] ? Math.round(s[7] * 3.28084) : null,
      velocity: s[9],
      heading: s[10],
    }));

  return { flights, total: flights.length };
}

// ── Wingbits Live Flights ──────────────────────────────────────────────────────
async function fetchWingbitsFlights() {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey) return null;

  const body = [
    { alias: 'cape_canaveral', by: 'radius', la: 28.3922,  lo: -80.6077,  rad: 200, unit: 'km' },
    { alias: 'boca_chica',     by: 'radius', la: 25.9969,  lo: -97.1572,  rad: 200, unit: 'km' },
    { alias: 'vandenberg',     by: 'radius', la: 34.7420,  lo: -120.5724, rad: 200, unit: 'km' },
    { alias: 'mahia',          by: 'radius', la: -39.2594, lo: 177.8645,  rad: 200, unit: 'km' },
    { alias: 'eastern_med',    by: 'box',    la: 34.5,     lo: 28.0,      w: 900,   h: 700, unit: 'km' },
    { alias: 'baltic',         by: 'box',    la: 58.0,     lo: 14.0,      w: 900,   h: 700, unit: 'km' },
    { alias: 'black_sea',      by: 'box',    la: 43.0,     lo: 28.0,      w: 900,   h: 600, unit: 'km' },
    { alias: 'persian_gulf',   by: 'box',    la: 26.0,     lo: 48.0,      w: 1200,  h: 800, unit: 'km' },
    { alias: 'south_china_sea',by: 'box',    la: 14.0,     lo: 108.0,     w: 1400,  h: 1200, unit: 'km' },
  ];

  try {
    const res = await fetch('https://customer-api.wingbits.com/v1/flights', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Wingbits GPS Jamming ───────────────────────────────────────────────────────
async function fetchWingbitsGpsJam() {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey) return { hexes: [] };

  const boxes = [
    { min_lat: 30, max_lat: 42, min_lng: 25, max_lng: 42 }, // Eastern Med
    { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 28 }, // Baltic
    { min_lat: 46, max_lat: 56, min_lng: 22, max_lng: 40 }, // Eastern Europe
    { min_lat: 22, max_lat: 32, min_lng: 44, max_lng: 60 }, // Persian Gulf
    { min_lat: 5,  max_lat: 25, min_lng: 100, max_lng: 125 }, // South China Sea
  ];

  const results = await Promise.allSettled(
    boxes.map(box => {
      const params = new URLSearchParams(box);
      return fetch(`https://customer-api.wingbits.com/v1/gps/jam?${params}`, {
        headers: { 'x-api-key': apiKey },
      }).then(r => r.ok ? r.json() : Promise.reject(r.status));
    })
  );

  const allHexes = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value?.hexes || []);

  // Deduplicate by h3Index
  const seen = new Set();
  const hexes = allHexes.filter(h => {
    if (!h?.h3Index || seen.has(h.h3Index)) return false;
    seen.add(h.h3Index);
    return true;
  });

  return { hexes, lastUpdated: new Date().toISOString() };
}

// ── Wingbits Flight Search ─────────────────────────────────────────────────────
async function searchWingbitsFlights(query) {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey || !query) return null;
  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/search?query=${encodeURIComponent(query)}`,
      { headers: { 'x-api-key': apiKey } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Wingbits Flight Detail ─────────────────────────────────────────────────────
async function getWingbitsFlightDetail(icao24) {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey || !icao24) return null;
  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}`,
      { headers: { 'x-api-key': apiKey } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Wingbits Flight Path ───────────────────────────────────────────────────────
async function getWingbitsFlightPath(icao24) {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey || !icao24) return null;
  try {
    const res = await fetch(
      `https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}/path`,
      { headers: { 'x-api-key': apiKey } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept params from JSON body (SDK sends POST with JSON)
    let body = {};
    try { body = await req.json(); } catch { /* GET or no body */ }

    const action = body.action || 'live';

    // ── Route: search ──
    if (action === 'search') {
      const query = body.q || '';
      if (query.trim().length < 3) {
        return Response.json({ error: 'Query too short' }, { status: 400, headers: corsHeaders });
      }
      const result = await searchWingbitsFlights(query);
      return Response.json({ result }, { headers: corsHeaders });
    }

    // ── Route: flight detail ──
    if (action === 'detail') {
      const icao24 = body.icao24 || '';
      const [detail, path] = await Promise.all([
        getWingbitsFlightDetail(icao24),
        getWingbitsFlightPath(icao24),
      ]);
      return Response.json({ detail, path }, { headers: corsHeaders });
    }

    // ── Route: live (default) — fetch all layers in parallel ──
    const [openSkyData, wingbitsFlights, gpsJam] = await Promise.allSettled([
      fetchOpenSky(),
      fetchWingbitsFlights(),
      fetchWingbitsGpsJam(),
    ]);

    const hasWingbits = !!Deno.env.get('WINGBITS_API_KEY');
    const hasOpenSky = !!Deno.env.get('OPENSKY_USERNAME');

    return Response.json({
      openSky: openSkyData.status === 'fulfilled' ? openSkyData.value : { flights: [], total: 0, error: openSkyData.reason?.message },
      wingbitsFlights: wingbitsFlights.status === 'fulfilled' ? wingbitsFlights.value : null,
      gpsJam: gpsJam.status === 'fulfilled' ? gpsJam.value : { hexes: [] },
      meta: {
        hasWingbits,
        hasOpenSky,
        fetchedAt: new Date().toISOString(),
      },
    }, { headers: corsHeaders });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});
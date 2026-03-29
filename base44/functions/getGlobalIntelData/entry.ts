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

  // Try credential-in-URL first (works better from server environments)
  // OpenSky often blocks cloud IPs on the standard endpoint; try both auth methods
  const authUrl = user && pass
    ? `https://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@opensky-network.org/api/states/all`
    : 'https://opensky-network.org/api/states/all';

  // Single global call (no bounding box) — less quota usage, less likely to be blocked
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  let allStates = [];
  try {
    const r = await fetch(authUrl, { signal: controller.signal });
    clearTimeout(timer);
    if (r.ok) {
      const json = await r.json();
      allStates = json.states || [];
      console.log(`[OpenSky] global: ${allStates.length} total states`);
    } else {
      const t = await r.text().catch(() => '');
      console.error(`[OpenSky] HTTP ${r.status}: ${t.slice(0, 200)}`);
    }
  } catch (err) {
    clearTimeout(timer);
    console.error(`[OpenSky] error: ${err.message}`);
  }

  const airborne = allStates.filter(s => s[5] && s[6] && !s[8]);
  const flights = airborne
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

  console.log(`[OpenSky] ${flights.length} military flights from ${airborne.length} airborne`);
  return { flights, total: flights.length };
}

// ── Wingbits Live Flights ──────────────────────────────────────────────────────
async function fetchWingbitsFlights() {
  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey) return null;

  // Wingbits max radius is 277.8km (150nm) — use radius queries for all areas
  const body = [
    { alias: 'cape_canaveral', by: 'radius', la: 28.3922,  lo: -80.6077,  rad: 250, unit: 'km' },
    { alias: 'boca_chica',     by: 'radius', la: 25.9969,  lo: -97.1572,  rad: 250, unit: 'km' },
    { alias: 'vandenberg',     by: 'radius', la: 34.7420,  lo: -120.5724, rad: 250, unit: 'km' },
    { alias: 'mahia',          by: 'radius', la: -39.2594, lo: 177.8645,  rad: 250, unit: 'km' },
    // Eastern Med: split into radius queries
    { alias: 'eastern_med_n',  by: 'radius', la: 36.0,     lo: 33.0,      rad: 250, unit: 'km' },
    { alias: 'eastern_med_s',  by: 'radius', la: 32.0,     lo: 35.0,      rad: 250, unit: 'km' },
    // Baltic
    { alias: 'baltic_n',       by: 'radius', la: 60.0,     lo: 20.0,      rad: 250, unit: 'km' },
    { alias: 'baltic_s',       by: 'radius', la: 56.0,     lo: 20.0,      rad: 250, unit: 'km' },
    // Black Sea
    { alias: 'black_sea',      by: 'radius', la: 43.0,     lo: 34.0,      rad: 250, unit: 'km' },
    // Persian Gulf
    { alias: 'persian_gulf',   by: 'radius', la: 26.5,     lo: 52.5,      rad: 250, unit: 'km' },
    // South China Sea
    { alias: 'south_china_sea',by: 'radius', la: 14.0,     lo: 114.0,     rad: 250, unit: 'km' },
  ];

  try {
    const res = await fetch('https://customer-api.wingbits.com/v1/flights', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[Wingbits flights] HTTP ${res.status}: ${errText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('[Wingbits flights] fetch error:', err.message);
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
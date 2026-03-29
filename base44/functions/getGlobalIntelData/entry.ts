import { cellToLatLng } from 'npm:h3-js@4.1.0';

// ── Military ICAO hex prefixes ─────────────────────────────────────────────────
const MILITARY_HEX_PREFIXES = [
  'AE', 'A0', '43', '44', '45', '46', '47', '48',
  '3C', '3D', '3E', '3F', '50', '51', '52',
  '7C', '76', '77', '78', '34', '35', '36', '40',
  // UK mil
  '43', '44', '45',
  // French mil
  '3B',
  // Russian
  'A0',
];

function isMilitary(hex) {
  const h = (hex || '').toUpperCase();
  return MILITARY_HEX_PREFIXES.some(p => h.startsWith(p));
}

// ── Wingbits Live Flights — broad global coverage via radius queries ──────────
// We use many overlapping 500km radius circles to blanket all inhabited airspace.
// Each call costs 1 API credit; responses are fast (~200ms).
async function fetchWingbitsFlights(apiKey) {
  const areas = [
    // North America
    { alias: 'northeast_us',    by: 'radius', la: 41.0,   lo: -74.0,   rad: 600, unit: 'km' },
    { alias: 'southeast_us',    by: 'radius', la: 30.0,   lo: -82.0,   rad: 600, unit: 'km' },
    { alias: 'midwest_us',      by: 'radius', la: 41.0,   lo: -93.0,   rad: 600, unit: 'km' },
    { alias: 'west_us',         by: 'radius', la: 36.0,   lo: -118.0,  rad: 600, unit: 'km' },
    { alias: 'northwest_us',    by: 'radius', la: 47.0,   lo: -122.0,  rad: 500, unit: 'km' },
    { alias: 'canada_east',     by: 'radius', la: 45.5,   lo: -73.5,   rad: 600, unit: 'km' },
    { alias: 'canada_west',     by: 'radius', la: 51.0,   lo: -114.0,  rad: 600, unit: 'km' },
    { alias: 'mexico',          by: 'radius', la: 23.0,   lo: -102.0,  rad: 600, unit: 'km' },
    { alias: 'caribbean',       by: 'radius', la: 18.0,   lo: -75.0,   rad: 600, unit: 'km' },
    // Europe
    { alias: 'uk_ireland',      by: 'radius', la: 52.0,   lo: -2.0,    rad: 500, unit: 'km' },
    { alias: 'west_europe',     by: 'radius', la: 48.5,   lo: 4.0,     rad: 600, unit: 'km' },
    { alias: 'central_europe',  by: 'radius', la: 50.0,   lo: 14.0,    rad: 600, unit: 'km' },
    { alias: 'east_europe',     by: 'radius', la: 50.0,   lo: 28.0,    rad: 600, unit: 'km' },
    { alias: 'scandinavia',     by: 'radius', la: 59.0,   lo: 14.0,    rad: 600, unit: 'km' },
    { alias: 'med_west',        by: 'radius', la: 40.0,   lo: 5.0,     rad: 600, unit: 'km' },
    { alias: 'med_east',        by: 'radius', la: 37.0,   lo: 26.0,    rad: 600, unit: 'km' },
    { alias: 'baltic',          by: 'radius', la: 58.0,   lo: 22.0,    rad: 500, unit: 'km' },
    // Middle East & Africa
    { alias: 'middle_east',     by: 'radius', la: 28.0,   lo: 45.0,    rad: 700, unit: 'km' },
    { alias: 'north_africa',    by: 'radius', la: 30.0,   lo: 15.0,    rad: 700, unit: 'km' },
    { alias: 'east_africa',     by: 'radius', la: 5.0,    lo: 37.0,    rad: 700, unit: 'km' },
    { alias: 'south_africa',    by: 'radius', la: -26.0,  lo: 28.0,    rad: 700, unit: 'km' },
    { alias: 'west_africa',     by: 'radius', la: 9.0,    lo: 5.0,     rad: 700, unit: 'km' },
    // Asia & Pacific
    { alias: 'russia_west',     by: 'radius', la: 55.5,   lo: 37.5,    rad: 700, unit: 'km' },
    { alias: 'russia_sib',      by: 'radius', la: 56.0,   lo: 60.0,    rad: 700, unit: 'km' },
    { alias: 'central_asia',    by: 'radius', la: 43.0,   lo: 68.0,    rad: 700, unit: 'km' },
    { alias: 'south_asia',      by: 'radius', la: 22.0,   lo: 78.0,    rad: 700, unit: 'km' },
    { alias: 'southeast_asia',  by: 'radius', la: 12.0,   lo: 105.0,   rad: 700, unit: 'km' },
    { alias: 'china_east',      by: 'radius', la: 32.0,   lo: 115.0,   rad: 700, unit: 'km' },
    { alias: 'china_north',     by: 'radius', la: 40.0,   lo: 116.0,   rad: 600, unit: 'km' },
    { alias: 'japan_korea',     by: 'radius', la: 35.5,   lo: 134.0,   rad: 600, unit: 'km' },
    { alias: 'australia',       by: 'radius', la: -25.0,  lo: 134.0,   rad: 900, unit: 'km' },
    { alias: 'south_america_n', by: 'radius', la: -5.0,   lo: -56.0,   rad: 700, unit: 'km' },
    { alias: 'south_america_s', by: 'radius', la: -30.0,  lo: -62.0,   rad: 700, unit: 'km' },
    // Key launch/military areas
    { alias: 'cape_canaveral',  by: 'radius', la: 28.4,   lo: -80.6,   rad: 300, unit: 'km' },
    { alias: 'boca_chica',      by: 'radius', la: 26.0,   lo: -97.2,   rad: 300, unit: 'km' },
    { alias: 'black_sea',       by: 'radius', la: 43.0,   lo: 34.0,    rad: 400, unit: 'km' },
    { alias: 'persian_gulf',    by: 'radius', la: 26.5,   lo: 52.5,    rad: 400, unit: 'km' },
    { alias: 'south_china_sea', by: 'radius', la: 14.0,   lo: 114.0,   rad: 400, unit: 'km' },
  ];

  const res = await fetch('https://customer-api.wingbits.com/v1/flights', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(areas),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Wingbits flights HTTP ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

// ── Wingbits GPS Jamming ───────────────────────────────────────────────────────
async function fetchWingbitsGpsJam(apiKey) {
  const boxes = [
    { min_lat: 30, max_lat: 42, min_lng: 25, max_lng: 42 },  // Eastern Med
    { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 28 },  // Baltic
    { min_lat: 46, max_lat: 56, min_lng: 22, max_lng: 40 },  // Eastern Europe
    { min_lat: 22, max_lat: 32, min_lng: 44, max_lng: 60 },  // Persian Gulf
    { min_lat: 5,  max_lat: 25, min_lng: 100, max_lng: 125}, // South China Sea
    { min_lat: 10, max_lat: 35, min_lng: 55, max_lng: 80 },  // South Asia
    { min_lat: 35, max_lat: 55, min_lng: 38, max_lng: 60 },  // Caucasus/Caspian
  ];

  const results = await Promise.allSettled(
    boxes.map(box => {
      const params = new URLSearchParams(Object.entries(box).map(([k, v]) => [k, String(v)]));
      return fetch(`https://customer-api.wingbits.com/v1/gps/jam?${params}`, {
        headers: { 'x-api-key': apiKey },
      }).then(r => r.ok ? r.json() : null);
    })
  );

  const allHexes = results
    .filter(r => r.status === 'fulfilled' && r.value)
    .flatMap(r => r.value?.hexes || []);

  const seen = new Set();
  const hexes = allHexes
    .filter(h => {
      if (!h?.h3Index || seen.has(h.h3Index)) return false;
      seen.add(h.h3Index);
      return true;
    })
    .map(h => {
      try {
        const [lat, lng] = cellToLatLng(h.h3Index);
        return { ...h, lat, lng };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return { hexes, lastUpdated: new Date().toISOString() };
}

// ── Wingbits detail / search / path ──────────────────────────────────────────
async function getWingbitsFlightDetail(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}`, {
    headers: { 'x-api-key': apiKey },
  });
  return res.ok ? res.json() : null;
}

async function getWingbitsFlightPath(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}/path`, {
    headers: { 'x-api-key': apiKey },
  });
  return res.ok ? res.json() : null;
}

async function searchWingbitsFlights(apiKey, query) {
  if (!query || query.trim().length < 3) return null;
  const res = await fetch(
    `https://customer-api.wingbits.com/v1/flights/search?query=${encodeURIComponent(query.trim())}`,
    { headers: { 'x-api-key': apiKey } }
  );
  return res.ok ? res.json() : null;
}

// ── Flatten all Wingbits region data into a single deduplicated list ──────────
function flattenWingbits(regionsData) {
  const seen = new Set();
  const flights = [];
  for (const region of (regionsData || [])) {
    for (const f of (region.data || [])) {
      if (f.h && !seen.has(f.h) && f.la && f.lo && !f.og) {
        seen.add(f.h);
        flights.push({
          icao24: f.h,
          callsign: f.f || null,
          lat: f.la,
          lon: f.lo,
          altitude: f.ab || null,   // feet
          heading: f.th || null,
          speed: f.gs || null,      // knots
          squawk: f.sq || null,
          isMilitary: isMilitary(f.h),
          region: region.alias,
        });
      }
    }
  }
  return flights;
}

// ── Main handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey) {
    return Response.json({ error: 'WINGBITS_API_KEY not set' }, { status: 500, headers: corsHeaders });
  }

  let body = {};
  try { body = await req.json(); } catch { /* GET or no body */ }
  const action = body.action || 'live';

  if (action === 'search') {
    const result = await searchWingbitsFlights(apiKey, body.q || '');
    return Response.json({ result }, { headers: corsHeaders });
  }

  if (action === 'detail') {
    const icao24 = body.icao24 || '';
    const [detail, path] = await Promise.all([
      getWingbitsFlightDetail(apiKey, icao24),
      getWingbitsFlightPath(apiKey, icao24),
    ]);
    return Response.json({ detail, path }, { headers: corsHeaders });
  }

  // ── live: flights + GPS jam in parallel ──────────────────────────────────────
  const [flightsResult, jamResult] = await Promise.allSettled([
    fetchWingbitsFlights(apiKey),
    fetchWingbitsGpsJam(apiKey),
  ]);

  const rawRegions = flightsResult.status === 'fulfilled' ? flightsResult.value : [];
  const flights = flattenWingbits(rawRegions);
  const militaryFlights = flights.filter(f => f.isMilitary);
  const gpsJam = jamResult.status === 'fulfilled' ? jamResult.value : { hexes: [] };

  console.log(`[Globe] ${flights.length} total flights (${militaryFlights.length} military), ${gpsJam.hexes.length} GPS jam zones`);

  return Response.json({
    flights,          // all deduplicated flights (flat array)
    militaryFlights,  // subset for easy access
    wingbitsFlights: rawRegions,  // raw regions for backward compat with globe component
    gpsJam,
    openSky: { flights: [], total: 0 },  // kept for compat, OpenSky skipped (too slow)
    meta: {
      totalFlights: flights.length,
      militaryCount: militaryFlights.length,
      jamCount: gpsJam.hexes.length,
      fetchedAt: new Date().toISOString(),
    },
  }, { headers: corsHeaders });
});
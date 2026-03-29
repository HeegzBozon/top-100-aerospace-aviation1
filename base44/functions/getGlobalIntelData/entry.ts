import { cellToLatLng } from 'npm:h3-js@4.1.0';

// ── Military ICAO hex prefixes ─────────────────────────────────────────────────
const MILITARY_HEX_PREFIXES = [
  'AE', 'A0', '43', '44', '45', '46', '47', '48',
  '3C', '3D', '3E', '3F', '50', '51', '52',
  '7C', '76', '77', '78', '34', '35', '36', '40', '3B',
];
function isMilitary(hex) {
  const h = (hex || '').toUpperCase();
  return MILITARY_HEX_PREFIXES.some(p => h.startsWith(p));
}

// ── Single GET request for one region — the actual working endpoint ────────────
async function fetchRegion(apiKey, la, lo, rad) {
  const params = new URLSearchParams({ by: 'radius', la, lo, rad, unit: 'km' });
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights?${params}`, {
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Wingbits GET ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json(); // returns flat Flight[]
}

// ── Cover global airspace with parallel GET requests ─────────────────────────
// Each region is ~500-700km radius. We spread them to maximize coverage.
// Wingbits network is densest in US/EU; sparser in Asia/Africa — still worth querying.
// Max radius: 150nm = 277.8km — use 250km per region for safety margin
const R = 250;
const REGIONS = [
  // North America — dense Wingbits coverage
  [40.7,  -74.0,  R],   // new york
  [33.7,  -84.4,  R],   // atlanta
  [41.9,  -87.6,  R],   // chicago
  [29.8,  -95.4,  R],   // houston
  [33.4,  -112.1, R],   // phoenix
  [34.0,  -118.2, R],   // los angeles
  [47.6,  -122.3, R],   // seattle
  [37.8,  -122.4, R],   // san francisco
  [44.9,  -93.2,  R],   // minneapolis
  [45.5,  -73.6,  R],   // montreal
  [43.7,  -79.4,  R],   // toronto
  [49.3,  -123.1, R],   // vancouver
  [51.0,  -114.1, R],   // calgary
  [23.6,  -102.5, R],   // mexico city
  [20.0,  -75.0,  R],   // caribbean
  [25.8,  -80.2,  R],   // miami
  [32.8,  -97.0,  R],   // dallas
  [39.9,  -82.9,  R],   // columbus
  // Europe — very dense coverage
  [51.5,  -0.1,   R],   // london
  [52.4,  13.4,   R],   // berlin
  [48.9,  2.3,    R],   // paris
  [52.4,  4.9,    R],   // amsterdam
  [53.3,  -6.3,   R],   // dublin
  [48.2,  16.4,   R],   // vienna
  [59.3,  18.1,   R],   // stockholm
  [60.2,  25.0,   R],   // helsinki
  [55.7,  12.6,   R],   // copenhagen
  [50.1,  14.4,   R],   // prague
  [52.2,  21.0,   R],   // warsaw
  [47.5,  19.1,   R],   // budapest
  [45.5,  9.2,    R],   // milan
  [41.9,  12.5,   R],   // rome
  [40.4,  -3.7,   R],   // madrid
  [37.0,  22.9,   R],   // athens
  [44.8,  20.5,   R],   // belgrade
  [55.8,  37.6,   R],   // moscow
  [59.9,  30.3,   R],   // st petersburg
  [50.5,  30.5,   R],   // kyiv
  // Middle East
  [30.1,  31.4,   R],   // cairo
  [31.8,  35.2,   R],   // jerusalem / tel aviv
  [33.9,  35.5,   R],   // beirut
  [33.3,  44.4,   R],   // baghdad
  [25.3,  55.4,   R],   // dubai
  [24.7,  46.7,   R],   // riyadh
  [35.7,  51.4,   R],   // tehran
  // Asia
  [39.9,  116.4,  R],   // beijing
  [31.2,  121.5,  R],   // shanghai
  [22.3,  114.2,  R],   // hong kong
  [23.0,  113.3,  R],   // guangzhou
  [35.7,  139.7,  R],   // tokyo
  [37.6,  127.0,  R],   // seoul
  [1.4,   103.8,  R],   // singapore
  [13.8,  100.5,  R],   // bangkok
  [21.0,  105.8,  R],   // hanoi
  [28.6,  77.2,   R],   // delhi
  [19.1,  72.9,   R],   // mumbai
  [12.9,  77.6,   R],   // bangalore
  [34.5,  69.2,   R],   // kabul
  [33.7,  73.1,   R],   // islamabad
  [41.3,  69.3,   R],   // tashkent
  // Oceania
  [-33.9, 151.2,  R],   // sydney
  [-37.8, 145.0,  R],   // melbourne
  [-27.5, 153.0,  R],   // brisbane
  [-31.9, 115.9,  R],   // perth
  [-36.9, 174.8,  R],   // auckland
  // South America
  [-23.5, -46.6,  R],   // sao paulo
  [-34.6, -58.4,  R],   // buenos aires
  [-33.5, -70.7,  R],   // santiago
  [-12.0, -77.0,  R],   // lima
  [4.7,   -74.1,  R],   // bogota
  [10.5,  -66.9,  R],   // caracas
  // Africa
  [33.9,  -6.9,   R],   // casablanca
  [36.8,  10.2,   R],   // tunis
  [6.5,   3.4,    R],   // lagos
  [5.6,   -0.2,   R],   // accra
  [-26.2, 28.0,   R],   // johannesburg
  [-33.9, 18.4,   R],   // cape town
  [-4.3,  15.3,   R],   // kinshasa
  [9.0,   38.7,   R],   // addis ababa
  [-1.3,  36.8,   R],   // nairobi
];

async function fetchAllFlights(apiKey) {
  const results = await Promise.allSettled(
    REGIONS.map(([la, lo, rad]) => fetchRegion(apiKey, la, lo, rad))
  );

  const seen = new Set();
  const flights = [];
  let errors = 0;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'rejected') {
      errors++;
      console.warn(`[Wingbits] region[${i}] failed: ${r.reason?.message}`);
      continue;
    }
    const arr = Array.isArray(r.value) ? r.value : [];
    for (const f of arr) {
      if (f.h && !seen.has(f.h) && f.la != null && f.lo != null && !f.og) {
        seen.add(f.h);
        flights.push({
          icao24:     f.h,
          callsign:   f.f || null,
          lat:        f.la,
          lon:        f.lo,
          altitude:   f.ab || null,
          heading:    f.th || null,
          speed:      f.gs || null,
          squawk:     f.sq || null,
          isMilitary: isMilitary(f.h),
        });
      }
    }
  }

  console.log(`[Wingbits] ${flights.length} flights from ${REGIONS.length - errors} regions (${errors} errors)`);
  return flights;
}

// ── Wingbits GPS Jamming ───────────────────────────────────────────────────────
async function fetchGpsJam(apiKey) {
  const boxes = [
    { min_lat: 28, max_lat: 44, min_lng: 22, max_lng: 42 },  // Eastern Med / Israel / Lebanon
    { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 30 },  // Baltic / Finland
    { min_lat: 46, max_lat: 58, min_lng: 22, max_lng: 42 },  // Eastern Europe / Ukraine
    { min_lat: 20, max_lat: 34, min_lng: 44, max_lng: 62 },  // Persian Gulf / Iraq
    { min_lat: 5,  max_lat: 25, min_lng: 98, max_lng: 126 }, // South China Sea
    { min_lat: 32, max_lat: 56, min_lng: 38, max_lng: 62 },  // Caucasus / Caspian
    { min_lat: 50, max_lat: 70, min_lng: 30, max_lng: 55 },  // Russia / Black Sea north
  ];

  const results = await Promise.allSettled(
    boxes.map(box => {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(box).map(([k, v]) => [k, String(v)])));
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
      } catch { return null; }
    })
    .filter(Boolean);

  return { hexes, lastUpdated: new Date().toISOString() };
}

// ── Wingbits detail / search / path ──────────────────────────────────────────
async function getFlightDetail(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}`, { headers: { 'x-api-key': apiKey } });
  return res.ok ? res.json() : null;
}
async function getFlightPath(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}/path`, { headers: { 'x-api-key': apiKey } });
  return res.ok ? res.json() : null;
}
async function searchFlights(apiKey, query) {
  if (!query || query.trim().length < 3) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/search?query=${encodeURIComponent(query.trim())}`, { headers: { 'x-api-key': apiKey } });
  return res.ok ? res.json() : null;
}

// ── Main handler ───────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  const apiKey = Deno.env.get('WINGBITS_API_KEY');
  if (!apiKey) return Response.json({ error: 'WINGBITS_API_KEY not set' }, { status: 500, headers: cors });

  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'live';

  if (action === 'search') {
    const result = await searchFlights(apiKey, body.q || '');
    return Response.json({ result }, { headers: cors });
  }
  if (action === 'detail') {
    const [detail, path] = await Promise.all([getFlightDetail(apiKey, body.icao24), getFlightPath(apiKey, body.icao24)]);
    return Response.json({ detail, path }, { headers: cors });
  }

  // live — parallel fetch
  const [flightsResult, jamResult] = await Promise.allSettled([
    fetchAllFlights(apiKey),
    fetchGpsJam(apiKey),
  ]);

  const flights = flightsResult.status === 'fulfilled' ? flightsResult.value : [];
  const gpsJam  = jamResult.status === 'fulfilled'    ? jamResult.value    : { hexes: [] };

  console.log(`[Globe] ${flights.length} flights, ${gpsJam.hexes.length} GPS jam zones`);

  return Response.json({
    flights,
    militaryFlights: flights.filter(f => f.isMilitary),
    gpsJam,
    // compat fields
    wingbitsFlights: [],
    openSky: { flights: [], total: 0 },
    meta: {
      totalFlights: flights.length,
      militaryCount: flights.filter(f => f.isMilitary).length,
      jamCount: gpsJam.hexes.length,
      fetchedAt: new Date().toISOString(),
    },
  }, { headers: cors });
});
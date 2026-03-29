import { cellToLatLng } from 'npm:h3-js@4.1.0';

// ── Military ICAO hex prefixes ─────────────────────────────────────────────────
const MILITARY_HEX_PREFIXES = [
  'AE','A0','43','44','45','46','47','48',
  '3C','3D','3E','3F','50','51','52',
  '7C','76','77','78','34','35','36','40','3B',
];
function isMilitary(hex) {
  const h = (hex || '').toUpperCase();
  return MILITARY_HEX_PREFIXES.some(p => h.startsWith(p));
}

// ─────────────────────────────────────────────────────────────────────────────
// WINGBITS — pull flights by radius (max 150nm = 277km), deduplicate globally
// ─────────────────────────────────────────────────────────────────────────────
const R = 250; // km — safely under the 277.8km cap
const WINGBITS_REGIONS = [
  // North America
  [40.7, -74.0,  R], [33.7, -84.4,  R], [41.9, -87.6,  R], [29.8, -95.4,  R],
  [33.4,-112.1,  R], [34.0,-118.2,  R], [47.6,-122.3,  R], [37.8,-122.4,  R],
  [44.9, -93.2,  R], [45.5, -73.6,  R], [43.7, -79.4,  R], [49.3,-123.1,  R],
  [51.0,-114.1,  R], [23.6,-102.5,  R], [20.0, -75.0,  R], [25.8, -80.2,  R],
  [32.8, -97.0,  R], [39.9, -82.9,  R],
  // Europe
  [51.5,  -0.1,  R], [52.4,  13.4,  R], [48.9,   2.3,  R], [52.4,   4.9,  R],
  [53.3,  -6.3,  R], [48.2,  16.4,  R], [59.3,  18.1,  R], [60.2,  25.0,  R],
  [55.7,  12.6,  R], [50.1,  14.4,  R], [52.2,  21.0,  R], [47.5,  19.1,  R],
  [45.5,   9.2,  R], [41.9,  12.5,  R], [40.4,  -3.7,  R], [37.0,  22.9,  R],
  [44.8,  20.5,  R], [55.8,  37.6,  R], [59.9,  30.3,  R], [50.5,  30.5,  R],
  // Middle East
  [30.1,  31.4,  R], [31.8,  35.2,  R], [33.9,  35.5,  R], [33.3,  44.4,  R],
  [25.3,  55.4,  R], [24.7,  46.7,  R], [35.7,  51.4,  R],
  // Asia
  [39.9, 116.4,  R], [31.2, 121.5,  R], [22.3, 114.2,  R], [23.0, 113.3,  R],
  [35.7, 139.7,  R], [37.6, 127.0,  R], [ 1.4, 103.8,  R], [13.8, 100.5,  R],
  [21.0, 105.8,  R], [28.6,  77.2,  R], [19.1,  72.9,  R], [12.9,  77.6,  R],
  [34.5,  69.2,  R], [33.7,  73.1,  R], [41.3,  69.3,  R],
  // Oceania
  [-33.9, 151.2, R], [-37.8, 145.0, R], [-27.5, 153.0, R], [-31.9, 115.9, R],
  [-36.9, 174.8, R],
  // South America
  [-23.5, -46.6, R], [-34.6, -58.4, R], [-33.5, -70.7, R], [-12.0, -77.0, R],
  [  4.7, -74.1, R], [ 10.5, -66.9, R],
  // Africa
  [33.9,  -6.9,  R], [36.8,  10.2,  R], [ 6.5,   3.4,  R], [ 5.6,  -0.2,  R],
  [-26.2, 28.0,  R], [-33.9, 18.4,  R], [-4.3,  15.3,  R], [ 9.0,  38.7,  R],
  [ -1.3, 36.8,  R],
];

async function fetchWingbitsRegion(apiKey, la, lo, rad) {
  const params = new URLSearchParams({ by: 'radius', la, lo, rad, unit: 'km' });
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights?${params}`, {
    headers: { 'x-api-key': apiKey },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

async function fetchWingbitsFlights(apiKey) {
  const results = await Promise.allSettled(
    WINGBITS_REGIONS.map(([la, lo, rad]) => fetchWingbitsRegion(apiKey, la, lo, rad))
  );

  const seen = new Set();
  const flights = new Map(); // icao24 → normalized flight object
  let errors = 0;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'rejected') { errors++; continue; }
    const arr = Array.isArray(r.value) ? r.value : [];
    for (const f of arr) {
      if (!f.h || f.la == null || f.lo == null || f.og) continue;
      const id = f.h.toLowerCase();
      if (seen.has(id)) continue;
      seen.add(id);
      flights.set(id, {
        icao24:     id,
        callsign:   (f.f || '').trim() || null,
        lat:        f.la,
        lon:        f.lo,
        altitude:   f.ab ?? null,
        heading:    f.th ?? null,
        speed:      f.gs ?? null,
        squawk:     f.sq ?? null,
        isMilitary: isMilitary(id),
        sources:    ['wingbits'],
        anomaly:    false,
      });
    }
  }

  console.log(`[Wingbits] ${flights.size} unique aircraft (${errors}/${WINGBITS_REGIONS.length} regions failed)`);
  return flights;
}

// ─────────────────────────────────────────────────────────────────────────────
// OPENSKY — anonymous bounding-box queries (no auth, no rate limit concern)
// We use small boxes to avoid the 25-degree-squared anonymous limit.
// ─────────────────────────────────────────────────────────────────────────────
// Each box: [minLat, maxLat, minLon, maxLon] — kept ≤ 20×20° for anon API
const OPENSKY_BOXES = [
  // North America grid
  [24, 50, -125, -100], [24, 50, -100, -75], [24, 50, -75, -50],
  [50, 70, -130, -100], [50, 70, -100, -70],
  [15, 30, -120, -85],  [10, 30, -85, -60],
  // Europe grid
  [35, 55, -10, 15],    [35, 55, 15, 40],
  [55, 72, -5, 20],     [55, 72, 20, 45],
  [30, 50, -10, 15],    [30, 50, 15, 40],
  // Middle East
  [15, 40, 25, 50],     [15, 40, 50, 75],
  // Asia
  [20, 45, 75, 100],    [20, 45, 100, 130],
  [20, 45, 130, 150],   [0,  25, 90,  120],
  [30, 55, 100, 130],
  // Oceania
  [-45,-10, 110, 155],
  // South America
  [-60, 10, -80, -60],  [-60, 10, -60, -35],
  // Africa
  [-40, 15, -20, 20],   [-40, 15, 20, 55],
  [15, 40,  -20, 20],   [15, 40,  20, 50],
];

async function fetchOpenSkyBox(minLat, maxLat, minLon, maxLon) {
  const url = `https://opensky-network.org/api/states/all?lamin=${minLat}&lamax=${maxLat}&lomin=${minLon}&lomax=${maxLon}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);
  const data = await res.json();
  return data?.states || [];
}

// State vector index constants (OpenSky anonymous format)
const OS = { icao: 0, callsign: 1, country: 2, lon: 5, lat: 6, alt: 7, onGnd: 8, speed: 9, heading: 10, squawk: 14 };

async function fetchOpenSkyFlights() {
  const results = await Promise.allSettled(
    OPENSKY_BOXES.map(([a, b, c, d]) => fetchOpenSkyBox(a, b, c, d))
  );

  const seen = new Set();
  const flights = new Map();
  let errors = 0;

  for (const r of results) {
    if (r.status === 'rejected') { errors++; continue; }
    const states = r.value;
    for (const s of states) {
      const id = (s[OS.icao] || '').toLowerCase();
      if (!id || s[OS.lat] == null || s[OS.lon] == null || s[OS.onGnd] || seen.has(id)) continue;
      seen.add(id);
      flights.set(id, {
        icao24:     id,
        callsign:   (s[OS.callsign] || '').trim() || null,
        lat:        s[OS.lat],
        lon:        s[OS.lon],
        altitude:   s[OS.alt] != null ? Math.round(s[OS.alt] * 3.28084) : null, // m → ft
        heading:    s[OS.heading] ?? null,
        speed:      s[OS.speed] != null ? Math.round(s[OS.speed] * 1.94384) : null, // m/s → kts
        squawk:     s[OS.squawk] ?? null,
        country:    s[OS.country] ?? null,
        isMilitary: isMilitary(id),
        sources:    ['opensky'],
        anomaly:    false,
      });
    }
  }

  console.log(`[OpenSky] ${flights.size} unique aircraft (${errors}/${OPENSKY_BOXES.length} boxes failed)`);
  return flights;
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE — combine both sources, cross-validate overlaps, flag anomalies
// ─────────────────────────────────────────────────────────────────────────────
const MAX_POS_DELTA_DEG  = 0.5;   // ~55km — if same plane differs more → anomaly
const MAX_ALT_DELTA_FT   = 5000;  // 5000ft discrepancy → anomaly
const MAX_SPEED_DELTA_KTS = 150;  // 150kts discrepancy → anomaly

function mergeFlightMaps(wingbitsMap, openskyMap) {
  const merged = new Map();

  // Start with Wingbits (preferred — usually fresher ADS-B)
  for (const [id, wf] of wingbitsMap) {
    merged.set(id, { ...wf });
  }

  // Merge in OpenSky — fill gaps, cross-validate overlaps
  for (const [id, of_] of openskyMap) {
    if (merged.has(id)) {
      // Both sources have this aircraft — cross-validate
      const wf = merged.get(id);
      const latDelta   = Math.abs(wf.lat - of_.lat);
      const lonDelta   = Math.abs(wf.lon - of_.lon);
      const altDelta   = wf.altitude != null && of_.altitude != null ? Math.abs(wf.altitude - of_.altitude) : 0;
      const spdDelta   = wf.speed    != null && of_.speed    != null ? Math.abs(wf.speed    - of_.speed)    : 0;

      const isAnomaly = latDelta > MAX_POS_DELTA_DEG ||
                        lonDelta > MAX_POS_DELTA_DEG ||
                        altDelta > MAX_ALT_DELTA_FT  ||
                        spdDelta > MAX_SPEED_DELTA_KTS;

      merged.set(id, {
        ...wf,
        sources:  ['wingbits', 'opensky'],
        anomaly:  isAnomaly,
        anomalyDetails: isAnomaly ? { latDelta, lonDelta, altDelta, spdDelta } : undefined,
        // Supplement missing fields from OpenSky
        country:  wf.country  ?? of_.country,
        callsign: wf.callsign ?? of_.callsign,
      });
    } else {
      // Only OpenSky has this — add it (fills Wingbits blind spots)
      merged.set(id, { ...of_ });
    }
  }

  const flights = Array.from(merged.values());
  const corroborated = flights.filter(f => f.sources.length > 1).length;
  const anomalies    = flights.filter(f => f.anomaly).length;

  console.log(`[Merge] ${flights.length} total | ${corroborated} corroborated | ${anomalies} anomalies`);
  return { flights, corroborated, anomalies };
}

// ─────────────────────────────────────────────────────────────────────────────
// GPS JAMMING (Wingbits only)
// ─────────────────────────────────────────────────────────────────────────────
async function fetchGpsJam(apiKey) {
  const boxes = [
    { min_lat: 28, max_lat: 44, min_lng: 22, max_lng: 42 },  // Eastern Med / Israel / Lebanon
    { min_lat: 54, max_lat: 64, min_lng: 14, max_lng: 30 },  // Baltic / Finland
    { min_lat: 46, max_lat: 58, min_lng: 22, max_lng: 42 },  // Eastern Europe / Ukraine
    { min_lat: 20, max_lat: 34, min_lng: 44, max_lng: 62 },  // Persian Gulf / Iraq
    { min_lat:  5, max_lat: 25, min_lng: 98, max_lng:126 },  // South China Sea
    { min_lat: 32, max_lat: 56, min_lng: 38, max_lng: 62 },  // Caucasus / Caspian
    { min_lat: 50, max_lat: 70, min_lng: 30, max_lng: 55 },  // Russia / Black Sea north
  ];

  const results = await Promise.allSettled(
    boxes.map(box => {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(box).map(([k, v]) => [k, String(v)])));
      return fetch(`https://customer-api.wingbits.com/v1/gps/jam?${params}`, {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(8000),
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

// ─────────────────────────────────────────────────────────────────────────────
// Flight detail / search helpers
// ─────────────────────────────────────────────────────────────────────────────
async function getFlightDetail(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}`, {
    headers: { 'x-api-key': apiKey }, signal: AbortSignal.timeout(6000),
  });
  return res.ok ? res.json() : null;
}
async function getFlightPath(apiKey, icao24) {
  if (!icao24) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/${icao24.toLowerCase()}/path`, {
    headers: { 'x-api-key': apiKey }, signal: AbortSignal.timeout(6000),
  });
  return res.ok ? res.json() : null;
}
async function searchFlights(apiKey, query) {
  if (!query || query.trim().length < 3) return null;
  const res = await fetch(`https://customer-api.wingbits.com/v1/flights/search?query=${encodeURIComponent(query.trim())}`, {
    headers: { 'x-api-key': apiKey }, signal: AbortSignal.timeout(6000),
  });
  return res.ok ? res.json() : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  const wingbitsKey = Deno.env.get('WINGBITS_API_KEY');
  if (!wingbitsKey) return Response.json({ error: 'WINGBITS_API_KEY not set' }, { status: 500, headers: cors });

  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || 'live';

  if (action === 'search') {
    const result = await searchFlights(wingbitsKey, body.q || '');
    return Response.json({ result }, { headers: cors });
  }

  if (action === 'detail') {
    const [detail, path] = await Promise.all([
      getFlightDetail(wingbitsKey, body.icao24),
      getFlightPath(wingbitsKey, body.icao24),
    ]);
    return Response.json({ detail, path }, { headers: cors });
  }

  // ── Live: fetch all three in parallel ──────────────────────────────────────
  const [wingbitsResult, openskyResult, jamResult] = await Promise.allSettled([
    fetchWingbitsFlights(wingbitsKey),
    fetchOpenSkyFlights(),
    fetchGpsJam(wingbitsKey),
  ]);

  const wingbitsMap = wingbitsResult.status === 'fulfilled' ? wingbitsResult.value : new Map();
  const openskyMap  = openskyResult.status  === 'fulfilled' ? openskyResult.value  : new Map();
  const gpsJam      = jamResult.status      === 'fulfilled' ? jamResult.value      : { hexes: [] };

  const { flights, corroborated, anomalies } = mergeFlightMaps(wingbitsMap, openskyMap);

  console.log(`[Globe] ${flights.length} merged flights | GPS jam zones: ${gpsJam.hexes.length}`);

  return Response.json({
    flights,
    militaryFlights: flights.filter(f => f.isMilitary),
    gpsJam,
    meta: {
      totalFlights:    flights.length,
      militaryCount:   flights.filter(f => f.isMilitary).length,
      jamCount:        gpsJam.hexes.length,
      wingbitsCount:   wingbitsMap.size,
      openskyCount:    openskyMap.size,
      corroborated,
      anomalies,
      fetchedAt:       new Date().toISOString(),
    },
  }, { headers: cors });
});
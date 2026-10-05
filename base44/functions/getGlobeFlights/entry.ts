// Live worldwide flight data from adsb.lol (ODbL 1.0 — commercial-safe with attribution)
// Fetches military aircraft + regional snapshots around major aviation hubs.
// Attribution: "© OpenStreetMap contributors / adsb.lol" — displayed on the globe.

const CACHE_TTL_MS = 60 * 1000; // 60s — flights move fast
let cache = null;
let cacheTs = 0;

const REGIONS = [
  { name: 'NYC', lat: 40.6, lon: -73.8, dist: 450 },
  { name: 'London', lat: 51.5, lon: -0.1, dist: 450 },
  { name: 'Tokyo', lat: 35.7, lon: 140.4, dist: 450 },
];

function cleanAc(ac) {
  return {
    icao: ac.hex || '',
    flight: (ac.flight || '').trim(),
    lat: ac.lat,
    lon: ac.lon,
    alt: typeof ac.alt_baro === 'number' ? ac.alt_baro : null,
    track: ac.track || 0,
    gs: ac.gs || 0,
    squawk: ac.squawk || '',
    t: ac.t || '',
    own_op: ac.own_op || '',
    mil: ac.mil === true,
    emergency: ac.emergency || '',
  };
}

export default async function(req) {
  try {
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const milUrl = 'https://api.adsb.lol/v2/mil';
    const regionalUrls = REGIONS.map(r =>
      `https://api.adsb.lol/v2/lat/${r.lat}/lon/${r.lon}/dist/${r.dist}`
    );

    const fetchOpts = { headers: { 'Accept': 'application/json', 'User-Agent': 'TOP100-Aerospace-Globe/1.0 (https://top100aero.space)' }, signal: AbortSignal.timeout(8000) };
    const [milRes, ...regionalRes] = await Promise.all([
      fetch(milUrl, fetchOpts).catch(() => null),
      ...regionalUrls.map(u => fetch(u, fetchOpts).catch(() => null)),
    ]);

    const seen = new Set();
    const flights = [];

    // Military flights
    if (milRes && milRes.ok) {
      const milData = await milRes.json().catch(() => ({}));
      for (const ac of (milData.ac || [])) {
        if (!ac.lat || !ac.lon) continue;
        const key = ac.hex || `${ac.lat},${ac.lon}`;
        if (seen.has(key)) continue;
        seen.add(key);
        flights.push(cleanAc(ac));
      }
    }

    // Regional snapshots
    for (const res of regionalRes) {
      if (!res || !res.ok) continue;
      const data = await res.json().catch(() => ({}));
      for (const ac of (data.ac || [])) {
        if (!ac.lat || !ac.lon) continue;
        const key = ac.hex || `${ac.lat},${ac.lon}`;
        if (seen.has(key)) continue;
        seen.add(key);
        flights.push(cleanAc(ac));
      }
    }

    const result = {
      flights,
      total: flights.length,
      military: flights.filter(f => f.mil).length,
      source: 'adsb.lol',
      attribution: '© OpenStreetMap contributors / adsb.lol',
      fetched_at: new Date().toISOString(),
    };

    // Only cache non-empty results — empty likely means API issue
    if (flights.length > 0) {
      cache = result;
      cacheTs = Date.now();
    }

    return Response.json(result);
  } catch (error) {
    if (cache) return Response.json({ ...cache, cached: true, stale: true });
    return Response.json({ error: error.message, flights: [] }, { status: 500 });
  }
}
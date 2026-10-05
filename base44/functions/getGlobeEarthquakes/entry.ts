// Live earthquake data from USGS (U.S. public domain).
// Fetches magnitude 2.5+ events from the last 24 hours.
// Attribution: "Data courtesy of the U.S. Geological Survey"

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
let cache = null;
let cacheTs = 0;

export default async function(req) {
  try {
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return Response.json({ error: `USGS error: ${res.status}`, earthquakes: [] }, { status: res.status });
    }

    const data = await res.json();
    const earthquakes = (data.features || []).map(f => {
      const [lon, lat, depth] = f.geometry.coordinates;
      return {
        id: f.id,
        place: f.properties.place || 'Unknown',
        mag: f.properties.mag,
        depth, // km
        lat,
        lon,
        time: f.properties.time,
        url: f.properties.url,
        tsunami: f.properties.tsunami === 1,
      };
    }).filter(e => e.mag != null && e.lat != null);

    const result = {
      earthquakes,
      total: earthquakes.length,
      significant: earthquakes.filter(e => e.mag >= 4.5).length,
      source: 'USGS',
      attribution: 'Data courtesy of the U.S. Geological Survey',
      fetched_at: new Date().toISOString(),
    };

    cache = result;
    cacheTs = Date.now();

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message, earthquakes: [] }, { status: 500 });
  }
}
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// GPSJam.org provides daily GeoJSON files of GPS jamming data - completely free
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // GPSJam publishes daily GeoJSON - use the last 3 days and merge
    const dates = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const results = await Promise.allSettled(
      dates.map(date =>
        fetch(`https://gpsjam.org/geo.json?date=${date}`, { signal: AbortSignal.timeout(8000) })
          .then(r => r.ok ? r.json() : null)
      )
    );

    const events = [];
    results.forEach((result, idx) => {
      if (result.status !== 'fulfilled' || !result.value) return;
      const geojson = result.value;
      const features = geojson.features || [];
      // Filter for high interference (level >= 2)
      features
        .filter(f => f.properties?.level >= 2)
        .forEach(f => {
          const coords = f.geometry?.coordinates;
          events.push({
            id: `${dates[idx]}-${coords?.[0]}-${coords?.[1]}`,
            region: f.properties?.name || `${coords?.[1]?.toFixed(1)}°N, ${coords?.[0]?.toFixed(1)}°E`,
            location_name: f.properties?.name || 'Unknown Region',
            type: 'GNSS Jamming',
            severity: f.properties?.level >= 3 ? 'high' : 'medium',
            detected_at: new Date(dates[idx]).toISOString(),
            longitude: coords?.[0],
            latitude: coords?.[1],
            level: f.properties?.level,
          });
        });
    });

    // Sort by level descending, deduplicate nearby events
    events.sort((a, b) => (b.level || 0) - (a.level || 0));

    return Response.json({ events: events.slice(0, 50) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
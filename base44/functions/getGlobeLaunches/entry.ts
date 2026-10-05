// Upcoming space launches from Launch Library 2 (permissive license, attribution encouraged).
// Uses mode=detailed to get pad latitude/longitude for globe placement.
// Attribution: "The Space Devs / Launch Library 2"

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — LL2 anonymous limit is 15/hr
let cache = null;
let cacheTs = 0;

export default async function(req) {
  try {
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS) {
      return Response.json({ ...cache, cached: true });
    }

    const url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=30&mode=detailed&ordering=net';
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (cache) return Response.json({ ...cache, cached: true, stale: true });
      return Response.json({ error: `LL2 error: ${res.status}`, launches: [] }, { status: res.status });
    }

    const data = await res.json();
    const raw = data.results || [];

    const launches = raw
      .filter(l => l.pad?.latitude != null && l.pad?.longitude != null)
      .map(l => ({
        id: l.id,
        name: l.name,
        net: l.net,
        status: l.status ? { name: l.status.name, abbrev: l.status.abbrev } : null,
        lsp: l.launch_service_provider
          ? { name: l.launch_service_provider.name, abbrev: l.launch_service_provider.abbrev }
          : null,
        mission: l.mission
          ? { name: l.mission.name, description: l.mission.description, type: l.mission.type }
          : null,
        rocket: l.rocket?.configuration ? { name: l.rocket.configuration.name } : null,
        pad: {
          name: l.pad.name,
          lat: parseFloat(l.pad.latitude),
          lon: parseFloat(l.pad.longitude),
          location: l.pad.location ? { name: l.pad.location.name } : null,
        },
        image: l.image?.image_url || (typeof l.image === 'string' ? l.image : null),
        vidURLs: (l.vidURLs || [])
          .filter(v => v?.url && typeof v.url === 'string')
          .slice(0, 3)
          .map(v => ({ url: v.url, title: v.title || 'Watch Live' })),
      }));

    const result = {
      launches,
      total: launches.length,
      source: 'The Space Devs / Launch Library 2',
      attribution: 'The Space Devs / Launch Library 2',
      fetched_at: new Date().toISOString(),
    };

    cache = result;
    cacheTs = Date.now();

    return Response.json(result);
  } catch (error) {
    if (cache) return Response.json({ ...cache, cached: true, stale: true });
    return Response.json({ error: error.message, launches: [] }, { status: 500 });
  }
}
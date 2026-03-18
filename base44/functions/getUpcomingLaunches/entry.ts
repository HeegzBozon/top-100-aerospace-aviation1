const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
let cache = null;
let cacheTs = 0;

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(body.limit || 10, 20);
    const offset = body.offset || 0;

    // Serve from cache if fresh and we have enough records
    if (cache && (Date.now() - cacheTs) < CACHE_TTL_MS && cache.length >= offset + limit) {
      return Response.json({ launches: cache.slice(offset, offset + limit), cached: true });
    }

    // Fetch enough to cover the requested range
    const fetchLimit = Math.max(limit + offset, 20);
    const apiUrl = `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${fetchLimit}&offset=0&mode=normal`;
    const response = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return Response.json({ error: `API error: ${response.status} - ${errText.slice(0, 200)}` }, { status: response.status });
    }

    const data = await response.json();
    const raw = data.results || [];

    // Trim to only frontend-needed fields
    const launches = raw.map(l => ({
      id: l.id,
      name: l.name,
      net: l.net,
      status: l.status ? { name: l.status.name, abbrev: l.status.abbrev } : null,
      launch_service_provider: l.launch_service_provider
        ? { name: l.launch_service_provider.name, abbrev: l.launch_service_provider.abbrev }
        : null,
      rocket: l.rocket?.configuration
        ? { configuration: { name: l.rocket.configuration.name } }
        : null,
      mission: l.mission
        ? { name: l.mission.name, description: l.mission.description, type: l.mission.type }
        : null,
      pad: l.pad?.location
        ? { name: l.pad.name, location: { name: l.pad.location.name } }
        : null,
      image: l.image?.image_url || (typeof l.image === 'string' ? l.image : null),
      vidURLs: (l.vidURLs || [])
        .filter(v => v?.url && typeof v.url === 'string')
        .slice(0, 3)
        .map(v => ({ url: v.url, title: v.title || 'Watch Live' })),
    }));

    cache = launches;
    cacheTs = Date.now();

    return Response.json({ launches: launches.slice(offset, offset + limit) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
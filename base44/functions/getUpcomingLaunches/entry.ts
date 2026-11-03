import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// The launch library throttles hard: a burst of visitors asking for the programme at once
// gets a 429, and an empty theatre is what the visitor saw. So the last good payload is
// kept in the app's own store and served while upstream is resting. The cache is the fix,
// not a decoration: without it the theatre empties itself every few minutes.
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_KEY = 'upcoming';
const UPSTREAM = [
  'https://ll.thespacedevs.com/2.3.0/launches/upcoming/',
  'https://ll.thespacedevs.com/2.2.0/launch/upcoming/',
];

function trim(l) {
  return {
    id: l.id,
    name: l.name,
    net: l.net,
    status: l.status ? { name: l.status.name, abbrev: l.status.abbrev } : null,
    launch_service_provider: l.launch_service_provider
      ? { name: l.launch_service_provider.name, abbrev: l.launch_service_provider.abbrev }
      : null,
    rocket: l.rocket?.configuration ? { configuration: { name: l.rocket.configuration.name } } : null,
    mission: l.mission ? { name: l.mission.name, description: l.mission.description, type: l.mission.type } : null,
    pad: l.pad?.location ? { name: l.pad.name, location: { name: l.pad.location.name } } : null,
    image: l.image?.image_url || (typeof l.image === 'string' ? l.image : null),
    vidURLs: (l.vidURLs || [])
      .filter((v) => v?.url && typeof v.url === 'string')
      .slice(0, 3)
      .map((v) => ({ url: v.url, title: v.title || 'Watch Live' })),
  };
}

// A second provider, in the same shape as the first. The launch library throttles a whole
// campus reading the programme at once; this one does not, so the theatre keeps playing.
function fromRocketLaunch(l) {
  const iso = l.t0
    ? new Date(l.t0).toISOString()
    : l.sort_date
      ? new Date(Number(l.sort_date) * 1000).toISOString()
      : null;
  const media = Array.isArray(l.media) ? l.media.find((m) => m?.url) : null;
  return {
    id: `rl-${l.id}`,
    name: l.name,
    net: iso,
    status: { name: l.est_date ? 'Estimated' : 'Scheduled', abbrev: l.est_date ? 'TBC' : 'Go' },
    launch_service_provider: l.provider?.name ? { name: l.provider.name } : null,
    rocket: l.vehicle?.name ? { configuration: { name: l.vehicle.name } } : null,
    mission: l.missions?.[0]
      ? {
          name: l.missions[0].name,
          description: l.mission_description || l.launch_description || null,
          type: null,
        }
      : null,
    pad: l.pad ? { name: l.pad.name, location: { name: l.pad.location?.name || '' } } : null,
    image: media?.url || null,
    vidURLs: [],
  };
}

// Two hosts, one attempt each: whichever answers first is the programme.
async function readUpstream(limit) {
  for (const base of UPSTREAM) {
    try {
      const res = await fetch(`${base}?limit=${limit}&mode=normal`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const raw = Array.isArray(data?.results) ? data.results : [];
      if (raw.length) return raw.map(trim);
    } catch {
      // try the next host
    }
  }

  try {
    const res = await fetch('https://fdo.rocketlaunch.live/json/launches/next/20', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const raw = Array.isArray(data?.result) ? data.result : [];
      const list = raw.map(fromRocketLaunch).filter((l) => l.net);
      if (list.length) return list.slice(0, limit);
    }
  } catch {
    // nothing left to try
  }

  return null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 20);
    const offset = Math.max(Number(body.offset) || 0, 0);
    const want = Math.max(limit + offset, 20);

    const page = await base44.asServiceRole.entities.LaunchFeedCache
      .filter({ feed: CACHE_KEY }, { limit: 1 })
      .catch(() => ({ items: [] }));
    const record = page?.items?.[0] || null;
    const kept = Array.isArray(record?.launches) ? record.launches : [];
    const age = record?.fetched_at ? Date.now() - new Date(record.fetched_at).getTime() : Infinity;

    if (kept.length >= offset + limit && age < CACHE_TTL_MS) {
      return Response.json({ launches: kept.slice(offset, offset + limit), cached: true });
    }

    const launches = await readUpstream(want);

    if (launches) {
      const write = { feed: CACHE_KEY, launches, fetched_at: new Date().toISOString() };
      if (record?.id) await base44.asServiceRole.entities.LaunchFeedCache.update(record.id, write).catch(() => {});
      else await base44.asServiceRole.entities.LaunchFeedCache.create(write).catch(() => {});
      return Response.json({ launches: launches.slice(offset, offset + limit) });
    }

    // Upstream is resting: the last programme we read is still the best one we have.
    if (kept.length) {
      return Response.json({ launches: kept.slice(offset, offset + limit), cached: true, stale: true });
    }
    return Response.json({ launches: [], error: 'feed_unavailable' });
  } catch (error) {
    return Response.json({ launches: [], error: error.message }, { status: 500 });
  }
}
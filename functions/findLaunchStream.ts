const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const streamCache = new Map(); // launchId -> { url, ts }

/**
 * Search YouTube Data API v3 for a live or upcoming stream matching a launch.
 * Tries: live streams first, then scheduled upcoming, then recent videos.
 */
async function searchYouTubeStream(query) {
  if (!YOUTUBE_API_KEY) return null;

  // Try liveBroadcastContent=live first, then upcoming
  for (const broadcastType of ['live', 'upcoming', 'none']) {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      eventType: broadcastType === 'none' ? 'completed' : broadcastType,
      maxResults: '3',
      order: 'relevance',
      key: YOUTUBE_API_KEY,
    });

    // For 'none' (no live broadcast), skip — we only want live/upcoming
    if (broadcastType === 'none') break;

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) continue;

    const data = await res.json();
    const items = data.items || [];

    if (items.length > 0) {
      const videoId = items[0]?.id?.videoId;
      if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    if (!YOUTUBE_API_KEY) {
      return Response.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const { launchId, launchName, provider } = body;

    if (!launchId || !launchName) {
      return Response.json({ error: 'launchId and launchName required' }, { status: 400 });
    }

    // Return cached result if fresh
    const cached = streamCache.get(launchId);
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
      return Response.json({ url: cached.url, cached: true });
    }

    // Build search queries — most specific first
    const providerName = provider || '';
    const queries = [
      `${launchName} launch live stream`,
      `${providerName} ${launchName} live`,
      `${providerName} launch webcast`,
    ].filter(q => q.trim().length > 3);

    let foundUrl = null;
    for (const q of queries) {
      foundUrl = await searchYouTubeStream(q);
      if (foundUrl) break;
    }

    // Cache result (even null, to avoid hammering the API)
    streamCache.set(launchId, { url: foundUrl, ts: Date.now() });

    return Response.json({ url: foundUrl });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
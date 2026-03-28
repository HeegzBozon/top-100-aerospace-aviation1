import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

const CHANNELS = {
  bloomberg: 'UCRE8HTNHHu1sxZhRmBb4xdQ',
  sky: 'UCAbqEHcMuyOsoVnE3fMYYxg',
  bbc: 'UCn84jAPeC7nUIJNbwHI5ocQ',
  aljazeera: 'UCNsMjmQg5dAuaX78nbreKAA',
};

async function findLiveStreamForChannel(channelId) {
  if (!YOUTUBE_API_KEY) return null;

  const params = new URLSearchParams({
    part: 'snippet',
    channelId: channelId,
    eventType: 'live',
    type: 'video',
    maxResults: '1',
    key: YOUTUBE_API_KEY,
  });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    return item?.id?.videoId || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    if (!YOUTUBE_API_KEY) {
      return Response.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 503 });
    }

    const results = {};
    for (const [key, channelId] of Object.entries(CHANNELS)) {
      results[key] = await findLiveStreamForChannel(channelId);
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
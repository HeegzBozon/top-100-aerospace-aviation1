// Resolves the current live video ID for a YouTube channel using YouTube Data API v3

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const API_KEY = Deno.env.get('YOUTUBE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelId } = await req.json();
    if (!channelId) {
      return Response.json({ error: 'Missing channelId parameter' }, { status: 400 });
    }

    if (!API_KEY) {
      return Response.json({ error: 'YOUTUBE_API_KEY not configured' }, { status: 500 });
    }

    // Search for live broadcasts on this channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${API_KEY}`;
    
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!res.ok) {
      console.error('YouTube API error:', JSON.stringify(data));
      return Response.json({ videoId: null, isLive: false, error: data.error?.message || 'API error' });
    }

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return Response.json({
        videoId: item.id.videoId,
        isLive: true,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
      });
    }

    return Response.json({ videoId: null, isLive: false, channelName: null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
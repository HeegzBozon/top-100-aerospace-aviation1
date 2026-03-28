/**
 * Resolves the current live video ID for a YouTube channel handle.
 * Uses the YouTube Data API to fetch the channel's uploads playlist
 * and returns the most recent video.
 */

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const channelHandle = url.searchParams.get('channel');
    
    if (!channelHandle) {
      return Response.json({ error: 'Missing channel param' }, { status: 400 });
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    // Step 1: Get channel ID from handle
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelHandle)}&key=${apiKey}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (!channelRes.ok) throw new Error('Failed to fetch channel');
    const channelData = await channelRes.json();
    
    if (!channelData.items?.length) {
      return Response.json({ videoId: null });
    }

    const channelId = channelData.items[0].id.channelId;

    // Step 2: Get channel details to find uploads playlist
    const detailsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (!detailsRes.ok) throw new Error('Failed to fetch channel details');
    const detailsData = await detailsRes.json();
    
    if (!detailsData.items?.length) {
      return Response.json({ videoId: null });
    }

    const uploadsPlaylistId = detailsData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 3: Get recent videos from uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`,
      { signal: AbortSignal.timeout(3000) }
    );
    
    if (!playlistRes.ok) throw new Error('Failed to fetch playlist items');
    const playlistData = await playlistRes.json();
    
    if (!playlistData.items?.length) {
      return Response.json({ videoId: null });
    }

    const videoId = playlistData.items[0].snippet.resourceId.videoId;
    return Response.json({ videoId });
  } catch (error) {
    console.error('[resolveYouTubeLive]', error);
    return Response.json({ videoId: null, error: error.message }, { status: 200 });
  }
});
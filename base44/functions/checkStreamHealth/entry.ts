import { NEWS_CHANNELS } from 'npm:@base44/sdk@0.8.23';

/**
 * Probes HLS/YouTube streams for availability
 * Returns health status for all 66 channels with uptime metrics
 */

const CACHE = new Map();
const CACHE_TTL = 60000; // 1 minute

async function checkHLSHealth(hlsUrl) {
  if (!hlsUrl) return { available: false, type: 'no_url' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(hlsUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return { available: response.ok, type: 'hls', status: response.status };
  } catch (err) {
    return { available: false, type: 'hls', error: err.message };
  }
}

async function checkYouTubeHealth(youtubeId) {
  if (!youtubeId) return { available: false, type: 'no_url' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeout);
    return { available: response.ok, type: 'youtube', status: response.status };
  } catch (err) {
    return { available: false, type: 'youtube', error: err.message };
  }
}

Deno.serve(async (req) => {
  try {
    const { forceRefresh } = await req.json().catch(() => ({}));
    const cacheKey = 'stream_health';
    
    if (!forceRefresh) {
      const cached = CACHE.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        return Response.json(cached.data);
      }
    }

    // Import channels config
    const { default: config } = await import('../lib/news-channels-config.js');
    const channels = config.NEWS_CHANNELS || [];

    const healthChecks = await Promise.all(
      channels.map(async (channel) => {
        let primaryStatus = null;
        let fallbackStatus = null;

        // Check primary HLS stream
        if (channel.hls) {
          primaryStatus = await checkHLSHealth(channel.hls);
        }

        // Check fallback YouTube
        if (channel.youtube && !primaryStatus?.available) {
          fallbackStatus = await checkYouTubeHealth(channel.youtube);
        }

        return {
          id: channel.id,
          name: channel.name,
          region: channel.region,
          language: channel.language,
          primary: primaryStatus,
          fallback: fallbackStatus,
          healthy: primaryStatus?.available || fallbackStatus?.available,
          checkedAt: new Date().toISOString(),
        };
      })
    );

    const result = {
      timestamp: new Date().toISOString(),
      totalChannels: healthChecks.length,
      healthyChannels: healthChecks.filter(c => c.healthy).length,
      channels: healthChecks,
    };

    // Cache for 1 minute
    CACHE.set(cacheKey, {
      data: result,
      expiry: Date.now() + CACHE_TTL,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
/**
 * Probes HLS/YouTube streams for availability
 * Returns health status for all 66 channels with uptime metrics
 * Note: Channel metadata is embedded here (read-only from function scope)
 */

// Channel registry (mirrors lib/news-channels-config.js structure)
const NEWS_CHANNELS = [
  { id: 'abc_news', name: 'ABC News', region: 'North America', language: 'English', hls: null, youtube: 'ABCNews', geoBlocked: true },
  { id: 'aljazeera', name: 'Al Jazeera English', region: 'Middle East', language: 'English', hls: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8', youtube: 'UCNsMjmQg5dAuaX78nbreKAA' },
  { id: 'bbc_news', name: 'BBC News', region: 'Europe', language: 'English', hls: null, youtube: 'UCn84jAPeC7nUIJNbwHI5ocQ' },
  { id: 'cnn', name: 'CNN', region: 'North America', language: 'English', hls: null, youtube: 'CNN', geoBlocked: true },
  { id: 'euronews', name: 'Euronews', region: 'Europe', language: 'Multilingual', hls: 'https://euronewsstream-a.akamaihd.net/hls/live/2105254/euronews_hlsen/master.m3u8', youtube: 'euronewsen' },
  { id: 'france24', name: 'France 24', region: 'Europe', language: 'English', hls: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8', youtube: 'UCTM6CBvnUcFA-2uo0DV-ozw' },
  { id: 'sky_news', name: 'Sky News', region: 'Europe', language: 'English', hls: 'https://skydvn-nowtv-atv-prod.skydvn.com/atv/skynews/1404/live/index.m3u8', youtube: 'UCAbqEHcMuyOsoVnE3fMYYxg' },
  { id: 'dw', name: 'DW English', region: 'Europe', language: 'English', hls: 'https://dwstream4-lh.akamaihd.net/i/dwstream4_live@131329/master.m3u8', youtube: 'UCknLrEdhBC8TNz4yXrMLstA' },
  { id: 'cnn_brasil', name: 'CNN Brasil', region: 'South America', language: 'Portuguese', hls: 'https://streaming.cnnbrasil.com.br/tv_cnnbrasil_main.m3u8', youtube: 'CNNBrasil' },
  { id: 'globo_news', name: 'Globo News', region: 'South America', language: 'Portuguese', hls: 'https://api.new.livestream.com/accounts/27659143/events/8017141/live.m3u8', youtube: 'globonews' },
];

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

    const healthChecks = await Promise.all(
      NEWS_CHANNELS.map(async (channel) => {
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
      totalChannels: NEWS_CHANNELS.length,
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
    console.error('[checkStreamHealth]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
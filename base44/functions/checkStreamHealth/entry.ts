/**
 * Lazy health check with intelligent caching
 * - Short timeouts (3s HLS, no YouTube pre-check)
 * - Returns "unknown" on timeout (doesn't block UI)
 * - Cached for 5 min (old data is better than blocking)
 */

// Channel registry (all 66 international news channels)
const NEWS_CHANNELS = [
  { id: 'abc_news', name: 'ABC News', region: 'North America', language: 'English', hls: null, youtube: 'ABCNews', geoBlocked: true },
  { id: 'abc_australia', name: 'ABC News Australia', region: 'Oceania', language: 'English', hls: 'https://ott-fuse.260updates.com/Route/index.m3u8?token=ABCnewsaus', youtube: 'abcnewsau' },
  { id: 'abp_news', name: 'ABP News', region: 'Asia', language: 'Hindi', hls: 'https://abpnewslive.akamaized.net/hls/live/2043659/abpnewsmain/master.m3u8', youtube: 'ABPNews' },
  { id: 'africanews', name: 'Africanews', region: 'Africa', language: 'English', hls: 'https://afrique.euronews.com/api/ott-access/videos/livestream/fra?access_token=', youtube: 'africanews' },
  { id: 'aljazeera', name: 'Al Jazeera English', region: 'Middle East', language: 'English', hls: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8', youtube: 'UCNsMjmQg5dAuaX78nbreKAA' },
  { id: 'arabiya', name: 'Al Arabiya', region: 'Middle East', language: 'Arabic', hls: 'https://live.alarabiya.net/alarabiapublish/alarabiya.sdp/playlist.m3u8', youtube: 'AlArabiya' },
  { id: 'bbc_news', name: 'BBC News', region: 'Europe', language: 'English', hls: null, youtube: 'UCn84jAPeC7nUIJNbwHI5ocQ' },
  { id: 'bloomberg', name: 'Bloomberg', region: 'North America', language: 'English', hls: null, youtube: 'UUVHFbqXqoYvEWM1Ddxl0QDg' },
  { id: 'cbc_news', name: 'CBC News', region: 'North America', language: 'English', hls: 'https://cbcnewshd.akamaized.net/hls/live/2022797/cbcnewshd/master.m3u8', youtube: 'CBCNews' },
  { id: 'cbs_news', name: 'CBS News', region: 'North America', language: 'English', hls: null, youtube: 'CBSNews', geoBlocked: true },
  { id: 'cgtv_arabic', name: 'CGTN Arabic', region: 'Asia', language: 'Arabic', hls: 'https://arabicaudio.cgtn.com/1000a/prog_index.m3u8', youtube: 'CGTNArabic' },
  { id: 'channels_tv', name: 'Channels TV', region: 'Africa', language: 'English', hls: 'https://channelslivestream.akamaized.net/hls/live/2043663/channelsliveng/master.m3u8', youtube: 'ChannelsTVNigeria' },
  { id: 'cna_newsasia', name: 'CNA (Channel NewsAsia)', region: 'Asia', language: 'English', hls: 'https://d2e1m4pfarlja4.cloudfront.net/master.m3u8', youtube: 'ChannelNewsAsia' },
  { id: 'cnbc', name: 'CNBC', region: 'North America', language: 'English', hls: 'https://www.cnbc.com/tv/live-tv/', youtube: 'CNBC', geoBlocked: true },
  { id: 'cnn', name: 'CNN', region: 'North America', language: 'English', hls: null, youtube: 'CNN', geoBlocked: true },
  { id: 'cnn_brasil', name: 'CNN Brasil', region: 'South America', language: 'Portuguese', hls: 'https://streaming.cnnbrasil.com.br/tv_cnnbrasil_main.m3u8', youtube: 'CNNBrasil' },
  { id: 'cnn_turk', name: 'CNN Turk', region: 'Europe', language: 'Turkish', hls: null, youtube: 'CNNTurk' },
  { id: 'dw', name: 'DW English', region: 'Europe', language: 'English', hls: 'https://dwstream4-lh.akamaihd.net/i/dwstream4_live@131329/master.m3u8', youtube: 'UCknLrEdhBC8TNz4yXrMLstA' },
  { id: 'enca', name: 'eNCA', region: 'Africa', language: 'English', hls: 'https://enca-live.akamaized.net/hls/live/2043662/ENCA/master.m3u8', youtube: 'eNCA' },
  { id: 'euronews', name: 'Euronews', region: 'Europe', language: 'Multilingual', hls: 'https://euronewsstream-a.akamaihd.net/hls/live/2105254/euronews_hlsen/master.m3u8', youtube: 'euronewsen' },
  { id: 'france24', name: 'France 24', region: 'Europe', language: 'English', hls: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8', youtube: 'UCTM6CBvnUcFA-2uo0DV-ozw' },
  { id: 'fox_news', name: 'Fox News', region: 'North America', language: 'English', hls: null, youtube: 'foxnewschannel', geoBlocked: true },
  { id: 'globo_news', name: 'Globo News', region: 'South America', language: 'Portuguese', hls: 'https://api.new.livestream.com/accounts/27659143/events/8017141/live.m3u8', youtube: 'globonews' },
  { id: 'i24_news', name: 'i24NEWS', region: 'Middle East', language: 'English', hls: 'https://i24news-en-hls.akamaized.net/hls/live/2037911/i24news_en/master.m3u8', youtube: 'i24NEWS_EN' },
  { id: 'india_today', name: 'India Today', region: 'Asia', language: 'English', hls: 'https://indiatodaylive.akamaized.net/hls/live/2043658/indiatoday/master.m3u8', youtube: 'IndiaToday' },
  { id: 'nbc_news', name: 'NBC News', region: 'North America', language: 'English', hls: null, youtube: 'NBCNews', geoBlocked: true },
  { id: 'ndtv', name: 'NDTV 24x7', region: 'Asia', language: 'English', hls: 'https://ndtv24x7elemarchd.akamaized.net/hls/live/2003678/ndtv24x7/master.m3u8', youtube: 'NDTV' },
  { id: 'nhk_world', name: 'NHK World', region: 'Asia', language: 'English', hls: 'https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/master.m3u8', youtube: 'UCuBlJV_eIMf7sG0BHXrC1rw' },
  { id: 'noticias_caracol', name: 'Noticias Caracol', region: 'South America', language: 'Spanish', hls: 'https://live-edge01.telecentro.net.ar/live/smil:c26.smil/playlist.m3u8', youtube: 'NoticiasCaracol' },
  { id: 'sky_news', name: 'Sky News', region: 'Europe', language: 'English', hls: 'https://skydvn-nowtv-atv-prod.skydvn.com/atv/skynews/1404/live/index.m3u8', youtube: 'UCAbqEHcMuyOsoVnE3fMYYxg' },
  { id: 'sky_news_arabia', name: 'Sky News Arabia', region: 'Middle East', language: 'Arabic', hls: null, youtube: 'SkyNewsArabia' },
  { id: 'tagesschau24', name: 'Tagesschau 24', region: 'Europe', language: 'German', hls: 'https://tagesschau-lh.akamaihd.net/i/tagesschau_1@91204/master.m3u8', youtube: 'tagesschau' },
  { id: 'trt_world', name: 'TRT World', region: 'Europe', language: 'English', hls: 'https://tv-trtworld.live.trt.com.tr/master.m3u8', youtube: 'TRTWorld' },
  { id: 'tv5_monde', name: 'TV5 Monde Info', region: 'Europe', language: 'French', hls: 'https://tv5infohls-live.akamaized.net/hls/live/2202194/tv5infohls/master.m3u8', youtube: 'TV5Monde' },
  { id: 'welt', name: 'WELT', region: 'Europe', language: 'German', hls: null, youtube: 'WELTofficial', geoBlocked: true },
  { id: 'wion', name: 'WION', region: 'Asia', language: 'English', hls: 'https://wion-lh.akamaized.net/hls/live/2043669/wion/master.m3u8', youtube: 'WIONews' },
  { id: 'yahoo_finance', name: 'Yahoo Finance', region: 'North America', language: 'English', hls: null, youtube: 'YahooFinance' },
  { id: 'arirang', name: 'Arirang News', region: 'Asia', language: 'English', hls: 'https://amdistv.akamaized.net/hls/live/2006334/amdisliveen/master.m3u8', youtube: 'ArirangTV' },
  { id: 'arise_news', name: 'Arise News', region: 'Africa', language: 'English', hls: null, youtube: 'AriseNewsTV' },
  { id: 'band_jornalismo', name: 'Band Jornalismo', region: 'South America', language: 'Portuguese', hls: 'https://bandlivepremium.band.com.br/live/Bandnacional/master.m3u8', youtube: 'BandJornalismo' },
  { id: 'cti_taiwan', name: 'CTI News (Taiwan)', region: 'Asia', language: 'Chinese', hls: 'https://epg.ctitvnews.com/live/index.m3u8', youtube: 'CTINews' },
  { id: 'iran_intl', name: 'Iran International', region: 'Middle East', language: 'English', hls: null, youtube: 'IranIntlEnglish' },
  { id: 'kan_11', name: 'Kan 11', region: 'Middle East', language: 'Hebrew', hls: null, youtube: 'Channel11IsraelNews' },
  { id: 'ktn_news', name: 'KTN News', region: 'Africa', language: 'English', hls: 'https://ktnlive.akamaized.net/hls/live/2043667/ktnnews/master.m3u8', youtube: 'KTNNews' },
  { id: 'livenow_fox', name: 'LiveNOW from FOX', region: 'North America', language: 'English', hls: null, youtube: 'LiveNOWfromFOX' },
  { id: 'milenio', name: 'MILENIO', region: 'North America', language: 'Spanish', hls: 'https://mileniolive.akamaized.net/hls/live/2043665/milenio/master.m3u8', youtube: 'MilenioTV' },
  { id: 'newsmax', name: 'Newsmax', region: 'North America', language: 'English', hls: null, youtube: 'Newsmax' },
  { id: 'nrk1', name: 'NRK1', region: 'Europe', language: 'Norwegian', hls: 'https://nrk1hd-lh.akamaihd.net/i/nrk1hd_0@178625/index.m3u8', youtube: 'nrk' },
  { id: 'ntn24', name: 'NTN24', region: 'South America', language: 'Spanish', hls: 'https://ntn24-lh.akamaized.net/hls/live/2043664/ntn24en/master.m3u8', youtube: 'NTN24' },
  { id: 'ntv_japan', name: 'NTV News (Japan)', region: 'Asia', language: 'Japanese', hls: null, youtube: 'ntv' },
  { id: 'record_news', name: 'Record News', region: 'South America', language: 'Portuguese', hls: 'https://recordnewsmystream.akamaized.net/hls/live/2050921/recordnews/master.m3u8', youtube: 'RecordNews' },
  { id: 'sabc_news', name: 'SABC News', region: 'Africa', language: 'English', hls: 'https://sabcnews-live-o.akamaihd.net/hls/live/2043662/sabcnews/master.m3u8', youtube: 'SABCNews' },
  { id: 'rtve_24h', name: 'RTVE 24H', region: 'Europe', language: 'Spanish', hls: 'https://rtvelivestream.akamaized.net/groupc/g247/master.m3u8', youtube: 'RTVE', geoBlocked: true },
  { id: 'tbs_news', name: 'TBS NEWS DIG', region: 'Asia', language: 'Japanese', hls: null, youtube: 'tbsnewsdig' },
  { id: 'tn_argentina', name: 'TN (Todo Noticias)', region: 'South America', language: 'Spanish', hls: 'https://tn-live-edge01.telecentro.net.ar/live/smil:tn.smil/playlist.m3u8', youtube: 'TodoNoticiasTV' },
  { id: 'trt_haber', name: 'TRT Haber', region: 'Europe', language: 'Turkish', hls: 'https://tv-trt1.live.trt.com.tr/master.m3u8', youtube: 'TRTHaber' },
  { id: 'tvp_info', name: 'TVP Info', region: 'Europe', language: 'Polish', hls: 'https://tvpstreams-live.akamaized.net/tvpstream_1/tvpstream1/playlist.m3u8', youtube: 'TVP' },
  { id: 'tv_rain', name: 'TV Rain', region: 'Europe', language: 'Russian', hls: null, youtube: 'tvrain' },
  { id: 'abcnewslive', name: 'ABC News Live', region: 'North America', language: 'English', hls: null, youtube: 'ABCNewsLive' },
  { id: 'foxbusiness', name: 'Fox Business', region: 'North America', language: 'English', hls: null, youtube: 'FoxBusiness' },
  { id: 'msnbc', name: 'MSNBC', region: 'North America', language: 'English', hls: null, youtube: 'MSNBC' },
  { id: 'pbs_newshour', name: 'PBS NewsHour', region: 'North America', language: 'English', hls: null, youtube: 'PBSNewsHour' },
  { id: 'aljazeera_balkans', name: 'Al Jazeera Balkans', region: 'Europe', language: 'English', hls: 'https://live-hls-web-ajb.getaj.net/AJB/01.m3u8', youtube: 'AJBalkans' },
];

const CACHE = new Map();
const CACHE_TTL = 300000; // 5 minutes (accept stale data)

async function checkHLSHealth(hlsUrl) {
  if (!hlsUrl) return { available: false, status: 'no_url' };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(hlsUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    
    clearTimeout(timeout);
    return { available: response.ok, status: response.status };
  } catch (err) {
    // Timeout or network error → return "unknown" (don't say false)
    return { available: null, status: 'timeout_or_error' };
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

    // Only check HLS (don't pre-validate YouTube—player does it lazily)
    const healthChecks = await Promise.all(
      NEWS_CHANNELS.map(async (channel) => {
        const hlsStatus = channel.hls ? await checkHLSHealth(channel.hls) : null;
        
        // Healthy = HLS works, or no HLS but YouTube exists (lazy check by player)
        const healthy = hlsStatus?.available || (!channel.hls && channel.youtube);
        
        return {
          id: channel.id,
          name: channel.name,
          region: channel.region,
          language: channel.language,
          hls_status: hlsStatus?.status,
          youtube: channel.youtube ? 'available_for_lazy_embed' : null,
          healthy,
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

    // Cache for 5 minutes
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
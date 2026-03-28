// Primary HLS stream URLs for news channels
// These are direct m3u8 feeds that bypass YouTube restrictions and provide better stability
export const HLS_STREAMS = {
  bloomberg: {
    name: 'Bloomberg',
    icon: '📊',
    hls: null, // Bloomberg actively blocks HLS access, fallback to YouTube
    youtube: 'Bloomberg', // Search term for YouTube
  },
  sky: {
    name: 'Sky News',
    icon: '🌐',
    hls: 'https://skydvn-nowtv-atv-prod.skydvn.com/atv/skynews/1404/live/index.m3u8',
    youtube: 'SKY News Live',
  },
  bbc: {
    name: 'BBC World',
    icon: '🎬',
    hls: null, // BBC restricts geographic access, fallback to YouTube
    youtube: 'BBC News Live',
  },
  aljazeera: {
    name: 'Al Jazeera',
    icon: '📡',
    hls: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    youtube: 'Al Jazeera English',
  },
  dw: {
    name: 'DW English',
    icon: '📺',
    hls: 'https://dwstream4-lh.akamaihd.net/i/dwstream4_live@131329/master.m3u8',
    youtube: 'DW News',
  },
  france24: {
    name: 'France 24',
    icon: '🇫🇷',
    hls: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8',
    youtube: 'France 24 English',
  },
  nhk: {
    name: 'NHK World',
    icon: '🌏',
    hls: 'https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/master.m3u8',
    youtube: 'NHK World',
  },
};
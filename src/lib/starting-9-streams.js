/**
 * Starting 9 Roster: The Aerospace Talent Graph's Operating System
 * 3x3 MVP Grid targeting Space, Aviation, and Global Macro domains
 */

export const STARTING_9_STREAMS = [
  // ROW 1: SPACE FRONTIER ($600B Space Tech Market)
  {
    id: 'iss_earth_view',
    title: 'ISS Earth Viewing Feed',
    category: 'space',
    subtitle: 'Live from Orbit',
    description: 'HD video feed from the International Space Station. The ultimate prestige stream.',
    stream_url: 'jDKdHnrKAck', // NASA ISS Earth Viewing Channel
    source_type: 'youtube',
    region: 'Orbital',
    row: 1,
    col: 1,
    icon: '🛰️',
    domain: 'Space Exploration',
    signal_value: 'highest',
  },
  {
    id: 'starbase_boca_chica',
    title: 'Starbase Boca Chica 24/7',
    category: 'space',
    subtitle: 'Starship Test Site',
    description: 'The heartbeat of modern rocketry. Every propulsion engineer watches here.',
    stream_url: 'https://stream.labpadre.com/index.m3u8', // LabPadre/NSF HLS
    source_type: 'hls',
    region: 'South Texas, USA',
    row: 1,
    col: 2,
    icon: '🚀',
    domain: 'Space Exploration',
    signal_value: 'highest',
  },
  {
    id: 'esa_web_tv',
    title: 'ESA Web TV',
    category: 'space',
    subtitle: 'European Space Agency',
    description: 'Ariane launches and European orbital operations. Global footprint coverage.',
    stream_url: '2Ek-I0bkMUU', // ESA Live (typical YouTube channel stream)
    source_type: 'youtube',
    region: 'Europe (Multi-national)',
    row: 1,
    col: 3,
    icon: '🇪🇺',
    domain: 'Space Exploration',
    signal_value: 'high',
  },

  // ROW 2: COMMERCIAL AVIATION OPERATIONS
  {
    id: 'lax_live_tarmac',
    title: 'LAX Live Tarmac',
    category: 'aviation',
    subtitle: 'High-Density Operations',
    description: 'Multi-runway commercial aviation. Pilots leave this running all day.',
    stream_url: 'jvPyHeWJTvI', // Airline Videos Live (LAX)
    source_type: 'youtube',
    region: 'Los Angeles, USA',
    row: 2,
    col: 1,
    icon: '✈️',
    domain: 'Commercial Aviation',
    signal_value: 'high',
  },
  {
    id: 'heathrow_approach',
    title: 'Heathrow (LHR) Approach',
    category: 'aviation',
    subtitle: 'European Aviation Hub',
    description: 'Heavy-jet traffic on the world\'s busiest international runway.',
    stream_url: 'kJb69p6nzrw', // Heathrow Live (typical stream ID)
    source_type: 'youtube',
    region: 'London, UK',
    row: 2,
    col: 2,
    icon: '🛬',
    domain: 'Commercial Aviation',
    signal_value: 'high',
  },
  {
    id: 'adsb_telemetry_live',
    title: 'Live ADS-B Telemetry',
    category: 'aviation',
    subtitle: 'Global Flight Traffic Map',
    description: 'Real-time radar grid of active flights worldwide. The Command Center view.',
    stream_url: 'https://globe.adsbexchange.com/', // ADS-B Exchange embedded map
    source_type: 'web_embed',
    region: 'Global',
    row: 2,
    col: 3,
    icon: '📡',
    domain: 'Commercial Aviation',
    signal_value: 'highest',
  },

  // ROW 3: GLOBAL MACRO, DEFENSE & POLICY ($2.2T Defense Spend)
  {
    id: 'bloomberg_live',
    title: 'Bloomberg Live',
    category: 'macro',
    subtitle: 'Financial Pulse',
    description: 'Aerospace mergers, defense budgets, policy shifts. The money moves.',
    stream_url: 'https://www.bloomberg.com/live', // Bloomberg Live embed
    source_type: 'web_embed',
    region: 'Global (Financial)',
    row: 3,
    col: 1,
    icon: '📊',
    domain: 'Defense & Policy',
    signal_value: 'high',
  },
  {
    id: 'france24_english',
    title: 'France 24 (English)',
    category: 'macro',
    subtitle: 'European Defense Posturing',
    description: 'NATO policy, Airbus movements, European defense. Geopolitical context.',
    stream_url: 'RjJWt_WE5ys', // France 24 live (typical YouTube)
    source_type: 'youtube',
    region: 'Europe',
    row: 3,
    col: 2,
    icon: '🇫🇷',
    domain: 'Defense & Policy',
    signal_value: 'high',
  },
  {
    id: 'sky_news_live',
    title: 'Sky News Live',
    category: 'macro',
    subtitle: 'Breaking Global News',
    description: 'High-quality, real-time breaking news on defense, policy, and markets.',
    stream_url: 'https://news.sky.com/watch/live', // Sky News Live embed
    source_type: 'web_embed',
    region: 'UK / Global',
    row: 3,
    col: 3,
    icon: '📡',
    domain: 'Defense & Policy',
    signal_value: 'high',
  },
];
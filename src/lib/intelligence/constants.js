export const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };

export const AIRCRAFT_TYPE_LABELS = {
  0: 'Unknown', 1: 'Fighter', 2: 'Bomber', 3: 'Transport', 4: 'Tanker',
  5: 'AWACS', 6: 'Recon', 7: 'Helicopter', 8: 'Drone', 9: 'Patrol',
  10: 'Special Ops', 11: 'VIP', 12: 'Unknown',
};

export const OPERATOR_LABELS = {
  0: 'Unknown', 1: 'USAF', 2: 'USN', 3: 'USMC', 4: 'US Army',
  5: 'RAF', 6: 'Royal Navy', 7: 'French AF', 8: 'Luftwaffe',
  9: 'PLAAF', 10: 'PLAN', 11: 'VKS', 12: 'IAF', 13: 'NATO', 14: 'Other',
};

export const POSTURE_COLORS = {
  normal:     { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  dot: '#22c55e' },
  raised:     { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', dot: '#eab308' },
  heightened: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', dot: '#f97316' },
  maximum:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    dot: '#ef4444' },
  unknown:    { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-200',  dot: '#94a3b8' },
};

export const THEATER_LABELS = {
  EUCOM: 'European Command', INDOPACOM: 'Indo-Pacific Command',
  CENTCOM: 'Central Command', NORTHCOM: 'Northern Command',
  SOUTHCOM: 'Southern Command', AFRICOM: 'Africa Command',
};

export const DEFENSE_TICKERS = ['LMT', 'RTX', 'BA', 'NOC', 'GD', 'LDOS'];

export const TICKER_NAMES = {
  LMT: 'Lockheed Martin', RTX: 'RTX Corp', BA: 'Boeing',
  NOC: 'Northrop Grumman', GD: 'General Dynamics', LDOS: 'Leidos',
};

export const SATELLITE_TYPE_COLORS = {
  military:      'bg-red-100 text-red-700 border-red-200',
  sar:           'bg-blue-100 text-blue-700 border-blue-200',
  optical:       'bg-purple-100 text-purple-700 border-purple-200',
  communication: 'bg-green-100 text-green-700 border-green-200',
};

export const THREAT_COLORS = {
  1: 'bg-slate-100 text-slate-600 border-slate-200',
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
  4: 'bg-red-100 text-red-700 border-red-200',
  5: 'bg-red-200 text-red-900 border-red-400',
};

export const THREAT_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical', 5: 'Severe' };

export const AEROSPACE_ENTITIES = [
  // Manufacturers & primes
  'Boeing', 'Airbus', 'Lockheed Martin', 'Raytheon', 'Northrop Grumman',
  'General Dynamics', 'BAE Systems', 'Thales', 'Leonardo', 'Safran',
  'Pratt & Whitney', 'GE Aviation', 'Rolls-Royce', 'Honeywell',
  'L3Harris', 'SAIC', 'Leidos', 'Textron', 'Embraer', 'Dassault',
  // Space
  'SpaceX', 'NASA', 'ESA', 'Blue Origin', 'Rocket Lab', 'ULA',
  'Arianespace', 'ISRO', 'JAXA', 'Roscosmos',
  // Regulators & bodies
  'EASA', 'NATO', 'Pentagon', 'DARPA',
  // Programs
  'F-35', 'F-22', 'B-21', 'A400M', 'C-17', 'MQ-9',
  'Starlink', 'Starship', 'Artemis',
  // Short tokens (word-boundary matched in code)
  'FAA', 'ICAO',
];

// Aviation & aerospace industry
export const AVIATION_RSS_FEEDS = [
  'https://simpleflying.com/feed/',
  'https://www.aerotime.aero/feed',
  'https://airlinegeeks.com/feed/',
  'https://aviationweek.com/rss/all',
  'https://www.aviationpros.com/rss',
  'https://aerospaceamerica.aiaa.org/feed/',
  'https://www.flightglobal.com/rss/news',      // corrected path
  'https://theaviationgeekclub.com/feed/',
  'https://theaviationist.com/feed/',
  'https://www.aopa.org/news-and-media/rss/aopa-news.xml',
  'https://www.c4isrnet.com/rss/all',
  'https://www.airforcemag.com/feed/',
];

// Defense & geopolitics
export const DEFENSE_RSS_FEEDS = [
  'https://www.defensenews.com/rss/',
  'https://breakingdefense.com/feed/',
  'https://www.janes.com/feeds/news',
  'https://www.militarytimes.com/rss/news/',
  'https://www.navalnews.com/feed/',
  'https://www.thedrive.com/the-war-zone/rss',
  'https://taskandpurpose.com/feed/',
  'https://navaltoday.com/feed/',
  'https://www.defenseindustrydaily.com/feed/',
  'https://www.armytimes.com/rss/news/',
];

// Space & technology
export const SPACE_RSS_FEEDS = [
  'https://spacenews.com/feed/',
  'https://www.nasaspaceflight.com/feed/',
  'https://spaceflightnow.com/feed/',
  'https://arstechnica.com/tag/space/feed/',
  'https://payloadspace.com/feed/',
  'https://www.bbc.co.uk/news/technology/rss.xml',
];

// All feeds combined for RSS raw query
export const ALL_RSS_FEEDS = [
  ...AVIATION_RSS_FEEDS,
  ...DEFENSE_RSS_FEEDS,
  ...SPACE_RSS_FEEDS,
];

// ICAO hex prefixes used by military operators
export const MILITARY_HEX_PREFIXES = [
  'AE',              // US military (AE0000-AFFFFF)
  'AF',              // US military overflow
  '43C', '43D',      // UK military
  '3F',              // Germany military
  '3A',              // France military
  '33',              // Italy military
  '34',              // Spain military
  'C0',              // Canada military
  '7C',              // Australia military
  '50',              // Israel military
  'E4',              // Brazil military
  '70',              // Pakistan military
  '80',              // India military
  '78',              // China military (limited)
  '15',              // Russia military (limited)
  '87',              // Japan JASDF
  '71C',             // South Korea ROKAF
  '4B',              // Turkey Air Force
  '47',              // Norway Royal AF
  '48D',             // Poland Air Force
  '4C',              // NATO AWACS
  '710',             // Saudi Arabia Air Force
  '896',             // UAE Air Force
];

export const AIRCRAFT_MODEL_PATTERNS = [
  { pattern: /F-?1[5678]|F-?22|F-?35|Rafale|Typhoon|Gripen|MiG|Su-?[23]\d/i,        role: 'Fighter' },
  { pattern: /KC-?1[03]|KC-?46|A330.*MRTT|VC-?10|Il-?78/i,                            role: 'Tanker' },
  { pattern: /C-?130|C-?17|C-?5\b|A400|Il-?76|An-?124|Y-?20/i,                       role: 'Transport' },
  { pattern: /\bE-?3\b|\bE-?7\b|A-?50|KJ-?[0-9]/i,                                   role: 'AWACS' },
  { pattern: /RC-?135|U-?2\b|EP-?3|E-?8\b|WC-?135|P-?[13]\b|P-?8\b/i,              role: 'Recon' },
  { pattern: /B-?52|B-?1\b|B-?2\b|Tu-?9[05]|Tu-?160|Tu-?22|H-?6\b/i,               role: 'Bomber' },
  { pattern: /RQ-?4|MQ-?[19]|RQ-?170|Global Hawk|Reaper|Predator/i,                  role: 'Drone' },
  { pattern: /UH-?60|CH-?4[67]|AH-?64|Mi-?\d+|Ka-?52|Black.?Hawk|Chinook|Apache/i,  role: 'Helicopter' },
];

export const THEATER_BOUNDS = {
  EUCOM:     [35, -30, 72,  40],
  CENTCOM:   [10,  25, 45,  75],
  INDOPACOM: [-10, 60, 50, 180],
  NORTHCOM:  [15, -170, 72, -50],
  SOUTHCOM:  [-60, -120, 15, -30],
  AFRICOM:   [-35, -20, 37,  55],
};

// THEATER_DEFS — single source of truth for globe polygon rendering.
// bounds: [minLng, minLat, maxLng, maxLat] (GeoJSON convention, lng first)
export const THEATER_DEFS = [
  { id: 'EUCOM',     color: '#3b82f6', bounds: [-30, 35,  40,  72] },
  { id: 'CENTCOM',   color: '#f59e0b', bounds: [ 25, 10,  75,  45] },
  { id: 'INDOPACOM', color: '#6366f1', bounds: [ 60,-10, 180,  55] },
  { id: 'NORTHCOM',  color: '#10b981', bounds: [-170,15, -50,  72] },
  { id: 'SOUTHCOM',  color: '#8b5cf6', bounds: [-120,-60,-30,  15] },
  { id: 'AFRICOM',   color: '#ec4899', bounds: [ -20,-35,  55,  37] },
];

export const MARITIME_RSS_FEEDS = [
  'https://www.maritimebulletin.net/feed/',         // piracy + incident tracker
  'https://gcaptain.com/feed/',                      // maritime news
  'https://www.maritime-executive.com/feed/',        // industry news
  'https://www.hellenicshippingnews.com/feed/',      // global shipping
];

export const MARITIME_CHOKEPOINTS = [
  { name: 'Strait of Hormuz', lat: 26.5, lon: 56.3, traffic: 'high', risk: 'elevated', dailyShips: 50 },
  { name: 'Bab el-Mandeb', lat: 12.6, lon: 43.3, traffic: 'high', risk: 'high', dailyShips: 40 },
  { name: 'Strait of Malacca', lat: 1.4, lon: 103.8, traffic: 'high', risk: 'low', dailyShips: 80 },
  { name: 'Suez Canal', lat: 30.5, lon: 32.3, traffic: 'high', risk: 'elevated', dailyShips: 55 },
  { name: 'Panama Canal', lat: 9.1, lon: -79.7, traffic: 'medium', risk: 'low', dailyShips: 35 },
  { name: 'Taiwan Strait', lat: 24.5, lon: 119.5, traffic: 'high', risk: 'elevated', dailyShips: 60 },
  { name: 'Gibraltar Strait', lat: 35.9, lon: -5.6, traffic: 'high', risk: 'low', dailyShips: 70 },
  { name: 'Danish Straits', lat: 55.7, lon: 12.6, traffic: 'medium', risk: 'low', dailyShips: 30 },
];

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
  2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  3: 'bg-orange-100 text-orange-700 border-orange-200',
  4: 'bg-red-100 text-red-700 border-red-200',
};

export const THREAT_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };

export const AEROSPACE_ENTITIES = ['Boeing', 'Airbus', 'NASA', 'SpaceX', 'FAA', 'ICAO'];

// Aviation & aerospace industry
export const AVIATION_RSS_FEEDS = [
  'https://simpleflying.com/feed/',
  'https://www.aerotime.aero/feed',
  'https://airlinegeeks.com/feed/',
  'https://aviationweek.com/rss/all',
  'https://www.aviationpros.com/rss',
  'https://aerospaceamerica.aiaa.org/feed/',
  'https://www.flightglobal.com/rss',
  'https://theaviationgeekclub.com/feed/',
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
];

// Space & technology
export const SPACE_RSS_FEEDS = [
  'https://spacenews.com/feed/',
  'https://www.nasaspaceflight.com/feed/',
  'https://spaceflightnow.com/feed/',
  'https://arstechnica.com/tag/space/feed/',
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

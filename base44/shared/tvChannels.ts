// THE LINEUP — the broadcasters TOP 100 TV carries, and where each one sits on the wall.
//
// Every channel id below was read back from the YouTube Data API, not typed from memory:
// the desk is a public instrument, so a channel that does not resolve is a dead square on
// it. A Stream record holds the editorial state of a channel — whether it is carried, its
// sponsor, its order — while this holds which channel it actually is and where it is placed.
//
// Rows are the wall's three tiers: the frontier, the industry, the world desk.

export const TV_CHANNELS = [
  {
    key: 'nasa',
    name: 'NASA',
    channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
    domain: 'Space Exploration & Systems',
    region: 'Earth Orbit',
    row: 1,
    icon: 'Rocket',
  },
  {
    key: 'spacex',
    name: 'SpaceX',
    channelId: 'UCtI0Hodo5o5dUb67FeUjDeA',
    domain: 'Space Exploration & Systems',
    region: 'Starbase, Texas',
    row: 1,
    icon: 'Rocket',
  },
  {
    key: 'bloomberg',
    name: 'Bloomberg Television',
    channelId: 'UCIALMKvObZNtJ6AmdCLP7Lg',
    domain: 'Entrepreneurship & Startups',
    region: 'North America',
    row: 2,
    icon: 'TrendingUp',
  },
  {
    key: 'nhk',
    name: 'NHK WORLD-JAPAN',
    channelId: 'UCSPEjw8F2nQDtmUKPFNF7_A',
    domain: 'Manufacturing & Operations',
    region: 'Asia',
    row: 2,
    icon: 'Factory',
  },
  {
    key: 'bbc',
    name: 'BBC News',
    channelId: 'UC16niRr50-MSBwiO3YDb3RA',
    domain: 'Policy & Governance',
    region: 'Europe',
    row: 3,
    icon: 'Globe',
  },
  {
    key: 'sky',
    name: 'Sky News',
    channelId: 'UCoMdktPbSTixAyNGwb-UYkQ',
    domain: 'Defense & National Security',
    region: 'Europe',
    row: 3,
    icon: 'Globe',
  },
  {
    key: 'france24',
    name: 'FRANCE 24 English',
    channelId: 'UCQfwfsi5VrQ8yKZ-UWmAEFg',
    domain: 'Policy & Governance',
    region: 'Europe',
    row: 3,
    icon: 'Globe',
  },
  {
    key: 'aljazeera',
    name: 'Al Jazeera English',
    channelId: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    domain: 'Policy & Governance',
    region: 'Middle East',
    row: 3,
    icon: 'Globe',
  },
];

export const CHANNEL_BY_KEY = TV_CHANNELS.reduce((acc, channel) => {
  acc[channel.key] = channel;
  return acc;
}, {});

export const CHANNEL_BY_ID = TV_CHANNELS.reduce((acc, channel) => {
  acc[channel.channelId] = channel;
  return acc;
}, {});

// Records filed before the channels were confirmed carry a placeholder ('static_france24',
// a bare '01.m3u8') or an id that no longer answers. They are read through this bridge — and
// read case-insensitively, since the placeholders were typed by hand — so no square on the
// wall is dead while the records are re-filed. Nothing else uses it.
export const LEGACY_SOURCES = {
  static_france24: 'france24',
  static_skynews: 'sky',
  bloomberg: 'bloomberg',
  '01.m3u8': 'aljazeera',
  // Ids that once stood in for BBC News and NHK WORLD-JAPAN and do not resolve.
  'ucn84japc7nuijnbwhi5ocq': 'bbc',
  'ucubljv_eimf7sg0bhxrc1rw': 'nhk',
};

const CHANNEL_ID = /^UC[\w-]{22}$/;
const VIDEO_ID = /^[\w-]{11}$/;

// Which channel a record stands for: declared on the record first, then read off its source.
export function channelForStream(stream) {
  const declared = stream?.metadata?.channel_key;
  if (declared && CHANNEL_BY_KEY[declared]) return CHANNEL_BY_KEY[declared];

  const source = String(stream?.stream_url || '').trim();
  if (!source) return null;
  if (CHANNEL_BY_ID[source]) return CHANNEL_BY_ID[source];

  const legacy = LEGACY_SOURCES[source.toLowerCase()];
  if (legacy) return CHANNEL_BY_KEY[legacy] || null;
  return null;
}

// A source that is already a finished video rather than a channel.
export function isVideoId(source) {
  const value = String(source || '').trim();
  return VIDEO_ID.test(value) && !CHANNEL_ID.test(value);
}
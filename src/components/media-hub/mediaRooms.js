// The Media Hub's rooms: one definition read by the Colony map and the Media Hub page.
// Bounds are grid cells on the 1024×576 floor plan (16px each). `to` is null while planned.
export const MEDIA_ROOMS = [
  { key: 'main-studio', label: 'Main Studio', kicker: 'Live + Broadcast', line: 'The Newsstand: editions, articles and dispatches.', to: '/newsstand', col: 22, row: 6, w: 20, h: 10 },
  { key: 'news-desk', label: 'News Desk', kicker: 'Industry + Updates', line: 'The latest dispatches and release notes from campus.', to: '/newsstand', col: 48, row: 18, w: 15, h: 6 },
  { key: 'podcast-studio', label: 'Podcast Studio', kicker: 'Audio + Video', line: 'TOP 100 TV: programming from across the network.', to: '/top100-tv', col: 48, row: 6, w: 15, h: 6 },
  { key: 'interview-lounge', label: 'Interview Lounge', kicker: 'Private + VIP', line: 'Book a conversation with a Fellow.', to: '/aerosync/meetings', col: 44, row: 26, w: 19, h: 9 },
  { key: 'content-lab', label: 'Content Lab', kicker: 'Graphics + Social + Shorts', line: 'The press kit studio: your record, ready to share.', to: '/press-kit', col: 1, row: 18, w: 15, h: 6 },
  { key: 'media-lounge', label: 'Media Lounge', kicker: 'Creators + Honorees + Press', line: 'Meet the people behind the stories.', to: '/aerosync/people', col: 1, row: 26, w: 18, h: 9 },
  { key: 'production-control', label: 'Production Control', kicker: 'Broadcast operations', line: 'Where every program is cued and called.', to: null, col: 1, row: 6, w: 15, h: 6 },
  { key: 'editing-suites', label: 'Editing Suites', kicker: 'Post-production', line: 'Where interviews and features are cut.', to: null, col: 1, row: 12, w: 15, h: 6 },
  { key: 'green-screen', label: 'Green Screen', kicker: 'Creative + Virtual sets', line: 'Virtual sets for features and portraits.', to: null, col: 48, row: 12, w: 15, h: 6 },
];

export const mediaRoomPath = (key) => `/media-hub/${key}`;
export const findMediaRoom = (key) => MEDIA_ROOMS.find((r) => r.key === key);

// The rooms as Colony zones: every hotspot opens its room splash first.
export const mediaHubZones = () => MEDIA_ROOMS.map(({ key, label, line, col, row, w, h }) => (
  { key: `media-${key}`, label, blurb: line, to: mediaRoomPath(key), col, row, w, h }
));
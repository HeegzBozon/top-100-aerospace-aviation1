// The Expo Hub's buildings, in grid cells (each cell is 16px of the original 1024×576 plate).
// Standing inside one offers its door: the surface the building stands for.
export const COLONY_ZONES = [
  { key: 'innovation-expo', label: 'Innovation Expo', blurb: 'The App Store: tools that each do one job.', to: '/app-store', col: 6, row: 1, w: 16, h: 9 },
  { key: 'space-pavilion', label: 'Space Pavilion', blurb: 'Events: the conferences the network holds rooms in.', to: '/conferences', col: 46, row: 1, w: 13, h: 10 },
  { key: 'leadership-summit', label: 'Leadership Summit', blurb: 'The Chamber of Commerce.', to: '/chamber', col: 7, row: 14, w: 11, h: 6 },
  { key: 'networking-lounge', label: 'Networking Lounge', blurb: 'AeroSync: the people you have met.', to: '/aerosync', col: 46, row: 13, w: 13, h: 8 },
  { key: 'media-hub', label: 'Media Hub', blurb: 'The Newsstand: editions, articles and dispatches.', to: '/newsstand', col: 4, row: 23, w: 14, h: 8 },
  { key: 'career-center', label: 'Career Center', blurb: 'Classifieds: positions and mandates from Fellows.', to: '/classifieds', col: 47, row: 24, w: 12, h: 7 },
];

export const zoneAt = (col, row) =>
  COLONY_ZONES.find(z => col >= z.col && col < z.col + z.w && row >= z.row && row < z.row + z.h) || null;
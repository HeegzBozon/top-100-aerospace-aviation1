// The Expo Hub's rooms and their buildings, in grid cells (16px of each 1024×576 plate).
// A zone with `room` opens another map; a zone with `to` opens a surface.
export const COLONY_ROOMS = {
  hall: {
    label: 'Main Hall',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/da8f08016_AerospaceExpoHub_Top100.png',
    zones: [
      { key: 'innovation-expo', label: 'Innovation Expo', blurb: 'Step inside the aerospace showcase.', room: 'innovation-expo', col: 6, row: 1, w: 16, h: 9 },
      { key: 'space-pavilion', label: 'Space Pavilion', blurb: 'Events: the conferences the network holds rooms in.', to: '/conferences', col: 46, row: 1, w: 13, h: 10 },
      { key: 'leadership-summit', label: 'Leadership Summit', blurb: 'Step inside the summit hall.', room: 'leadership-summit', col: 7, row: 14, w: 11, h: 6 },
      { key: 'networking-lounge', label: 'Networking Lounge', blurb: 'AeroSync: the people you have met.', to: '/aerosync', col: 46, row: 13, w: 13, h: 8 },
      { key: 'media-hub', label: 'Media Hub', blurb: 'The Newsstand: editions, articles and dispatches.', to: '/newsstand', col: 4, row: 23, w: 14, h: 8 },
      { key: 'career-center', label: 'Career Center', blurb: 'Classifieds: positions and mandates from Fellows.', to: '/classifieds', col: 47, row: 24, w: 12, h: 7 },
    ],
  },
  'leadership-summit': {
    label: 'Leadership Summit',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/de65663c9_AerospaceLeadershipSummitHall.png',
    zones: [
      { key: 'summit-exit', label: 'Summit Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 33, w: 8, h: 3 },
      { key: 'summit-stage', label: 'Main Stage', blurb: 'The Chamber of Commerce.', to: '/chamber', col: 22, row: 8, w: 20, h: 9 },
    ],
  },
  'innovation-expo': {
    label: 'Innovation Expo',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/749cdb984_InnovationExpo_AerospaceShowcase.png',
    zones: [
      { key: 'expo-exit', label: 'Expo Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 33, w: 8, h: 3 },
      { key: 'innovation-hub', label: 'Innovation Hub', blurb: 'The App Store: tools that each do one job.', to: '/app-store', col: 26, row: 12, w: 12, h: 9 },
    ],
  },
};
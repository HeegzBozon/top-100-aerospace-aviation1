// The Expo Hub's rooms and their buildings, in grid cells (16px of each 1024×576 plate).
// A zone with `room` opens another map; a zone with `to` opens a surface.
export const COLONY_ROOMS = {
  // Where every visit begins: the main entrance, with the campus doors ahead.
  lobby: {
    label: 'Main Entrance',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/ff70af4fe_Top100AerospaceCampusLobby.png',
    zones: [
      { key: 'enter-campus', label: 'Enter the Campus', blurb: 'Walk through to the Main Hall.', room: 'hall', col: 26, row: 13, w: 13, h: 10 },
      { key: 'concierge', label: 'TOP 100 Concierge', blurb: 'Your mission briefing: why, who, what and how.', to: '/mission-briefing', col: 7, row: 22, w: 14, h: 5 },
      { key: 'campus-directory', label: 'Campus Directory', blurb: 'Every virtual room on the campus, one step away.', panel: 'directory', col: 43, row: 18, w: 9, h: 8 },
      { key: 'engine-exhibit', label: 'Engine Exhibit', blurb: 'Take the controls in the flight simulator.', to: '/play', col: 56, row: 18, w: 7, h: 7 },
      { key: 'lobby-lounge', label: 'Members Lounge', blurb: 'Chat live with everyone in the Colony.', panel: 'chat', col: 2, row: 28, w: 13, h: 6 },
    ],
  },
  hall: {
    label: 'Main Hall',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/da8f08016_AerospaceExpoHub_Top100.png',
    zones: [
      { key: 'hall-exit', label: 'Main Entrance', blurb: 'Head back out to the lobby.', room: 'lobby', col: 28, row: 34, w: 8, h: 2 },
      { key: 'innovation-expo', label: 'Innovation Expo', blurb: 'Step inside the aerospace showcase.', room: 'innovation-expo', col: 6, row: 1, w: 16, h: 9 },
      { key: 'space-pavilion', label: 'Space Pavilion', blurb: 'Step inside the pavilion.', room: 'space-pavilion', col: 46, row: 1, w: 13, h: 10 },
      { key: 'leadership-summit', label: 'Leadership Summit', blurb: 'Step inside the summit hall.', room: 'leadership-summit', col: 7, row: 14, w: 11, h: 6 },
      { key: 'networking-lounge', label: 'Networking Lounge', blurb: 'Step inside the lounge.', room: 'networking-lounge', col: 46, row: 13, w: 13, h: 8 },
      { key: 'media-hub', label: 'Media Hub', blurb: 'Step inside the studios.', room: 'media-hub', col: 4, row: 23, w: 14, h: 8 },
      { key: 'career-center', label: 'Career Center', blurb: 'Step inside the career floor.', room: 'career-center', col: 47, row: 24, w: 12, h: 7 },
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
  'media-hub': {
    label: 'Media Hub',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/f05d7b777_FuturisticAerospaceMediaHubFloorPlan.png',
    zones: [
      { key: 'media-exit', label: 'Media Hub Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 31, w: 8, h: 5 },
      { key: 'media-studio', label: 'Main Studio', blurb: 'The Newsstand: editions, articles and dispatches.', to: '/newsstand', col: 22, row: 6, w: 20, h: 10 },
    ],
  },
  'career-center': {
    label: 'Career Center',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/be39c8054_FuturisticAerospaceCareerCenterHub.png',
    zones: [
      { key: 'career-exit', label: 'Career Center Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'job-board', label: 'Job Board', blurb: 'Classifieds: positions and mandates from Fellows.', to: '/classifieds', col: 2, row: 8, w: 10, h: 7 },
      { key: 'career-resources', label: 'Career Resources', blurb: 'The career center desk in the Chamber.', to: '/chamber', col: 54, row: 24, w: 9, h: 8 },
    ],
  },
  'networking-lounge': {
    label: 'Networking Lounge',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/460dc8d2e_AerospaceNetworkingLoungeoftheFuture.png',
    zones: [
      { key: 'lounge-exit', label: 'Lounge Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'lounge-hub', label: 'The Hub', blurb: 'AeroSync: the people you have met.', to: '/aerosync', col: 25, row: 10, w: 14, h: 9 },
      { key: 'lounge-events', label: 'Events & Meetups', blurb: 'Meetups hosted across the network.', to: '/meetups', col: 4, row: 30, w: 14, h: 4 },
      { key: 'lounge-people', label: 'People & Directory', blurb: 'Your people in AeroSync.', to: '/aerosync/people', col: 46, row: 30, w: 15, h: 4 },
    ],
  },
  'space-pavilion': {
    label: 'Space Pavilion',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/2ba9f7379_SpacePavilion_AerospaceInnovationExpo.png',
    zones: [
      { key: 'pavilion-exit', label: 'Space Pavilion Entrance', blurb: 'Head back out to the Main Hall.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'pavilion-keynote', label: 'Keynote Stage', blurb: 'Events: the conferences the network holds rooms in.', to: '/conferences', col: 25, row: 6, w: 14, h: 7 },
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
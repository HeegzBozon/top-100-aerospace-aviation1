import { mediaHubZones } from '@/components/media-hub/mediaRooms';

// The Expo Hub's rooms and their buildings, in grid cells (16px of each 1024×576 plate).
// A zone with `room` opens another map; a zone with `to` opens a surface.
export const COLONY_ROOMS = {
  // Where every visit begins: the main entrance, with the campus doors ahead.
  lobby: {
    label: 'Main Entrance',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/f7aa33459_FuturisticTop100VotingHubLobby.png',
    zones: [
      { key: 'enter-campus', label: 'Enter the Campus', blurb: 'Walk through to the Main Campus.', room: 'hall', col: 26, row: 14, w: 12, h: 9 },
      { key: 'concierge', label: 'TOP 100 Concierge', blurb: 'Ask the concierge anything about TOP 100.', panel: 'concierge', col: 6, row: 25, w: 16, h: 3 },
      { key: 'campus-directory', label: 'Campus Directory', blurb: 'Every virtual room on the campus, one step away.', panel: 'directory', col: 38, row: 25, w: 9, h: 3 },
      { key: 'voting-hub', label: 'Voting Hub', blurb: 'Nominate, review and vote for the TOP 100.', to: '/selection-committee', col: 47, row: 26, w: 16, h: 4 },
      { key: 'flight-exhibit', label: 'Flight Exhibit', blurb: 'Take the controls in the flight simulator.', to: '/play', col: 9, row: 28, w: 6, h: 3 },
      { key: 'lobby-lounge', label: 'Members Lounge', blurb: 'Chat live with everyone in the Colony.', panel: 'chat', col: 0, row: 26, w: 9, h: 6 },
    ],
    // Cells nobody can walk into: the back wall, the concierge desk, the directory kiosk
    // and the Voting Hub board. The doors' corridor stays open.
    walls: [
      { col: 0, row: 0, w: 64, h: 13 },
      { col: 0, row: 13, w: 25, h: 8 },
      { col: 39, row: 13, w: 25, h: 4 },
      { col: 6, row: 21, w: 16, h: 4 },
      { col: 39, row: 17, w: 8, h: 8 },
      { col: 47, row: 17, w: 17, h: 9 },
    ],
  },
  hall: {
    label: 'Main Campus',
    // Visitors arrive through the globe entrance at the head of the hall.
    start: { col: 32, row: 14 },
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/da8f08016_AerospaceExpoHub_Top100.png',
    zones: [
      { key: 'hall-exit', label: 'Main Entrance', blurb: 'Head back out to the lobby.', room: 'lobby', col: 26, row: 9, w: 12, h: 4 },
      { key: 'innovation-expo', label: 'Innovation Expo', blurb: 'Step inside the aerospace showcase.', room: 'innovation-expo', col: 6, row: 1, w: 16, h: 9 },
      { key: 'space-pavilion', label: 'Space Pavilion', blurb: 'Step inside the pavilion.', room: 'space-pavilion', col: 46, row: 1, w: 13, h: 10 },
      { key: 'leadership-summit', label: 'Leadership Summit', blurb: 'Step inside the summit hall.', room: 'leadership-summit', col: 7, row: 14, w: 11, h: 6 },
      { key: 'networking-lounge', label: 'Networking Lounge', blurb: 'Step inside the lounge.', room: 'networking-lounge', col: 46, row: 13, w: 13, h: 8 },
      { key: 'media-hub', label: 'Media Hub', blurb: 'Step inside the studios.', room: 'media-hub', col: 4, row: 23, w: 14, h: 8 },
      { key: 'arcade', label: 'The Arcade', blurb: 'Three cabinets kept in the east wing.', room: 'arcade', col: 21, row: 25, w: 15, h: 6 },
      { key: 'career-center', label: 'Career Center', blurb: 'Step inside the career floor.', room: 'career-center', col: 47, row: 24, w: 12, h: 7 },
    ],
    // The hall's solid parts: the facade flanking the entrance steps, the outer
    // edges between buildings, and the foot of the campus. Every door stays open.
    walls: [
      { col: 22, row: 0, w: 6, h: 7 },
      { col: 36, row: 0, w: 10, h: 7 },
      { col: 0, row: 10, w: 6, h: 4 },
      { col: 59, row: 11, w: 5, h: 2 },
      { col: 0, row: 20, w: 4, h: 3 },
      { col: 59, row: 21, w: 5, h: 3 },
      { col: 0, row: 33, w: 64, h: 3 },
      // The TOP 100 seal in the middle of the plaza.
      { col: 26, row: 15, w: 12, h: 8 },
    ],
  },
  'leadership-summit': {
    label: 'Leadership Summit',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/de65663c9_AerospaceLeadershipSummitHall.png',
    zones: [
      { key: 'summit-exit', label: 'Summit Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 33, w: 8, h: 3 },
      { key: 'summit-stage', label: 'Main Stage', blurb: 'The Chamber of Commerce.', to: '/chamber', col: 22, row: 8, w: 20, h: 9 },
      // The briefing room off the hall floor: the hosted half of the patronage conversation.
      { key: 'summit-patrons-lounge', label: 'The Patrons’ Lounge', blurb: 'The briefing room: what attribution buys.', panel: 'sponsor-lounge', lounge: 'summit', col: 6, row: 22, w: 12, h: 7 },
    ],
  },
  'media-hub': {
    label: 'Media Hub',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/f05d7b777_FuturisticAerospaceMediaHubFloorPlan.png',
    zones: [
      { key: 'media-exit', label: 'Media Hub Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 31, w: 8, h: 5 },
      ...mediaHubZones(),
    ],
  },
  'career-center': {
    label: 'Career Center',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/be39c8054_FuturisticAerospaceCareerCenterHub.png',
    zones: [
      { key: 'career-exit', label: 'Career Center Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'job-board', label: 'Job Board', blurb: 'Classifieds: positions and mandates from Fellows.', to: '/classifieds', col: 2, row: 8, w: 10, h: 7 },
      { key: 'career-resources', label: 'Career Resources', blurb: 'The career center desk in the Chamber.', to: '/chamber', col: 54, row: 24, w: 9, h: 8 },
    ],
  },
  'networking-lounge': {
    label: 'Networking Lounge',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/460dc8d2e_AerospaceNetworkingLoungeoftheFuture.png',
    zones: [
      { key: 'lounge-exit', label: 'Lounge Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'lounge-hub', label: 'The Hub', blurb: 'AeroSync: the people you have met.', to: '/aerosync', col: 25, row: 10, w: 14, h: 9 },
      // The cabinets stand in the community corner of the lounge, where the talking happens:
      // a game opens in the room rather than sending anyone back out to the campus.
      { key: 'lounge-arcade', label: 'The Arcade', blurb: 'Three cabinets kept in the corner of the lounge.', panel: 'arcade', col: 3, row: 10, w: 14, h: 9 },
      { key: 'lounge-events', label: 'Events & Meetups', blurb: 'Meetups hosted across the network.', to: '/meetups', col: 4, row: 30, w: 14, h: 4 },
      { key: 'lounge-people', label: 'People & Directory', blurb: 'Your people in AeroSync.', to: '/aerosync/people', col: 46, row: 30, w: 15, h: 4 },
      // The open table in the corner of the lounge: the same offer, in the room where the
      // talking happens rather than the room where the panels are.
      { key: 'lounge-patrons-table', label: 'The Patrons’ Table', blurb: 'An open table for the patronage conversation.', panel: 'sponsor-lounge', lounge: 'networking', col: 46, row: 10, w: 13, h: 8 },
    ],
  },
  'space-pavilion': {
    label: 'Space Pavilion',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/2ba9f7379_SpacePavilion_AerospaceInnovationExpo.png',
    zones: [
      { key: 'pavilion-exit', label: 'Space Pavilion Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 30, w: 8, h: 6 },
      { key: 'pavilion-keynote', label: 'Keynote Stage', blurb: 'Events: the conferences the network holds rooms in.', to: '/conferences', col: 25, row: 6, w: 14, h: 7 },
      { key: 'pavilion-theatre', label: 'Mission Theatre', blurb: 'The broadcast, the bill, and the next mission off the pad.', panel: 'theatre', col: 20, row: 15, w: 24, h: 10 },
    ],
  },
  'innovation-expo': {
    label: 'Innovation Expo',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/749cdb984_InnovationExpo_AerospaceShowcase.png',
    zones: [
      { key: 'expo-exit', label: 'Expo Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 33, w: 8, h: 3 },
      { key: 'innovation-hub', label: 'Innovation Hub', blurb: 'The App Store: tools that each do one job.', to: '/app-store', col: 26, row: 12, w: 12, h: 9 },
    ],
  },
  // The east wing: three cabinets, the board the house keeps its records on, and the
  // chess tables. A cabinet opens in the room rather than sending you to the surface,
  // so the floor stays behind the glass while a game is played.
  arcade: {
    label: 'The Arcade',
    map: 'https://media.base44.com/images/public/68996845be6727838fdb822e/e53dce092_generated_image.png',
    zones: [
      { key: 'arcade-exit', label: 'Arcade Entrance', blurb: 'Head back out to the Main Campus.', room: 'hall', col: 28, row: 31, w: 8, h: 4 },
      { key: 'cabinet-sentinel', label: 'Sentinel', blurb: 'Hold the line above the terminator.', panel: 'arcade', cabinet: 'sentinel', col: 8, row: 5, w: 9, h: 6 },
      { key: 'cabinet-belt-run', label: 'Belt Run', blurb: 'Thread the debris field.', panel: 'arcade', cabinet: 'belt-run', col: 27, row: 5, w: 9, h: 6 },
      { key: 'cabinet-guardian', label: 'Guardian', blurb: 'Six cities under the arc.', panel: 'arcade', cabinet: 'guardian', col: 46, row: 5, w: 9, h: 6 },
      { key: 'cabinet-sim', label: 'The Simulator', blurb: 'Take a campaign up in the flight simulator.', to: '/play', col: 53, row: 18, w: 8, h: 8 },
      { key: 'record-board', label: 'The Record Board', blurb: 'What each machine has seen this season.', panel: 'arcade', col: 2, row: 14, w: 6, h: 9 },
      { key: 'chess-tables', label: 'Chess Tables', blurb: 'Take a board in the TOP 100 chess club.', to: '/ChessClub', col: 4, row: 26, w: 10, h: 4 },
    ],
  },
};
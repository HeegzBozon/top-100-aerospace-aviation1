// The campus cast: twelve staff characters, each stationed in an existing room.
// Actions only route to existing surfaces, rooms or panels — no character decides
// eligibility, touches a ballot or computes a result.
const IMG = 'https://media.base44.com/images/public/68996845be6727838fdb822e/';

export const COLONY_CAST = [
  { id: 'founder', name: 'The Founder', role: 'Campus Concierge', room: 'lobby', col: 24, row: 26, sprite: IMG + '0f62a6e5d_generated_image.png',
    signature: 'Aloha, and welcome aboard. Your journey starts here.',
    greeting: 'Aloha! I run the front door. Ask me anything, or let me point you to your next step.',
    actions: [
      { key: 'ask', label: 'Ask the concierge', panel: 'concierge' },
      { key: 'enter', label: 'Enter the campus', room: 'hall' },
      { key: 'vote', label: 'Go to the Voting Hub', to: '/selection-committee' },
      { key: 'profile', label: 'Set up my record', to: '/record' },
      { key: 'replay', label: 'Replay the welcome', replay: true },
    ] },
  { id: 'vera', name: 'Vera', role: 'Director of Nominations', room: 'lobby', col: 45, row: 29, sprite: IMG + 'd6f3301bd_generated_image.png',
    signature: 'Every extraordinary career deserves consideration.',
    greeting: 'Welcome to the nominations desk.',
    actions: [
      { key: 'nominate', label: 'Submit a nomination', to: '/selection-committee' },
      { key: 'process', label: 'Explore the selection process', to: '/review' },
      { key: 'claim', label: 'Claim my profile', to: '/ClaimProfile' },
    ] },
  { id: 'quinn', name: 'Quinn', role: 'Voting Commissioner', room: 'lobby', col: 50, row: 31, sprite: IMG + '7bf617b64_generated_image.png',
    signature: 'Your voice helps shape the future.',
    greeting: 'Ballots are cast in the Voting Hub. The official system counts them; I just show you the way.',
    actions: [
      { key: 'vote', label: 'Open my ballot', to: '/selection-committee' },
      { key: 'archive', label: 'Browse past editions', to: '/review' },
    ] },
  { id: 'atlas', name: 'Atlas', role: 'Campus Operations AI', room: 'hall', col: 32, row: 26, sprite: IMG + '36f1c6818_generated_image.png',
    signature: "Destination confirmed. Let's get you there.",
    greeting: 'Campus systems online. Choose a destination and I will take you there.',
    actions: [
      { key: 'directory', label: 'Open the campus directory', panel: 'directory' },
      { key: 'lobby', label: 'Main Entrance', room: 'lobby' },
      { key: 'expo', label: 'Innovation Expo', room: 'innovation-expo' },
      { key: 'space', label: 'Space Pavilion', room: 'space-pavilion' },
      { key: 'summit', label: 'Leadership Summit', room: 'leadership-summit' },
      { key: 'media', label: 'Media Hub', room: 'media-hub' },
      { key: 'career', label: 'Career Center', room: 'career-center' },
      { key: 'lounge', label: 'Networking Lounge', room: 'networking-lounge' },
    ] },
  { id: 'aurora', name: 'Aurora', role: 'Keeper of the Laurels', room: 'hall', col: 24, row: 28, sprite: IMG + '65309d487_generated_image.png',
    signature: 'Excellence deserves to be remembered.',
    greeting: 'This plaza is our hall of honour. Every honoree is on the record.',
    actions: [
      { key: 'women', label: 'TOP 100 Women 2025', to: '/women-2025' },
      { key: 'archive', label: 'The archive', to: '/review' },
      { key: 'viral', label: 'Top viral posts', to: '/viralpost2026' },
    ] },
  { id: 'nova', name: 'Nova', role: 'Chief Innovation Officer', room: 'innovation-expo', col: 22, row: 24, sprite: IMG + '0772ef8a0_generated_image.png',
    signature: 'What if the impossible is just the prototype?',
    greeting: 'Welcome to the expo floor. Everything here does one job, and does it well.',
    actions: [
      { key: 'store', label: 'Explore the App Store', to: '/app-store' },
      { key: 'sim', label: 'Try the flight simulator', to: '/play' },
    ] },
  { id: 'orion', name: 'Orion', role: 'Space Mission Commander', room: 'space-pavilion', col: 22, row: 18, sprite: IMG + '9ae93008e_generated_image.png',
    signature: 'The next frontier is calling.',
    greeting: 'Mission control is live. Launches, satellites and the conferences behind them.',
    actions: [
      { key: 'globe', label: 'Intelligence globe', to: '/intelligence-globe' },
      { key: 'conf', label: 'Conferences', to: '/conferences' },
      { key: 'artemis', label: 'Artemis mission brief', to: '/artemis-mission-brief' },
    ] },
  { id: 'athena', name: 'Athena', role: 'Summit Director', room: 'leadership-summit', col: 20, row: 20, sprite: IMG + '4684e34fd_generated_image.png',
    signature: 'Leadership is measured by what we make possible for others.',
    greeting: 'The summit is in session. Find your next room and the people in it.',
    actions: [
      { key: 'events', label: 'Events calendar', to: '/events' },
      { key: 'conf', label: 'Attend a conference', to: '/conferences/attend' },
    ] },
  { id: 'sterling', name: 'Sterling', role: 'Director of Partnerships', room: 'leadership-summit', col: 44, row: 20, sprite: IMG + 'd876ac4ef_generated_image.png',
    signature: 'Great partnerships build legacies.',
    greeting: 'This is our patrons lounge. Partnerships here are introductions first.',
    actions: [
      { key: 'chamber', label: 'Visit the Chamber', to: '/chamber' },
      { key: 'membership', label: 'Membership', to: '/Membership' },
    ] },
  { id: 'echo', name: 'Echo', role: 'Editor-in-Chief', room: 'media-hub', col: 20, row: 20, sprite: IMG + '094689e70_generated_image.png',
    signature: 'History remembers the stories we choose to tell.',
    greeting: 'The presses are running. Editions, features and dispatches are on the rack.',
    actions: [
      { key: 'news', label: 'The Newsstand', to: '/newsstand' },
      { key: 'tv', label: 'TOP 100 TV', to: '/top100-tv' },
    ] },
  { id: 'scout', name: 'Scout', role: 'Career Navigator', room: 'career-center', col: 20, row: 20, sprite: IMG + '5f95787fd_generated_image.png',
    signature: 'Your next mission might change everything.',
    greeting: 'Positions, mandates and the people hiring for them. Where to?',
    actions: [
      { key: 'classifieds', label: 'Browse classifieds', to: '/classifieds' },
      { key: 'copilot', label: 'Career Copilot', to: '/career-copilot' },
      { key: 'resources', label: 'Career resources', to: '/chamber' },
    ] },
  { id: 'skye', name: 'Skye', role: 'Community Ambassador', room: 'networking-lounge', col: 20, row: 22, sprite: IMG + '25ab44dfe_generated_image.png',
    signature: 'The right connection can launch a thousand possibilities.',
    greeting: 'Welcome to the lounge. Your community is a few steps away.',
    actions: [
      { key: 'people', label: 'My people', to: '/aerosync/people' },
      { key: 'meetups', label: 'Meetups', to: '/meetups' },
      { key: 'chat', label: 'Chat with the room', panel: 'chat' },
    ] },
];

export const castInRoom = (room) => COLONY_CAST.filter(c => c.room === room);

// Merge an admin config record over a character: greeting, visibility and hidden actions.
export const applyConfig = (c, cfg) => cfg ? {
  ...c,
  allActions: c.actions,
  greeting: cfg.greeting || c.greeting,
  visibility: cfg.visibility_state || 'active',
  actions: c.actions.filter(a => !(cfg.hidden_actions || []).includes(a.key)),
} : { ...c, allActions: c.actions, visibility: 'active' };
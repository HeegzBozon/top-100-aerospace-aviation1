// The Directory's five questions, and the curated choices a member answers "Why" with.
export const DIRECTORY_TABS = [
  { key: 'who', q: 'Who', label: 'People' },
  { key: 'what', q: 'What', label: 'The Platform' },
  { key: 'when', q: 'When', label: 'The Cycle' },
  { key: 'where', q: 'Where', label: 'Campus' },
  { key: 'why', q: 'Why', label: 'Your Mission' },
];

export const STAGES = [
  { key: 'student', label: 'Student' },
  { key: 'professional', label: 'Professional' },
  { key: 'retiree', label: 'Retired / Emeritus' },
  { key: 'founder', label: 'Founder' },
  { key: 'executive', label: 'CEO / Executive' },
  { key: 'team', label: 'Team lead' },
  { key: 'enterprise', label: 'Enterprise' },
];

export const GOALS = [
  { key: 'recognize', label: 'Recognize people who deserve it' },
  { key: 'connect', label: 'Meet the right people' },
  { key: 'career', label: 'Find my next role' },
  { key: 'deals', label: 'Open business conversations' },
  { key: 'learn', label: 'Learn from the field' },
  { key: 'events', label: 'Make the most of conferences' },
];

// What the platform is, one line each, and which goals each surface answers.
export const WHAT_ITEMS = [
  { key: 'nominate', label: 'Nominate', to: '/selection-committee?tab=nominate', line: 'Put a name forward for the season. Every nomination needs a written reason.', goals: ['recognize'] },
  { key: 'vote', label: 'Vote', to: '/selection-committee?tab=vote', line: 'Order your own hundred. Individuals rank; the institution measures.', goals: ['recognize'] },
  { key: 'colony', label: 'Campus', to: '/colony', line: 'Walk the live campus, step into rooms and talk with whoever is there.', goals: ['connect', 'learn'] },
  { key: 'media', label: 'Media Hub', to: '/media-hub', line: 'Editions, articles and dispatches from the community.', goals: ['learn'] },
  { key: 'events', label: 'Events', to: '/conferences', line: 'Every conference the network holds rooms in: plan, attend, follow up.', goals: ['events', 'connect'] },
  { key: 'classifieds', label: 'Classifieds', to: '/classifieds', line: 'Positions, mandates and open desks put up by Fellows.', goals: ['career', 'deals'] },
  { key: 'appstore', label: 'App Store', to: '/app-store', line: 'Small tools that each do one job from your own record.', goals: ['career', 'deals'] },
  { key: 'review', label: 'Review', to: '/review', line: 'Your record, the orientation and the archive of closed cycles.', goals: ['learn', 'recognize'] },
];
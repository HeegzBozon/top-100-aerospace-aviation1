// App Configuration - Constants and Lists
export const PUBLIC_PAGES = [
  'Home',
  'ProfileView',
  'NotFound',
  'TalentLanding',
  'GamesLanding',
  'About',
  'ServicesLanding',
  'MissionControl',
  'TalentExchangeLanding',
  'RaisingJupiter',
  'StartupDirectory',
  'MissionVisionValues',
  'HowWePick',
  'Top100OS',
  'Top100Women2025',
  'ArchiveLanding',
  'GetStarted',
  'LaunchParty',
  'Comms',
];

// Quick Access Items Configuration for Mobile Home
export const QUICK_ACCESS_CONFIG = {
  index: { icon: 'List', label: 'Index', sublabel: '', href: 'Top100Women2025' },
  threads: { icon: 'MessageSquare', label: 'Threads', sublabel: '0 new', href: null },
  later: { icon: 'Bookmark', label: 'Saved', sublabel: '0 items', href: 'MyFavorites' },
  settings: { icon: 'Settings', label: 'Settings', sublabel: '', href: null },
};

export const DEFAULT_QUICK_ACCESS_ORDER = ['index', 'threads', 'later', 'settings'];
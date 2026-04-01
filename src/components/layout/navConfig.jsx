import { brandColors } from "@/components/core/brandTheme";

export { brandColors };

export const CORE_NAV_ITEMS = [
    { icon: 'Home', label: "Home", pageName: "Home" },
    { icon: 'Award', label: "Noms", pageName: "Nominations" },
    { icon: 'CircuitBoard', label: "Index", pageName: "Top100Women2025" },
];

export const QUICK_ACTIONS = [
    { label: 'Nominate Someone', pageName: 'Nominations', icon: 'Send', color: brandColors.goldPrestige },
    { label: 'View TOP 100', pageName: 'Top100Women2025', icon: 'Trophy', color: brandColors.navyDeep },
    { label: 'Explore Arena', pageName: 'Arena', icon: 'Users', color: brandColors.skyBlue },
];

export const ALL_RESOURCES = [
    { label: 'Home', pageName: 'Landing', icon: 'Home' },
    { icon: 'Trophy', label: "Explore Index", pageName: "Top100Women2025" },
    { icon: 'Award', label: "Season 4", pageName: "Season4" },
    { label: 'Calendar', pageName: 'Calendar', icon: 'Calendar' },
    { label: 'Launch Party', pageName: 'LaunchParty', icon: 'Rocket' },
    { label: 'Arena', pageName: 'Arena', icon: 'Users' },
    { label: 'Get Started', pageName: 'GetStarted', icon: 'Compass' },
    { label: 'About', pageName: 'About', icon: 'BookOpen' },
    { label: 'Talent Exchange', pageName: 'TalentExchange', icon: 'Briefcase' },
    { label: 'Profile', pageName: 'Profile', icon: 'Users' },
    { label: 'Mission Control', pageName: 'MissionControl', icon: 'LayoutDashboard' },
    { label: 'Sponsors', pageName: 'Sponsors', icon: 'Heart' },
    { label: 'Help', pageName: 'HelpCenter', icon: 'MessageSquare' },
];

export const DEFAULT_BOOKMARKS = [
    { label: 'Home', pageName: 'Landing', icon: 'Home', order: 0 },
    { label: 'Calendar', pageName: 'Calendar', icon: 'Calendar', order: 1 },
    { label: 'Mission Control', pageName: 'MissionControl', icon: 'LayoutDashboard', order: 2 },
];
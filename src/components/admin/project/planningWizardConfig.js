export const READINESS_BLOCKS = [
    { id: 'backlog', label: 'Backlog Readiness', desc: 'DoR audit on all candidate stories', icon: 'ClipboardList' },
    { id: 'capacity', label: 'Velocity & Capacity Pull', desc: 'Confirm team velocity and available capacity', icon: 'Gauge' },
    { id: 'business', label: 'Business Context Draft', desc: 'Draft the business context presentation', icon: 'FileText' },
    { id: 'objectives', label: 'Draft Season Objectives', desc: 'Draft OKRs for the season', icon: 'Target' },
    { id: 'architecture', label: 'Architecture & Tech Debt Review', desc: 'Review architecture and tech debt status', icon: 'Cpu' },
    { id: 'compliance', label: 'Compliance Pre-Flag', desc: 'Pre-flag gated compliance items', icon: 'ShieldCheck' },
    { id: 'risk', label: 'Risk Pre-ID', desc: 'Seed the ROAM risk list', icon: 'AlertTriangle' },
    { id: 'facilitation', label: 'Facilitation Lock', desc: 'Lock facilitation decks and schedule', icon: 'Lock' },
    { id: 'gogo', label: 'Go / No-Go Confirmation', desc: 'Final go/no-go decision to convene', icon: 'Rocket', isGate: true },
];

export const DAY_ONE_PHASES = [
    {
        id: 'intro',
        name: 'Introduction',
        activities: ['Business Context overview', 'Season Vision presentation', 'Architecture Vision overview', 'Planning Context review'],
        outputs: ['Shared strategic alignment'],
    },
    {
        id: 'breakout1',
        name: 'Team Breakouts — Round 1',
        activities: ['Draft sprint-by-sprint plans per team', 'Map cross-team dependencies'],
        outputs: ['4-sprint story-level draft plan', 'Committed vs. stretch split', 'Dependency list', 'One open risk per sprint'],
    },
    {
        id: 'review',
        name: 'Management Review',
        activities: ['Arbitrate scope conflicts', 'Resolve capacity overloads', 'Address gated compliance items'],
        outputs: ['Overnight resolutions'],
    },
];

export const DAY_TWO_PHASES = [
    {
        id: 'finalization',
        name: 'Finalization',
        activities: ['Review overnight resolutions', 'Team Breakouts Round 2 — adjust plans', 'Final plan review'],
        outputs: ['Locked 4-sprint plans'],
    },
    {
        id: 'commit',
        name: 'Risk & Commit',
        activities: ['ROAM risk pass', 'Fist-of-five confidence vote', 'Planning retrospective'],
        outputs: ['Jira-logged risks', 'Finalized commitment'],
    },
];

export const ROAM_CATEGORIES = [
    { id: 'resolve', label: 'Resolve', desc: 'Eliminate the risk entirely', accent: '#7ec8a8' },
    { id: 'own', label: 'Own', desc: 'Accept & manage with a named owner', accent: '#4a90b8' },
    { id: 'accept', label: 'Accept', desc: 'Accept the consequence', accent: '#c9a87c' },
    { id: 'mitigate', label: 'Mitigate', desc: 'Reduce probability or impact', accent: '#c87e9d' },
];

export const OPERATING_PRINCIPLES = [
    'Governance firewall is non-negotiable, everywhere',
    'Institutional trust is earned through consistency',
    'Plain, descriptive naming over clever branding',
    'Every deliverable passes a gate before it ships',
];

export const WIZARD_STEPS = [
    { id: 'brief', label: 'Mission Brief', sub: 'Prep' },
    { id: 'day0', label: 'Day Zero', sub: 'Readiness Gate' },
    { id: 'day1', label: 'Day One', sub: 'Context & Draft' },
    { id: 'day2', label: 'Day Two', sub: 'Commit & Close' },
    { id: 'launch', label: 'Launch', sub: 'Liftoff' },
];
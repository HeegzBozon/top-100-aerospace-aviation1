import { Compass, FileText, Radar, Rocket, Users } from 'lucide-react';

// The App Store's catalog. One entry per micro-tool: what it is, the single job it does,
// and the artifact it hands back. Only a tool with status 'available' carries a way in —
// a listed tool that is still being built is described, never opened.
export const STORE_TOOLS = [
  {
    key: 'press-kit',
    name: 'The Press Kit',
    kicker: 'Professional Evidence Pack',
    job: 'Turns your own record into a press-ready page and a printable kit.',
    artifact: 'A shareable web page and a PDF, composed only from what you have submitted.',
    status: 'available',
    to: '/press-kit',
    icon: FileText,
  },
  {
    key: 'resume-signal',
    name: 'Resume Signal Check',
    kicker: 'Career evidence',
    job: 'Reads one section of your resume and marks where the evidence of scope and outcome is thin.',
    artifact: 'A prioritised checklist of what to strengthen, with the questions to answer.',
    status: 'building',
    icon: Radar,
  },
  {
    key: 'career-navigator',
    name: 'Career Stage Navigator',
    kicker: 'Career lifecycle',
    job: 'Takes your role, your experience and where you want to go, and names the next move worth making.',
    artifact: 'A one-page next-step brief: the move, the gap, and the first action.',
    status: 'building',
    icon: Compass,
  },
  {
    key: 'founder-readiness',
    name: 'Founder Readiness Brief',
    kicker: 'Business scale',
    job: 'Holds one venture against the essentials of aerospace commercialisation.',
    artifact: 'A readiness snapshot: strongest area, most consequential gap, next question.',
    status: 'building',
    icon: Rocket,
  },
  {
    key: 'team-capability',
    name: 'Team Capability Map',
    kicker: 'Team and enterprise',
    job: 'Turns a team’s stated roles and priorities into what is covered and what is not.',
    artifact: 'A one-page map of strengths, gaps, and a suggested next priority.',
    status: 'building',
    icon: Users,
  },
];

export const availableTools = () => STORE_TOOLS.filter((tool) => tool.status === 'available');
export const buildingTools = () => STORE_TOOLS.filter((tool) => tool.status !== 'available');
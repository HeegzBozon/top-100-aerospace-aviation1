import {
  LayoutGrid, Radar, Scissors, Send, Network, GraduationCap, Briefcase, Layers,
  Compass, Hammer, Crown, Building2, Users,
  Wrench, Plane, Palette, FlaskConical, TrendingUp,
} from 'lucide-react';

// Two parallel lenses — you flip between a Lifecycle view and a Role/Org view.
// Each lens's sub-tabs are its stages. Selecting a stage surfaces the boards
// most relevant to that stage as a curated landing (LensLanding).
export const LENSES = [
  { key: 'lifecycle', label: 'Lifecycle', short: 'Lifecycle' },
  { key: 'org', label: 'Function', short: 'Function' },
];

// Aspiration arc — stage-naming by intent, not tenure.
export const STAGES = {
  lifecycle: [
    { key: 'aspiring', label: 'Aspiring', blurb: 'Entering the field', icon: Compass, boards: ['fellow', 'career', 'jobs', 'networks'] },
    { key: 'builder', label: 'Builder', blurb: 'Established, deepening craft', icon: Hammer, boards: ['fellow', 'jobs', 'career', 'conference', 'intros', 'networks'] },
    { key: 'leader', label: 'Leader', blurb: 'Leading teams and missions', icon: Crown, boards: ['fellow', 'conference', 'ribbon', 'intros', 'networks'] },
    { key: 'steward', label: 'Steward', blurb: 'Legacy and institutional voice', icon: Building2, boards: ['fellow', 'ribbon', 'intros', 'networks', 'platform'] },
  ],
  org: [
    { key: 'design', label: 'Design & Create', blurb: 'Systems, industrial design, spacesuit & fashion, cabin interiors, human factors', icon: Palette, boards: ['fellow', 'career', 'networks', 'conference'] },
    { key: 'build', label: 'Build & Maintain', blurb: 'Manufacturing, A&P mechanics, MRO, technicians, quality, ground ops', icon: Wrench, boards: ['fellow', 'jobs', 'career', 'networks', 'conference'] },
    { key: 'fly', label: 'Fly & Serve', blurb: 'Pilots, cabin crew, flight attendants, dispatch, ATC, mission ops, flight medicine', icon: Plane, boards: ['fellow', 'career', 'networks', 'conference'] },
    { key: 'research', label: 'Research & Teach', blurb: 'Scientists, faculty, labs, academia', icon: FlaskConical, boards: ['fellow', 'networks', 'conference', 'career'] },
    { key: 'lead', label: 'Lead & Capital', blurb: 'Executives, founders, investors, policy, strategy, BD, legal', icon: TrendingUp, boards: ['fellow', 'ribbon', 'intros', 'networks', 'conference', 'platform'] },
  ],
};

export const BOARDS = {
  fellow: { label: 'Bulletin', icon: LayoutGrid, desc: 'Community dispatches and field notes' },
  conference: { label: 'Mission Rooms', icon: Radar, desc: 'Conference coordination and verified attendance' },
  ribbon: { label: 'Ribbon Cuttings', icon: Scissors, desc: 'Company milestones and demo days' },
  intros: { label: 'Introductions', icon: Send, desc: 'Member availability for introductions' },
  networks: { label: 'Domain Networks', icon: Network, desc: 'Standing communities of practice' },
  career: { label: 'Career Center', icon: GraduationCap, desc: 'Curated credential and practice library' },
  jobs: { label: 'Job Board', icon: Briefcase, desc: 'Member-posted roles' },
  platform: { label: 'Backlog', icon: Layers, desc: 'Platform development board' },
};

export const stagesFor = (lens) => STAGES[lens] || STAGES.lifecycle;
export const stageMeta = (lens, key) => {
  const list = STAGES[lens] || STAGES.lifecycle;
  return list.find((s) => s.key === key) || list[0];
};
export const boardMeta = (key) => BOARDS[key] || BOARDS.fellow;
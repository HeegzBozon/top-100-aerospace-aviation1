// Chamber 2.0 mode taxonomy — the four pillars of the modern aerospace chamber.
// Each mode groups events by the role they play: connect (Participate), advocate (Explore),
// enable (Accelerate), and advise (Consult).

export const MODES = [
  {
    key: 'Explore',
    tag: 'Media · Signals · Advocacy',
    blurb: 'Read the room. Industry intelligence, policy briefings, and the measurement publication.',
    rituals: ['Advocacy Briefing', 'Awards Gala', 'Policy Mixer'],
    expTypes: ['Awards', 'Mission Theatre', 'Training'],
    accent: '#4a90b8',
  },
  {
    key: 'Participate',
    tag: 'Chamber · Social · Networking',
    blurb: 'Show up. Ribbon cuttings, mixers, and the rituals that hold a community together.',
    rituals: ['Networking Mixer', 'Ribbon Cutting', 'Celebration'],
    expTypes: ['Social', 'Celebration', 'Meetup'],
    accent: '#c9a87c',
  },
  {
    key: 'Accelerate',
    tag: 'Incubator · Accelerator · Milestones',
    blurb: 'Build momentum. Office hours, build sprints, and the runway to Demo Day.',
    rituals: ['Incubator Milestone', 'Demo Day', 'Mentor Office Hours'],
    expTypes: ['Office Hours', 'Live Build', 'Build Challenge', 'Training'],
    accent: '#7fb069',
  },
  {
    key: 'Consult',
    tag: 'Agency · Advisory · Workshops',
    blurb: 'Get unstuck. Workshops, AMAs, and expert engagements that move the work forward.',
    rituals: ['Workshop', 'AMA', 'Build Challenge'],
    expTypes: ['Workshop', 'AMA'],
    accent: '#d8b98d',
  },
];

export const MODE_KEYS = MODES.map((m) => m.key);

// Map a ritual back to a legacy experience_type for backward-compat filtering
// (events created before chamber_ritual existed).
export const RITUAL_TO_EXP = {
  'Advocacy Briefing': 'Mission Theatre',
  'Awards Gala': 'Awards',
  'Policy Mixer': 'Meetup',
  'Networking Mixer': 'Social',
  'Ribbon Cutting': 'Celebration',
  Celebration: 'Celebration',
  'Incubator Milestone': 'Live Build',
  'Demo Day': 'Live Build',
  'Mentor Office Hours': 'Office Hours',
  Workshop: 'Workshop',
  AMA: 'AMA',
  'Build Challenge': 'Build Challenge',
};

export function modeOf(modeKey) {
  return MODES.find((m) => m.key === modeKey) || MODES[0];
}

export function eventMatchesMode(e, modeKey) {
  const m = modeOf(modeKey);
  if (e.chamber_ritual && m.rituals.includes(e.chamber_ritual)) return true;
  if (m.expTypes.includes(e.experience_type)) return true;
  return false;
}

export function eventMatchesRitual(e, ritual) {
  if (!ritual || ritual === 'All') return true;
  if (e.chamber_ritual === ritual) return true;
  return RITUAL_TO_EXP[ritual] === e.experience_type;
}
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Member-company milestone rituals — the convenings the Chamber hosts to
// celebrate a Fellow's company crossing a threshold (launch, demo day, build
// milestone). Reuses the Event entity's chamber_ritual taxonomy; no new entity.
export const MILESTONE_RITUALS = ['Ribbon Cutting', 'Demo Day', 'Incubator Milestone'];

export const MILESTONE_TYPES = {
  'Ribbon Cutting': { label: 'Grand Opening', accent: B.gold, exp: 'Celebration' },
  'Demo Day': { label: 'Demo Day', accent: '#b06a45', exp: 'Live Build' },
  'Incubator Milestone': { label: 'Milestone', accent: '#7a8fa6', exp: 'Live Build' },
};

export const ritualOf = (event) => {
  if (event?.chamber_ritual && MILESTONE_RITUALS.includes(event.chamber_ritual)) return event.chamber_ritual;
  if (event?.experience_type === 'Celebration') return 'Ribbon Cutting';
  if (event?.experience_type === 'Live Build') return 'Demo Day';
  return 'Ribbon Cutting';
};

export const milestoneMeta = (event) =>
  MILESTONE_TYPES[ritualOf(event)] || MILESTONE_TYPES['Ribbon Cutting'];

export const isMilestone = (event) => {
  if (event?.chamber_ritual && MILESTONE_RITUALS.includes(event.chamber_ritual)) return true;
  return event?.experience_type === 'Celebration' || event?.experience_type === 'Live Build';
};
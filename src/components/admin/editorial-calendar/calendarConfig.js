// THE EDITORIAL CALENDAR — the vocabulary the desk is read in.
//
// The issue types, the lengths the style guide sets for each, the words a stage is printed
// in, and the three desks an issue is handed to. Nothing here decides anything: the guide
// is the authority on lengths, and these are its numbers transcribed once so a row can
// show its target without loading the whole standard.

export const ISSUE_TYPES = [
  { key: 'Standard', words: '600 to 1,000', note: 'Full structure' },
  { key: 'Voting', words: '300 to 500', note: 'Lead with one action' },
  { key: 'Community', words: '300 to 500', note: 'Lead with one action' },
  { key: 'Show', words: '600 to 800', note: 'What to watch, who to meet' },
  { key: 'Live', words: '500 to 700', note: 'Dispatch style, 20% live' },
  { key: 'Debrief', words: '800 to 1,100', note: 'What changed, attributed' },
  { key: 'Quarterly', words: '1,500 to 2,500', note: 'Longer Briefing plus index data' },
  { key: 'Annual', words: 'Longest', note: 'Volume reveal, written for the archive' },
  { key: 'Special', words: 'Set per issue', note: 'No standing length' },
];

const TYPE_MAP = ISSUE_TYPES.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

export function typeMeta(type) {
  return TYPE_MAP[type] || { key: type || 'Standard', words: '—', note: 'Unclassified' };
}

// The longer treatment is the Quarterlies and the Annual. Everything else is the biweekly
// quick format. This is the guide's own split, not a preference.
export function formatOf(type) {
  return type === 'Quarterly' || type === 'Annual' ? 'magazine' : 'quick';
}

export const STAGES = [
  { key: 'planned', label: 'Planned', tone: '#8a9aab' },
  { key: 'drafting', label: 'Drafting', tone: '#85c1e9' },
  { key: 'review', label: 'In review', tone: '#c9a87c' },
  { key: 'ready', label: 'Ready', tone: '#b9a4d0' },
  { key: 'published', label: 'Published', tone: '#7ec89a' },
  { key: 'held', label: 'Held', tone: '#e08a8a' },
];

const STAGE_MAP = STAGES.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});

export function stageMeta(stage) {
  return STAGE_MAP[stage] || STAGE_MAP.planned;
}

// What each desk calls its own state. The desk owns the words; the calendar only reads them.
const DESK_STATUS = {
  magazine: {
    '': 'Not staged',
    draft: 'Assembling',
    preview: 'Preview out',
    published: 'Published',
    archived: 'Archived',
  },
  mail: {
    '': 'Not staged',
    draft: 'Draft',
    sending: 'Sending',
    sent: 'Sent',
    halted: 'Halted',
  },
  campaign: {
    '': 'Not staged',
    planned: 'Planned',
    drafting: 'Drafting',
    scheduled: 'Scheduled',
    live: 'Live',
    reported: 'Reported',
    closed: 'Closed',
  },
};

export function deskStatusLabel(desk, status) {
  return DESK_STATUS[desk]?.[status || ''] || status || 'Not staged';
}

export const CHANNELS = ['newsletter', 'linkedin', 'instagram', 'site', 'event', 'direct'];

// The three desks an issue is handed to, and what each one owns. The calendar plans and
// reports; it never holds the substance of a desk's work.
export const DESKS = [
  {
    key: 'magazine',
    label: 'Magazine Studio',
    owns: 'Sections, pages and the finished issue',
    where: '/magazine-studio',
  },
  {
    key: 'mail',
    label: 'Mail Room',
    owns: 'The briefing letter, its audience and its send',
    where: '/Admin?tab=mail-room',
  },
  {
    key: 'campaign',
    label: 'Funnel Desk',
    owns: 'The reader action, the channel and the measure',
    where: '/Admin?tab=dispatch',
  },
];
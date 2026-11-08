// THE SPONSOR LOUNGE — THE INTERVIEW.
//
// The room does not pitch at a reader; it asks four questions and then says where the
// reader actually is, which rung of the card fits, and what the one next move is. Every
// path ends in the same place — a paid slot — but a reader who is not there yet is told so
// instead of being sold to.
//
// Nothing is invented: a tier's price and dates are read from the published calendar in
// patronConfig, so the card the room quotes is the card the media kit prints.

import { SLOT_CALENDAR, TIER_LABELS, day, money } from '@/components/patronage/patronConfig';

// The four rungs that carry a published rate.
const RATE = { founding: 1200, standard: 1500, flagship: 5000, annual: 3500 };

export const QUESTIONS = [
  {
    key: 'motive',
    ask: 'What is the job you need doing?',
    why: 'A sponsor buying reach and a sponsor supporting the record are sold differently.',
    options: [
      { value: 'name', label: 'Put our name in front of the industry' },
      { value: 'hire', label: 'Reach the people who hire' },
      { value: 'support', label: 'Support the record itself' },
      { value: 'else', label: 'Something else' },
    ],
  },
  {
    key: 'timing',
    ask: 'When do you need to be seen?',
    why: 'The calendar decides the price before anything else does.',
    options: [
      { value: 'next', label: 'The next issue that closes' },
      { value: 'reveal', label: 'The December 31 reveal' },
      { value: 'y2027', label: 'Somewhere in 2027' },
      { value: 'unsure', label: 'I do not know yet' },
    ],
  },
  {
    key: 'budget',
    ask: 'What can you put behind it this cycle?',
    why: 'So the room never quotes a number above what you hold.',
    options: [
      { value: 'under2k', label: 'Under $2,000' },
      { value: '2to4k', label: '$2,000 to $4,000' },
      { value: '5kplus', label: 'Over $5,000' },
      { value: 'notmycall', label: 'It is not my call' },
    ],
  },
  {
    key: 'authority',
    ask: 'If the number works, who signs it?',
    why: 'It decides whether you leave with a checkout or with a proposal.',
    options: [
      { value: 'me', label: 'I do' },
      { value: 'committee', label: 'A committee, or my board' },
      { value: 'finance', label: 'Finance, on my recommendation' },
    ],
  },
];

// Where a reader stands on the line the room is walking them down.
export const POSITIONS = [
  { key: 'early', label: 'Learning', line: 'No date and no number yet.' },
  { key: 'approval', label: 'Making the case', line: 'The decision sits above you.' },
  { key: 'ready', label: 'Ready to commit', line: 'A date your budget can hold.' },
];

// A slot is only quoted while it is open and its close has not passed.
const live = (slot) =>
  Boolean(slot) &&
  slot.status === 'open' &&
  (!slot.ad_close_date || new Date(`${slot.ad_close_date}T23:59:59`) >= new Date());

export const slotOf = (tier) => SLOT_CALENDAR.find((slot) => slot.tier === tier && live(slot)) || null;

const CEILING = { under2k: 1200, '2to4k': 4000, '5kplus': Infinity, notmycall: 4000 };

// The rung the answers point at, and whether the stated budget can carry it.
export function recommend(answers) {
  const timing = answers.timing?.value;
  const budget = answers.budget?.value;

  let tier = 'standard';
  if (timing === 'reveal') tier = 'flagship';
  else if (timing === 'y2027') tier = 'annual';
  else if (timing === 'next') tier = budget === 'under2k' ? 'founding' : budget === '5kplus' ? 'flagship' : 'standard';
  else tier = budget === '5kplus' ? 'flagship' : 'standard';

  // Founding is entry inventory: when it has closed, the entry rung is the standard rate.
  if (tier === 'founding' && !slotOf('founding')) tier = 'standard';

  const slot = slotOf(tier);
  const rate = slot?.rate_amount || RATE[tier] || null;
  const ceiling = CEILING[budget] ?? 0;
  return {
    tier,
    slot,
    rate,
    label: TIER_LABELS[tier] || tier,
    affordable: Boolean(rate) && rate <= ceiling,
  };
}

export function positionOf(answers, rec) {
  if (answers.budget?.value === 'notmycall') return 'approval';
  if (answers.authority && answers.authority.value !== 'me') return 'approval';
  if (answers.timing?.value === 'unsure') return 'early';
  if (!rec.affordable) return 'early';
  return 'ready';
}

// The reason, in one line, so the reader can disagree with it.
export function explain(answers, rec) {
  if (!rec.affordable) {
    return `The ${rec.label.toLowerCase()} is ${money(rec.rate)} — more than this cycle holds. The smallest thing we sell is the founding rate at ${money(1200)}, and I would rather say that than quote you something you cannot sign.`;
  }
  if (answers.timing?.value === 'unsure') {
    return `Nothing is decided yet, so nothing should be quoted. The next issue to close is the cheapest honest test of whether the record reaches your buyer.`;
  }
  const when = rec.slot?.issue_date ? ` on ${day(rec.slot.issue_date)}` : '';
  return `The ${rec.label.toLowerCase()} at ${money(rec.rate)} sits inside what you have, and it runs${when}.`;
}

export { RATE };
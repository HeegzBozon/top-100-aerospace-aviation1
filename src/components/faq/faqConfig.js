import { COURSE } from '@/components/mission/courseConfig';

// The hub, as copy.
//
// Three sections, in the order a reader needs them: the FAQ answers what a newcomer
// asks first, the knowledge base is the institution written down (the course, chapter
// by chapter), and support is where anything that needs a person goes. Every row is a
// line the wheel can land on and # can open, so nothing here needs a mouse.
export const HUB_SECTIONS = [
  {
    key: 'faq',
    index: '1',
    label: 'FAQ',
    lede: 'What people ask before they trust the record. Short answers, in plain language.',
  },
  {
    key: 'kb',
    index: '2',
    label: 'Knowledge base',
    lede: 'The institution, written out: who we are, what we measure, how a cycle turns, where it is going.',
  },
  {
    key: 'support',
    index: '3',
    label: 'Support',
    lede: 'Where to take a correction, a claim, a fault, or a question that needs the desk.',
  },
];

// The FAQ. Each answer stands on its own; the ones that need more point at the chapter
// of the knowledge base that carries the long version.
export const FAQ_ROWS = [
  {
    key: 'what',
    label: 'What is this platform?',
    body: [
      'A measurement platform for women in aerospace and aviation. It keeps a verified reputation graph: every claim attached to evidence, every position attached to a written reason, and every cycle readable years later exactly as it was measured at the time.',
      'It is not a list that remembers who was loudest. The archive keeps the careers; the instrument measures them.',
    ],
  },
  {
    key: 'measured',
    label: 'How is someone measured?',
    body: [
      'Seasonally, in layers: perception, objective achievement, SME evaluation, narrative, normalization, and ecosystem. They resolve into one influence band for the season.',
      'Bands are public. The weights behind them are not, and are never traded or published. Individuals rank; the institution measures.',
    ],
  },
  {
    key: 'enters',
    label: 'Who decides who enters the record?',
    body: [
      'A nomination puts a name forward — from a peer, a colleague, or an institution. Every nomination is read before anyone enters the pool, so the pool is edited, not accumulated.',
      'A nomination is not an award, and entering the pool is not a position on a list.',
    ],
  },
  {
    key: 'eight',
    label: 'What is The Eight?',
    body: [
      'A Fellow’s ordered public list of eight people, each with a written reason. Positions are ordinal: position one reads as position one.',
      'Empty slots always render as visible outlines. Promoting someone into an occupied slot moves the displaced entry to the tail; it never deletes them. Submission is blocked without a reason.',
    ],
  },
  {
    key: 'bought',
    label: 'Can a position be bought?',
    body: [
      'No. Discovery, the directory and measurement never read a transaction, payment, availability or sponsorship field — not for sorting, not for filtering, not for featured placement.',
      'Featured placement is editorial only. Nothing purchasable moves a position.',
    ],
  },
  {
    key: 'claim',
    label: 'How do I claim my profile?',
    body: [
      'Instantly, on an email match or a LinkedIn profile match. A claim that does not match, or that someone contests, goes to the desk for review before it is granted.',
      'Once claimed, the record is yours to keep current: identity, credential, career history, documents, and the modules you choose to show.',
    ],
  },
  {
    key: 'verification',
    label: 'What does verification actually mean here?',
    body: [
      'Checkpoints, not a badge: LinkedIn verified, employer verified, SME reviewed, metrics validated, ecosystem validated.',
      'Verification locks to position two on the profile and can never be reordered around. It is never altered by personalization.',
    ],
  },
  {
    key: 'marketplace',
    label: 'Is this a marketplace?',
    body: [
      'No. Availability is an expert network: what a Fellow makes themselves available for, as introductions only, at zero take rate.',
      'Availability never touches directory position, measurement, or influence band.',
    ],
  },
  {
    key: 'cycle',
    label: 'When does a cycle run?',
    body: [
      'One season is live at a time: nominations open, voting, review, finalize, publication. The calendar is public from the day it opens — the dates, phases and counts read the same for everyone.',
      'The dashboard counts down to close and to the day the results go live.',
    ],
  },
  {
    key: 'closes',
    label: 'What happens when a season closes?',
    body: [
      'It becomes an archive, and the archive is immutable. A correction is recorded beside the record, never written over it.',
      'That is what makes the past usable: open a season years later and find the same numbers, reasons and verification the field saw then.',
    ],
  },
  {
    key: 'patrons',
    label: 'Who are the Patrons of Record?',
    body: [
      'The bodies that make rooms, editions and convenings possible. They are attributed as Patron of Record — never as sponsorship, and never as a position.',
      'Patronage confers zero selection weight and is never read by discovery or scoring.',
    ],
  },
  {
    key: 'arranged',
    label: 'How is my profile arranged?',
    body: [
      'Identity header first, verification second — both locked. Everything after them is yours to order, and your place in the deck, the accent and the cover are curated choices rather than blank fields.',
      'Expression renders in accent and ordering. It never alters structure, and it never obscures verification.',
    ],
  },
  {
    key: 'publication',
    label: 'Who writes the publication?',
    body: [
      'The desk: writers, photographers and curators who compose each issue. Editorial work is credited, not scored.',
      'Fellows compose their own editions from their record and post to the bulletin board. The desk’s publication carries the season’s official account.',
    ],
  },
  {
    key: 'progress',
    label: 'Why did my reading progress not save?',
    body: [
      'It saves to your record, one entry per article opened, so it follows you between the handheld and the desk — as long as you are signed in. A visitor reads the same pages and keeps nothing.',
      'It now writes as you read and again when you leave the page, so a quick read is banked rather than lost.',
    ],
  },
];

// Support. A row either answers in place or opens somewhere that can act.
export const SUPPORT_ROWS = [
  {
    key: 'wrong-detail',
    label: 'A detail on my record is wrong',
    body: [
      'Correct it at the source: open your record and edit the field. Verification checkpoints re-resolve against what you change, so a corrected employer or credential can move a checkpoint back to pending.',
    ],
    cta: { label: 'Open my record', to: '/record' },
  },
  {
    key: 'claim-help',
    label: 'A profile is misattributed to me',
    body: [
      'Claim it from the profile itself. A matching email or LinkedIn address grants it instantly; anything contested goes to the desk, and nothing about it is public until it is resolved.',
    ],
    cta: { label: 'How claims work', to: '/HowWePick' },
  },
  {
    key: 'measurement',
    label: 'I want to query a measurement',
    body: [
      'Bands are visible, weights are not — so a query is about the evidence behind a band, not the arithmetic under it. Send the name, the season, and what you believe the record gets wrong.',
    ],
    cta: { label: 'Write to the desk', to: '/Feedback' },
  },
  {
    key: 'fault',
    label: 'Report a fault or suggest a change',
    body: [
      'Faults and suggestions both go to the platform board, where they are read and answered in the open rather than in a mailbox.',
    ],
    cta: { label: 'Open the board', to: '/Feedback' },
  },
  {
    key: 'console',
    label: 'How do I drive this console?',
    body: [
      'On the handheld: turn the ring to walk, # to open, the back key to leave a section. On the radio face: up and down walk the list, 1–9 press the printed number, hold the wheel to jump to the top or the bottom.',
      'On a desk, the same list answers to the arrow keys and Enter.',
    ],
  },
  {
    key: 'governance',
    label: 'Read the rules the platform is held to',
    body: [
      'The governance page states the invariants in full: what may never be read by measurement, what an archive may never do, and what a sponsor is never allowed to buy.',
    ],
    cta: { label: 'Read the governance', to: '/HowWePick' },
  },
  {
    key: 'privacy',
    label: 'Data and privacy',
    body: [
      'What the platform holds, why, and how to have it exported or removed. Terms of service sit beside it.',
    ],
    cta: { label: 'Privacy policy', to: '/PrivacyPolicy' },
  },
];

// The knowledge base is the course, one row per module, in the order it is read. Two
// modules point at the surfaces that hold their living version rather than restating it.
const MODULE_CTAS = {
  record: { label: 'Open the archive', to: '/archive/6a6b70136ccb7c358f77dd7f' },
  present: { label: 'Open the board', to: '/board' },
};

export const KB_ROWS = COURSE.flatMap((chapter) =>
  chapter.modules.map((module) => ({
    key: module.key,
    label: module.title,
    kicker: `${module.index} · ${module.kicker} · ${chapter.label}`,
    chapterKey: chapter.key,
    module,
    cta: MODULE_CTAS[module.key] || null,
  })),
);

export const KB_TOTAL = KB_ROWS.length;

// The chapters, for the rail — each with the rows it holds, so a jump lands on the
// first module of the chapter rather than at the top of the page.
export const KB_CHAPTERS = COURSE.map((chapter) => ({
  key: chapter.key,
  index: chapter.index,
  label: chapter.label,
  modules: chapter.modules,
}));

export const rowsFor = (sectionKey) => {
  if (sectionKey === 'kb') return KB_ROWS;
  if (sectionKey === 'support') return SUPPORT_ROWS;
  return FAQ_ROWS;
};
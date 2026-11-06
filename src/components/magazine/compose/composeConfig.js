import { VOLUME_IV_BLUEPRINT } from '@/components/magazine/magazineConfig';

// The sequence Compose mode walks.
//
// Every prompt is one decision about the issue, taken one at a time: the intention,
// the name, what runs through it, the letter that opens it, the line that closes it.
// The shape of each prompt is declared here — kind, question, what it writes, and how
// to ask the editor for a draft — so the console, the keys and the AI all read the
// same description and can never disagree about what a step is.

export const DIRECTIONS = [
  {
    key: 'measurement',
    label: 'The measurement',
    line: 'The yearly measurement, told through the people who hold the line.',
  },
  {
    key: 'season',
    label: 'One season',
    line: 'A single season read closely: what changed, and who made it change.',
  },
  {
    key: 'long-view',
    label: 'The long view',
    line: 'Careers that outlast a programme, and the institutions that keep them.',
  },
  {
    key: 'work',
    label: 'The work',
    line: 'The work behind the record: the rooms, the hands, the hours.',
  },
];

export const COMPOSE_STEPS = [
  {
    key: 'direction',
    kind: 'choice',
    eyebrow: 'The direction',
    question: 'What is this issue for?',
    help: 'One line of intent. Every draft that follows is written to it.',
    write: 'opening_config.tone',
    placeholder: 'Or write the intention in your own words',
    ask: 'three statements of editorial intent, each under twenty words',
    count: 3,
  },
  {
    key: 'title',
    kind: 'line',
    eyebrow: 'The name',
    question: 'What is the issue called?',
    help: 'The name on the cover, set in the house face.',
    field: 'title',
    placeholder: 'TOP 100 Aerospace & Aviation — Volume V',
    ask: 'three cover titles, each under sixty characters, in the house form (imprint, volume)',
    count: 3,
  },
  {
    key: 'subtitle',
    kind: 'line',
    eyebrow: 'The line under it',
    question: 'What sits beneath the name?',
    help: 'The edition, stated plainly. It is read at a glance on a shelf.',
    field: 'subtitle',
    placeholder: 'The 2027 Edition',
    ask: 'three edition lines, each under forty characters',
    count: 3,
  },
  {
    key: 'cover_kicker',
    kind: 'line',
    eyebrow: 'The cover kicker',
    question: 'What does the cover promise?',
    help: 'A short line set above the name. It earns the cover without giving away the story.',
    field: 'cover_kicker',
    placeholder: 'Volume V · The 2027 Edition',
    ask: 'three cover kickers, each under forty characters',
    count: 3,
  },
  {
    key: 'sections',
    kind: 'plan',
    eyebrow: 'The blueprint',
    question: 'What runs through it?',
    help: 'Front of book, the well, the back of the book. The well is the heart of the issue.',
  },
  {
    key: 'preface',
    kind: 'paragraph',
    eyebrow: 'The letter',
    question: 'What does the editor say first?',
    help: 'The opening letter. Written to one reader, not to a market.',
    field: 'preface',
    placeholder: 'A word from the editor…',
    ask: 'a draft editor\u2019s letter of about 150 words, first person, addressed to the reader',
    count: 2,
  },
  {
    key: 'colophon',
    kind: 'paragraph',
    eyebrow: 'Ad Astra',
    question: 'How does the issue close?',
    help: 'The closing institutional line. It states what the publication is, and stops.',
    field: 'colophon',
    placeholder: 'Closing institutional matter…',
    ask: 'a closing institutional note of about 60 words, in the third person',
    count: 2,
  },
  {
    key: 'review',
    kind: 'review',
    eyebrow: 'The lap',
    question: 'Read it back.',
    help: 'The issue as it now stands. Any line can be taken again.',
  },
];

export const REVIEW_INDEX = COMPOSE_STEPS.findIndex((step) => step.kind === 'review');

export const stepValue = (values, step) =>
  step.write === 'opening_config.tone' ? values.direction || '' : values[step.key] || '';

// What a step writes to the issue. A plan is written whole and renumbered; a line is
// written as it stands; the intention lives where the issue already keeps its tone.
export function stepPatch(issue, step, values) {
  if (step.kind === 'plan') {
    return {
      sections: (values.sections || []).map((section, i) => ({
        id: section.id || `sec-${Date.now()}-${i}`,
        name: section.name,
        section_type: section.section_type,
        section_group: section.section_group,
        order: i,
      })),
    };
  }
  if (step.write === 'opening_config.tone') {
    return {
      opening_config: { ...(issue.opening_config || {}), tone: (values.direction || '').trim() },
    };
  }
  if (step.field) return { [step.field]: (values[step.key] || '').trim() };
  return null;
}

export const isStepDone = (values, step) => {
  if (step.kind === 'plan') return (values.sections || []).length > 0;
  if (step.kind === 'review') return true;
  return String(stepValue(values, step)).trim().length > 0;
};

export const HOUSE_BLUEPRINT = () =>
  VOLUME_IV_BLUEPRINT.sections.map((section, i) => ({ ...section, order: i }));
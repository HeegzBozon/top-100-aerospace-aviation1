// The rubric an issue is read against.
//
// A professional editor reads a book against a short list of things that decide whether
// it can print: whether it needed to exist, whether its shape holds, whether the copy is
// reported rather than asserted, whether it sounds like the house, whether the cover
// earns itself, and whether it is finished. Those six are written here once, with the
// weight each carries, so the panel, the model and the arithmetic can never disagree
// about what is being measured.

export const RUBRIC = [
  {
    key: 'mandate',
    label: 'Editorial mandate',
    weight: 22,
    question: 'Does the issue have a reason to exist now, and does the cover promise it?',
    test: 'The stated intention, the name and the cover kicker agree, and the issue is about something that has happened, not a theme in the abstract.',
  },
  {
    key: 'architecture',
    label: 'Architecture and pacing',
    weight: 16,
    question: 'Does the issue hold its shape from the front of the book to the back?',
    test: 'Front of book opens, the well carries the largest share, the back closes. Sections run in print order, are named in the house voice, and never repeat one another.',
  },
  {
    key: 'specificity',
    label: 'Reporting and specificity',
    weight: 22,
    question: 'Is the copy reported, or merely asserted?',
    test: 'People are named, programmes and numbers are given, and claims carry a source. Nothing is written that could have been written about any other year.',
  },
  {
    key: 'voice',
    label: 'Voice and house style',
    weight: 20,
    question: 'Does it sound like the house, on the house standard in force?',
    test: 'Editorial, warm, aspirational, authority first. No banned vocabulary, no ranking as a verb, no em dashes, no exclamation marks, no address to a market.',
  },
  {
    key: 'display',
    label: 'Display craft',
    weight: 12,
    question: 'Do the name, the line under it and the kicker earn the cover?',
    test: 'Display copy is set in the house form and counts in Volumes, Issues and editions. No two display lines say the same thing.',
  },
  {
    key: 'completeness',
    label: 'Production readiness',
    weight: 8,
    question: 'Could this go to the printer today?',
    test: 'The letter and the closing note are written, every section is named and placed, and no line the reader will see is still blank.',
  },
];

export const TOTAL_WEIGHT = RUBRIC.reduce((sum, row) => sum + row.weight, 0);

// The bands the total falls into. A band is a reading, never a rank.
export const BANDS = [
  { min: 90, label: 'Ready for the press' },
  { min: 80, label: 'Ready after one pass' },
  { min: 70, label: 'A strong draft, not yet an issue' },
  { min: 55, label: 'Back to the desk' },
  { min: 0, label: 'Not yet an issue' },
];

export const bandFor = (score) => BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];

// The six tests, as instruction text for the model.
export const rubricToInstruction = () =>
  RUBRIC.map(
    (row, i) =>
      `${i + 1}. ${row.label} (key: ${row.key}, weight ${row.weight} of ${TOTAL_WEIGHT}) — ${row.question} ${row.test}`,
  ).join('\n');

// The total is arithmetic, not judgement: it is computed here from the six scores and
// their weights, so the same six marks always produce the same figure.
export const weightedTotal = (criteria) => {
  const byKey = new Map((criteria || []).map((row) => [row.key, Number(row.score)]));
  let sum = 0;
  let weight = 0;
  RUBRIC.forEach((row) => {
    const score = byKey.get(row.key);
    if (Number.isFinite(score)) {
      sum += Math.max(0, Math.min(100, score)) * row.weight;
      weight += row.weight;
    }
  });
  return weight ? Math.round(sum / weight) : 0;
};
// Governed spread registry. The Fellow composes and orders; the institution
// locks the cover to position 1 and the colophon to last. Same variants-not-
// freedom rule as covers, accents, and module order.

export const LOCKED_SPREADS = [
  { key: 'cover', label: 'Cover', lock: 'first' },
  { key: 'colophon', label: 'Colophon', lock: 'last' },
];

export const SPREADS = [
  { key: 'masthead', label: 'Masthead' },
  { key: 'editors_letter', label: "Editor's Letter" },
  { key: 'the_eight', label: 'The Eight' },
  { key: 'dispatches', label: 'Dispatches' },
  { key: 'flightography', label: 'Flightography' },
  { key: 'documents', label: 'Documents' },
];

export const DEFAULT_SPREAD_ORDER = [
  'cover', 'masthead', 'editors_letter', 'the_eight',
  'dispatches', 'flightography', 'documents', 'colophon',
];

export const ALL_SPREAD_KEYS = [
  ...LOCKED_SPREADS.map((s) => s.key),
  ...SPREADS.map((s) => s.key),
];

export const spreadLabel = (key) =>
  [...LOCKED_SPREADS, ...SPREADS].find((s) => s.key === key)?.label || key;

// Resolve the final page order. Cover always first, colophon always last,
// Fellow-configured middle in between. Hidden spreads are removed.
export const resolveSpreadOrder = (order, hidden = []) => {
  const base = (order && order.length ? order : DEFAULT_SPREAD_ORDER)
    .filter((k) => ALL_SPREAD_KEYS.includes(k))
    .filter((k) => !hidden.includes(k));
  const deduped = [...new Set(base)];
  const middle = deduped.filter((k) => k !== 'cover' && k !== 'colophon');
  const hasCover = deduped.includes('cover');
  const hasColophon = deduped.includes('colophon');
  return [
    ...(hasCover ? ['cover'] : []),
    ...middle,
    ...(hasColophon ? ['colophon'] : []),
  ];
};
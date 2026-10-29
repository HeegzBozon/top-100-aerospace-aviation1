// The three measures a nominee can be followed down, and how each one orders the field.
// One board, three readings: the same pool is never re-fetched for a second opinion.
export const STANDING_COLUMNS = [
  {
    key: 'borda',
    label: 'Borda',
    hint: 'Points from ranked lists',
    valueOf: (r) => r.borda_projected || 0,
  },
  {
    key: 'elo',
    label: 'Elo',
    hint: 'Strength from pairwise marks',
    valueOf: (r) => r.elo || 0,
  },
  {
    key: 'combined',
    label: 'Combined',
    hint: 'Ordering hint across the measures',
    valueOf: (r) => r.combined_index || 0,
  },
];

// A column orders by descent, ties broken by name — so a field where everyone is level
// still reads in a fixed order instead of shuffling between one reading and the next.
export function orderFor(rows, key) {
  const config = STANDING_COLUMNS.find((c) => c.key === key);
  const valueOf = config ? config.valueOf : () => 0;
  return [...rows].sort(
    (a, b) => valueOf(b) - valueOf(a) || String(a.name || '').localeCompare(String(b.name || ''))
  );
}

// What each column can be arranged by once its own measure has ordered it.
export const STANDING_SORTS = [
  { key: 'measure', label: 'By measure' },
  { key: 'movement', label: 'By movement' },
  { key: 'name', label: 'By name' },
];

const hasReading = (row, key) => {
  if (key === 'borda') return (row.borda_projected || 0) > 0;
  if (key === 'elo') return row.appearances > 0 || row.elo !== 1200;
  return (row.borda_projected || 0) > 0 || row.appearances > 0;
};

// What each column can be narrowed to. Every filter is a fact the column already reads —
// nothing here hides a nominee from the count, only from this view.
export const STANDING_FILTERS = [
  { key: 'all', label: 'Everyone', test: () => true },
  { key: 'record', label: 'On record', test: (row, key) => hasReading(row, key) },
  { key: 'blank', label: 'Nothing on record', test: (row, key) => !hasReading(row, key) },
  { key: 'climbed', label: 'Climbed', test: (row, move) => (move?.delta || 0) > 0 },
  { key: 'fell', label: 'Fell', test: (row, move) => (move?.delta || 0) < 0 },
  { key: 'moved', label: 'Moved either way', test: (row, move) => !!move?.delta },
];

// One pass that narrows, then arranges. The measure rank travels with the row, so a card
// read under another sort still prints where it truly stands.
export function arrange(rows, columnKey, { sortKey = 'measure', filterKey = 'all', moves = {} } = {}) {
  const filter = STANDING_FILTERS.find((f) => f.key === filterKey) || STANDING_FILTERS[0];
  const entries = rows
    .map((row, index) => ({ row, rank: index + 1, move: moves[row.id] || {} }))
    .filter((entry) => filter.test(entry.row, columnKey, entry.move));

  if (sortKey === 'name') {
    entries.sort((a, b) => String(a.row.name || '').localeCompare(String(b.row.name || '')));
  } else if (sortKey === 'movement') {
    entries.sort((a, b) => (b.move.delta || 0) - (a.move.delta || 0) || a.rank - b.rank);
  }

  return entries;
}
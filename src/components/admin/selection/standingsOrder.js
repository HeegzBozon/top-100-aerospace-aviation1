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
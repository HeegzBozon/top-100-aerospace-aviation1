// The timecard desk's own furniture: the palette the admin surfaces are read in, the
// curated categories an entry is filed under, and the arithmetic the tiles and rows
// share so a figure is computed one way and one way only.

export const TC = {
  surface: '#141b24',
  line: 'rgba(255,255,255,0.08)',
  ink: '#d4e0ec',
  soft: '#5d7a94',
  copper: '#b87333',
  gold: '#c9a87c',
};

export const CATEGORIES = [
  'editorial',
  'research',
  'production',
  'travel',
  'lodging',
  'meals',
  'software',
  'equipment',
  'services',
  'other',
];

export const STATUSES = ['draft', 'submitted', 'approved', 'paid'];

export const STATUS_TONE = {
  draft: '#5d7a94',
  submitted: '#c9a87c',
  approved: '#8fd3e8',
  paid: '#7ec89a',
};

// What one entry is worth: hours x rate for a time entry, the receipt for an expense.
export const amountOf = (entry) => {
  if (typeof entry?.amount_cents === 'number') return entry.amount_cents;
  if (entry?.kind === 'time') return Math.round((entry.hours || 0) * (entry.rate_cents || 0));
  return 0;
};

export const money = (cents) =>
  `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const hoursOf = (entries) =>
  entries.reduce((sum, e) => sum + (e.kind === 'time' ? e.hours || 0 : 0), 0);

// Totals are read off the entries that are on the desk, so a tile always agrees with
// the rows printed under it.
export const totalsOf = (entries) => ({
  hours: hoursOf(entries),
  timeCents: entries.filter((e) => e.kind === 'time').reduce((s, e) => s + amountOf(e), 0),
  expenseCents: entries.filter((e) => e.kind === 'expense').reduce((s, e) => s + amountOf(e), 0),
  awaiting: entries.filter((e) => e.status === 'submitted').length,
});

export const today = () => new Date().toISOString().slice(0, 10);

export const dayLabel = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
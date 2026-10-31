import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// The ballot ledger: who cast a list, and which weights landed. The ballot itself stays
// sealed; this is the seam the operator reads — the name, the cohort, and the count.

const COLUMNS = [
  { key: 'voter_name', label: 'Voter' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'state', label: 'State' },
  { key: 'length', label: 'Choices', numeric: true },
  { key: 'submitted_at', label: 'Submitted', numeric: true },
];

// A ballot cast is a vote; a ballot seeded is a draft standing from the Fellow's own
// nominations, waiting on them to save it. The two are never counted as one.
const STATE_TONE = {
  Cast: { color: '#2E7D5B', label: 'Cast' },
  Seeded: { color: '#8F5C2C', label: 'Seeded' },
};

function when(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BallotLedger({ ballots = [] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'submitted_at', dir: 'desc' });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? ballots.filter((row) =>
          [row.voter_name, row.voter_email, row.cohort, row.state].some((value) =>
            String(value || '').toLowerCase().includes(needle)
          )
        )
      : ballots;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === 'submitted_at') {
        const at = (row) => new Date(row.submitted_at || row.nominated_at || 0).getTime();
        return (at(a) - at(b)) * dir;
      }
      const x = a[sort.key];
      const y = b[sort.key];
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? '')) * dir;
    });
  }, [ballots, query, sort]);

  const toggle = (key) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-editorial-navy/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a voter or cohort"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
          {visible.length} of {ballots.length} shown
        </p>
      </div>

      {/* A phone reads the ledger as cards: five columns cannot be read across a hand's
          width without dragging the table sideways, and the state is what matters first. */}
      <div className="space-y-1.5 md:hidden">
        {visible.map((row) => {
          const tone = STATE_TONE[row.state] || STATE_TONE.Cast;
          return (
            <div
              key={row.id}
              className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-1.5 shadow-sm"
            >
              <div className="flex items-baseline gap-2">
                <p className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-tight text-editorial-navy">
                  {row.voter_name}
                </p>
                <span className="shrink-0 text-[8.5px] font-bold uppercase tracking-[0.16em]" style={{ color: tone.color }}>
                  {tone.label}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[9px] uppercase tracking-[0.1em] text-editorial-navy/45">
                <span className="truncate">{row.cohort || '—'}</span>
                <span className="tabular-nums">{row.length} choices</span>
                <span className="ml-auto tabular-nums normal-case tracking-normal">
                  {row.submitted_at
                    ? when(row.submitted_at)
                    : row.nominated_at
                      ? `nominated ${when(row.nominated_at)}`
                      : '—'}
                </span>
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="rounded-lg border border-editorial-navy/10 bg-white px-3 py-8 text-center text-[11px] leading-relaxed text-editorial-navy/55">
            {ballots.length === 0
              ? 'Nothing recorded in this scope yet. The ledger fills as the community weighs.'
              : `Nothing matches “${query}”.`}
          </p>
        )}
      </div>

      <div className="hidden max-h-[520px] overflow-auto rounded-lg border border-editorial-navy/10 bg-white md:block">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-editorial-navy text-editorial-cream">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em] ${
                    col.numeric ? 'text-right' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(col.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-editorial-gold"
                  >
                    {col.label}
                    {sort.key === col.key &&
                      (sort.dir === 'desc' ? <ArrowDown className="h-2.5 w-2.5" /> : <ArrowUp className="h-2.5 w-2.5" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-t border-editorial-navy/10 hover:bg-editorial-cream/70">
                <td className="px-2.5 py-1.5">
                  <p className="text-[12px] font-semibold leading-tight text-editorial-navy">{row.voter_name}</p>
                  <p className="text-[10px] leading-tight text-editorial-navy/45">{row.voter_email}</p>
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-editorial-navy/60">
                  {row.cohort || '—'}
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5">
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: (STATE_TONE[row.state] || STATE_TONE.Cast).color }}
                  >
                    {(STATE_TONE[row.state] || STATE_TONE.Cast).label}
                  </span>
                </td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">{row.length}</td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] tabular-nums text-editorial-navy/60">
                  {row.submitted_at ? when(row.submitted_at) : row.nominated_at ? `nominated ${when(row.nominated_at)}` : '—'}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-[12px] text-editorial-navy/55">
                  {ballots.length === 0
                    ? 'Nothing recorded in this scope yet. The ledger fills as the community weighs.'
                    : `Nothing matches “${query}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-editorial-navy/45">
        Sealed ballots: the ordering a voter saved is never shown here, only that it was cast. Seeded ballots are drafts
        standing from a voter’s own nominations — they are not votes until the voter saves them.
      </p>
    </div>
  );
}
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// The ledger: who cast a list, and which weights landed. The ballot itself stays sealed;
// this is the seam the operator reads — the name, the cohort, and the count.

const BALLOT_COLUMNS = [
  { key: 'voter_name', label: 'Voter' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'state', label: 'State' },
  { key: 'length', label: 'Choices', numeric: true },
  { key: 'submitted_at', label: 'Submitted', numeric: true },
];

const MARK_COLUMNS = [
  { key: 'voter_name', label: 'Voter' },
  { key: 'winner', label: 'Preferred' },
  { key: 'loser', label: 'Over' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'at', label: 'Cast', numeric: true },
];

// A ballot cast is a vote; a ballot seeded is a draft standing from the Fellow's own
// nominations, waiting on them to save it. The two are never counted as one.
const STATE_TONE = {
  Cast: { color: '#2E7D5B', label: 'Cast' },
  Seeded: { color: '#8F5C2C', label: 'Seeded' },
};

function when(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function BallotLedger({ kind = 'ballots', ballots = [], marks = [] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: kind === 'ballots' ? 'submitted_at' : 'at', dir: 'desc' });

  const columns = kind === 'ballots' ? BALLOT_COLUMNS : MARK_COLUMNS;
  const rows = kind === 'ballots' ? ballots : marks;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) =>
          [r.voter_name, r.voter_email, r.winner, r.loser, r.cohort, r.state].some((v) =>
            String(v || '').toLowerCase().includes(needle)
          )
        )
      : rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (sort.key.endsWith('_at') || sort.key === 'at') {
        const at = (row) => new Date(row[sort.key] || row.nominated_at || 0).getTime();
        return (at(a) - at(b)) * dir;
      }
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? '')) * dir;
    });
  }, [rows, query, sort]);

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
            placeholder={kind === 'ballots' ? 'Search a voter or cohort' : 'Search a name, voter or cohort'}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
          {visible.length} of {rows.length} on record
        </p>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-lg border border-editorial-navy/10 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-editorial-navy text-editorial-cream">
            <tr>
              {columns.map((col) => (
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
            {kind === 'ballots'
              ? visible.map((row) => (
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
                ))
              : visible.map((row) => (
                  <tr key={row.id} className="border-t border-editorial-navy/10 hover:bg-editorial-cream/70">
                    <td className="px-2.5 py-1.5">
                      <p className="text-[12px] font-semibold leading-tight text-editorial-navy">{row.voter_name}</p>
                      <p className="text-[10px] leading-tight text-editorial-navy/45">{row.voter_email}</p>
                    </td>
                    <td className="px-2.5 py-1.5 text-[12px] font-semibold text-editorial-navy">{row.winner}</td>
                    <td className="px-2.5 py-1.5 text-[12px] text-editorial-navy/70">{row.loser}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-editorial-navy/60">
                      {row.cohort || '—'}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] tabular-nums text-editorial-navy/60">
                      {when(row.at)}
                    </td>
                  </tr>
                ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-[12px] text-editorial-navy/55">
                  {rows.length === 0
                    ? 'Nothing recorded in this scope yet. The ledger fills as the community weighs.'
                    : `Nothing matches “${query}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-editorial-navy/45">
        {kind === 'ballots'
          ? 'Sealed ballots: the ordering a voter saved is never shown here, only that it was cast. Seeded ballots are drafts standing from a voter’s own nominations — they are not votes until the voter saves them.'
          : 'Every mark is recorded against the voter who cast it; the ballot behind it stays sealed.'}
      </p>
    </div>
  );
}
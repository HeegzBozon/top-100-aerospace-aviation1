import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// The standings as the operator reads them: the whole pool the ballot is counting, one
// ordering hint across every cohort, with the marks behind it in view. Every nominee is
// here — including the ones no one has weighed yet — so the field the operator is watching
// is never a slice of itself.

const PAGE_SIZE = 50;

const COLUMNS = [
  { key: 'position', label: '#', numeric: true },
  { key: 'name', label: 'Fellow' },
  { key: 'cohort_label', label: 'Cohort' },
  { key: 'elo', label: 'Elo', numeric: true },
  { key: 'borda', label: 'Borda', numeric: true },
  { key: 'appearances', label: 'Marks', numeric: true },
  { key: 'wins', label: 'W', numeric: true },
  { key: 'losses', label: 'L', numeric: true },
  { key: 'combined_index', label: 'Index', numeric: true },
];

function value(row, key) {
  if (key === 'cohort_label') return row.cohort_label || '—';
  return row[key];
}

export default function StandingsTable({ rows = [] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'combined_index', dir: 'desc' });
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) =>
          [r.name, r.company, r.title, r.cohort_label].some((v) =>
            String(v || '').toLowerCase().includes(needle)
          )
        )
      : rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = value(a, sort.key);
      const y = value(b, sort.key);
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? '')) * dir;
    });
  }, [rows, query, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const windowRows = visible.slice(start, start + PAGE_SIZE);

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
            placeholder="Search a name, company or cohort"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
          {query.trim() ? `${visible.length} of ${rows.length} in the pool` : `${rows.length} in the pool`}
        </p>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-lg border border-editorial-navy/10 bg-white">
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
            {windowRows.map((row) => (
              <tr key={row.id} className="border-t border-editorial-navy/10 hover:bg-editorial-cream/70">
                <td className="px-2.5 py-1.5 text-right font-heading text-[12px] tabular-nums text-editorial-navy/60">
                  {row.position}
                </td>
                <td className="px-2.5 py-1.5">
                  <p className="text-[12px] font-semibold leading-tight text-editorial-navy">{row.name}</p>
                  <p className="text-[10px] leading-tight text-editorial-navy/50">
                    {[row.title, row.company].filter(Boolean).join(' · ') || '—'}
                  </p>
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-editorial-navy/60">
                  {row.cohort_label || '—'}
                </td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">{Math.round(row.elo)}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">{Math.round(row.borda)}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/75">{row.appearances}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-label">{row.wins}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/50">{row.losses}</td>
                <td className="px-2.5 py-1.5 text-right font-heading text-[13px] tabular-nums text-editorial-navy">
                  {row.combined_index}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-[12px] text-editorial-navy/55">
                  {rows.length === 0
                    ? 'No nominee is standing in this scope yet. The pool appears as cohorts activate.'
                    : `No name in this pool matches “${query}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-editorial-navy/45">
          The index is an ordering hint for review only — no weight of it leaves the platform.
        </p>
        {pageCount > 1 && (
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="mr-1 text-[10px] tabular-nums uppercase tracking-[0.14em] text-editorial-navy/45">
              {start + 1}–{Math.min(start + PAGE_SIZE, visible.length)} of {visible.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0"
              disabled={current === pageCount}
              onClick={() => setPage(current + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
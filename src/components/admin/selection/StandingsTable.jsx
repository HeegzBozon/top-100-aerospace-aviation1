import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useStandingsMovement from './useStandingsMovement';
import StandingMovement, { movementEdge } from './StandingMovement';

// The standings as the operator reads them: the whole pool the ballot is counting, the
// three measures side by side, and the movement each position made since the last
// reading. Every nominee is here — including the ones no one has weighed yet — so the
// field the operator is watching is never a slice of itself.

const PAGE_SIZE = 50;

// The measures, in the order they are read. Each is its own column so a nominee can be
// followed down one of them without the combined hint standing in for it.
const MEASURES = [
  { key: 'borda', label: 'Borda', hint: 'ranked lists' },
  { key: 'elo', label: 'Elo', hint: 'pairwise marks' },
  { key: 'combined_index', label: 'Combined', hint: 'ordering hint' },
];

const COLUMNS = [
  { key: 'position', label: '#', numeric: true },
  { key: 'name', label: 'Fellow' },
  { key: 'cohort_label', label: 'Cohort' },
  ...MEASURES,
  { key: 'appearances', label: 'Marks', numeric: true, quiet: true },
  { key: 'wins', label: 'W', numeric: true, quiet: true },
  { key: 'losses', label: 'L', numeric: true, quiet: true },
];

const MEASURE_KEYS = new Set(MEASURES.map((m) => m.key));

function value(row, key) {
  if (key === 'cohort_label') return row.cohort_label || '—';
  return row[key];
}

// A dash, not a zero: a measure a nominee has not been weighed on yet is absent, and
// printing 0 for it makes an unmeasured field look like a scored one.
function bordaText(row) {
  return row.borda ? Math.round(row.borda) : '—';
}

function eloText(row) {
  return row.appearances > 0 || row.elo !== 1200 ? Math.round(row.elo) : '—';
}

function combinedText(row) {
  const measured = row.borda > 0 || row.appearances > 0 || row.holistic > 0;
  return measured ? row.combined_index : '—';
}

export default function StandingsTable({ rows = [], seeded = 0, scopeKey = 'all' }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'combined_index', dir: 'desc' });
  const [page, setPage] = useState(1);

  const { moves, since } = useStandingsMovement(rows, scopeKey);

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

  const unweighed = rows.length > 0 && rows.every((r) => !r.borda);
  const sinceStamp = since
    ? new Date(since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;

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
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
            {query.trim() ? `${visible.length} of ${rows.length} in the pool` : `${rows.length} in the pool`}
          </p>
          <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/35">
            {sinceStamp ? `Movement since ${sinceStamp}` : 'Movement from the next reading'}
          </p>
        </div>
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
                  } ${MEASURE_KEYS.has(col.key) ? 'border-x border-editorial-cream/20' : ''} ${
                    col.quiet ? 'text-editorial-cream/55' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(col.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-editorial-gold"
                    title={MEASURES.find((m) => m.key === col.key)?.hint}
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
            {windowRows.map((row) => {
              const move = moves[row.id] || {};
              return (
                <tr
                  key={row.id}
                  className={`border-t border-editorial-navy/10 hover:bg-editorial-cream/70 ${movementEdge(move)}`}
                >
                  <td className="whitespace-nowrap px-2.5 py-1.5">
                    <span className="inline-flex items-center justify-end gap-1">
                      <StandingMovement delta={move.delta} isNew={move.isNew} since={since} />
                      <span className="font-heading text-[12px] tabular-nums text-editorial-navy/60">
                        {row.position}
                      </span>
                    </span>
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
                  <td className="border-x border-editorial-navy/10 bg-editorial-cream/50 px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">
                    {bordaText(row)}
                  </td>
                  <td className="border-x border-editorial-navy/10 bg-editorial-cream/50 px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">
                    {eloText(row)}
                  </td>
                  <td className="border-x border-editorial-navy/10 bg-editorial-cream/50 px-2.5 py-1.5 text-right font-heading text-[13px] tabular-nums text-editorial-navy">
                    {combinedText(row)}
                  </td>
                  <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/75">{row.appearances}</td>
                  <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-label">{row.wins}</td>
                  <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/50">{row.losses}</td>
                </tr>
              );
            })}
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

      {unweighed && (
        <p className="rounded-md border-l-2 border-editorial-copper bg-editorial-cream/60 px-3 py-2 text-[11px] leading-relaxed text-editorial-navy/70">
          <span className="font-semibold text-editorial-navy">No ballot has been cast in this scope yet</span>, so no
          Borda points are standing. {seeded > 0 && `${seeded} draft${seeded === 1 ? '' : 's'} seeded from nominations ${seeded === 1 ? 'is' : 'are'} waiting on ${seeded === 1 ? 'its Fellow' : 'their Fellows'} to finalize. `}
          A draft never scores until it is cast.
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-editorial-navy/45">
          Borda from ranked lists · Elo from pairwise marks · Combined is an ordering hint for review only — no weight
          of it leaves the platform.
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
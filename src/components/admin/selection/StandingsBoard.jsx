import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { STANDING_COLUMNS, orderFor } from './standingsOrder';
import useStandingsMovement from './useStandingsMovement';
import StandingsColumn from './StandingsColumn';
import MobileStandingsLedger from './MobileStandingsLedger';
import StandingDetailDialog from './StandingDetailDialog';

// The standings as a board: the same pool ordered three ways, read side by side. Borda,
// Elo and the combined hint each get their own column, so a nominee can be followed down
// one measure without the other two standing in for it — and the whole field is on the
// board, not a slice of itself.
export default function StandingsBoard({
  rows = [],
  seeded = 0,
  castBallots = 0,
  mode = 'live',
  scopeKey = 'all',
}) {
  const [query, setQuery] = useState('');
  // The nominee whose full reading is open, with the column it was opened from.
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.name, row.company, row.title, row.cohort_label].some((value) =>
        String(value || '').toLowerCase().includes(needle)
      )
    );
  }, [rows, query]);

  const rankings = useMemo(
    () => Object.fromEntries(STANDING_COLUMNS.map((column) => [column.key, orderFor(filtered, column.key)])),
    [filtered]
  );

  const { moves, since } = useStandingsMovement(rankings, scopeKey);
  const sinceStamp = since
    ? new Date(since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-editorial-navy/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a name, company or cohort"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
            {query.trim() ? `${filtered.length} of ${rows.length} in the pool` : `${rows.length} in the pool`}
          </p>
          <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/35">
            {sinceStamp ? `Movement since ${sinceStamp}` : 'Movement from the next reading'}
          </p>
        </div>
      </div>

      {/* A phone reads one ledger, not three columns: the same field with all three
          measures on every row, ordered down whichever one is pressed. */}
      <div className="md:hidden">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.14em] text-editorial-navy/40">
          {mode === 'internal'
            ? 'Internal · never scored'
            : `Projected · ${castBallots} cast + ${seeded} seeded`}
        </p>
        <MobileStandingsLedger rows={filtered} moves={moves} since={since} mode={mode} onOpen={setSelected} />
      </div>

      <p className="hidden text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/40 md:block">
        {mode === 'internal'
          ? `Internal record · ${castBallots} cast + ${seeded} seeded · Elo recomputed from these sets · never scored`
          : `Projected · ${castBallots} cast + ${seeded} seeded · Elo from the marks in view · never published`}
      </p>

      <div className="hidden gap-2 md:grid md:grid-cols-3">
        {STANDING_COLUMNS.map((column) => (
          <StandingsColumn
            key={column.key}
            column={column}
            rows={rankings[column.key]}
            moves={moves[column.key]}
            since={since}
            resetKey={query}
            onOpen={setSelected}
          />
        ))}
      </div>

      <p className="hidden text-[9px] text-editorial-navy/35 md:block">
        Borda · Elo · Combined — an ordering hint for review only.
      </p>

      <StandingDetailDialog entry={selected} since={since} onClose={() => setSelected(null)} />
    </div>
  );
}
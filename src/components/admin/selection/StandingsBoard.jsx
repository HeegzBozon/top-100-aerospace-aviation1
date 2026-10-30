import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { STANDING_COLUMNS, orderFor } from './standingsOrder';
import useStandingsMovement from './useStandingsMovement';
import StandingsColumn from './StandingsColumn';
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

      <p className="rounded-md border-l-2 border-editorial-copper bg-editorial-cream/70 px-3 py-2 text-[11px] leading-relaxed text-editorial-navy/70">
        {mode === 'internal' ? (
          <>
            <span className="font-semibold text-editorial-navy">This is the internal record.</span> Every mark in view was
            cast by an administrator and stamped at the moment it was written. None of it is scored or published: the Elo
            column is recomputed from these sets alone, so the platform can read a baseline of its own beside the
            community's. The recorded rating on each record is untouched.
          </>
        ) : (
          <>
            <span className="font-semibold text-editorial-navy">Borda and Combined are projected.</span> {castBallots}{' '}
            ballot{castBallots === 1 ? '' : 's'} cast and {seeded} draft{seeded === 1 ? '' : 's'} seeded from nominations,
            read here as if cast. Nothing is written, and no projected figure reaches a Fellow's surface. Elo is scored
            from this view's marks alone: an administrator's set is stamped and never scored, so a review leaves no mark
            on the community's rating.
          </>
        )}
      </p>

      <div className="grid gap-2 md:grid-cols-3">
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

      <p className="text-[10px] text-editorial-navy/45">
        {mode === 'internal'
          ? 'Borda from ranked lists · Elo recomputed from the internal sets in view · Combined is an ordering hint for review only.'
          : 'Borda from ranked lists · Elo recomputed from the community marks in view · Combined is an ordering hint for review only. No weight of it leaves the platform.'}
      </p>

      <StandingDetailDialog entry={selected} since={since} onClose={() => setSelected(null)} />
    </div>
  );
}
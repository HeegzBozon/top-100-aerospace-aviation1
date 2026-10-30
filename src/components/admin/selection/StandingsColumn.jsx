import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StandingsCard from './StandingsCard';
import { STANDING_FILTERS, STANDING_SORTS, arrange } from './standingsOrder';

// One measure, one column: the pool ordered down it, each card carrying its own movement
// since the last reading. Each column narrows and arranges on its own — reading Elo by
// movement while Borda stays on the measure is the reason the columns were split apart.

const STEP = 40;
const FIRST = 25;

export default function StandingsColumn({ column, rows = [], moves = {}, since, resetKey, onOpen }) {
  const [limit, setLimit] = useState(FIRST);
  const [sortKey, setSortKey] = useState('measure');
  const [filterKey, setFilterKey] = useState('all');

  // A new search, sort or filter starts the column at the top again; a live refresh
  // never shortens what the operator has already opened up.
  useEffect(() => {
    setLimit(FIRST);
  }, [resetKey, sortKey, filterKey]);

  const entries = useMemo(
    () => arrange(rows, column.key, { sortKey, filterKey, moves }),
    [rows, column.key, sortKey, filterKey, moves]
  );

  const narrowed = filterKey !== 'all' || sortKey !== 'measure';

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-editorial-navy/10 bg-editorial-cream/40">
      <div className="bg-editorial-navy px-3 py-2 text-editorial-cream">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">{column.label}</p>
          <p className="text-[9px] uppercase tracking-[0.12em] text-editorial-cream/45">{rows.length}</p>
        </div>
        <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-cream/55">{column.hint}</p>

        <div className="mt-1.5 grid grid-cols-2 gap-1">
          <Select value={sortKey} onValueChange={setSortKey}>
            <SelectTrigger className="h-6 gap-1 border-editorial-cream/25 bg-editorial-navy/40 px-1.5 text-[9px] uppercase tracking-[0.1em] text-editorial-cream focus:ring-editorial-gold/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STANDING_SORTS.map((sort) => (
                <SelectItem key={sort.key} value={sort.key} className="text-xs">
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterKey} onValueChange={setFilterKey}>
            <SelectTrigger className="h-6 gap-1 border-editorial-cream/25 bg-editorial-navy/40 px-1.5 text-[9px] uppercase tracking-[0.1em] text-editorial-cream focus:ring-editorial-gold/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STANDING_FILTERS.map((filter) => (
                <SelectItem key={filter.key} value={filter.key} className="text-xs">
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-h-[560px] space-y-1 overflow-y-auto p-1.5">
        {entries.slice(0, limit).map((entry) => (
          <StandingsCard
            key={entry.row.id}
            row={entry.row}
            rank={entry.rank}
            move={entry.move}
            since={since}
            column={column}
            onOpen={onOpen}
          />
        ))}

        {entries.length === 0 && (
          <p className="px-2 py-8 text-center text-[11px] leading-relaxed text-editorial-navy/55">
            {resetKey?.trim()
              ? `No name in this pool matches “${resetKey}”.`
              : narrowed
                ? 'No candidate in this column meets the filter. Widen it to read the pool again.'
                : 'No nominee is standing in this scope yet. The pool appears as cohorts activate.'}
          </p>
        )}

        {entries.length > limit && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-full text-[10px] uppercase tracking-[0.14em] text-editorial-navy/55"
            onClick={() => setLimit((value) => value + STEP)}
          >
            Show {Math.min(STEP, entries.length - limit)} more
          </Button>
        )}
      </div>

      <div className="border-t border-editorial-navy/10 px-3 py-1.5">
        <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40">
          {narrowed ? `${entries.length} of ${rows.length} shown` : `${rows.length} in this reading`}
        </p>
      </div>
    </div>
  );
}
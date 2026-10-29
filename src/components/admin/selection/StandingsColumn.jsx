import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import StandingsCard from './StandingsCard';

// One measure, one column: the pool ordered down it, each card carrying its own movement
// since the last reading. Columns are read side by side, so the same nominee can be found
// at very different places in each — which is the point of splitting them.

const STEP = 40;
const FIRST = 25;

export default function StandingsColumn({ column, rows = [], moves = {}, since, resetKey }) {
  const [limit, setLimit] = useState(FIRST);

  // A new search starts the column at the top again; a live refresh never shortens it.
  useEffect(() => {
    setLimit(FIRST);
  }, [resetKey]);

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-editorial-navy/10 bg-editorial-cream/40">
      <div className="bg-editorial-navy px-3 py-2 text-editorial-cream">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">{column.label}</p>
        <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-cream/55">{column.hint}</p>
      </div>

      <div className="max-h-[560px] space-y-1 overflow-y-auto p-1.5">
        {rows.slice(0, limit).map((row, index) => (
          <StandingsCard
            key={row.id}
            row={row}
            rank={index + 1}
            move={moves[row.id] || {}}
            since={since}
            column={column}
          />
        ))}

        {rows.length === 0 && (
          <p className="px-2 py-8 text-center text-[11px] leading-relaxed text-editorial-navy/55">
            {resetKey?.trim()
              ? `No name in this pool matches “${resetKey}”.`
              : 'No nominee is standing in this scope yet. The pool appears as cohorts activate.'}
          </p>
        )}

        {rows.length > limit && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-full text-[10px] uppercase tracking-[0.14em] text-editorial-navy/55"
            onClick={() => setLimit((value) => value + STEP)}
          >
            Show {Math.min(STEP, rows.length - limit)} more
          </Button>
        )}
      </div>

      <div className="border-t border-editorial-navy/10 px-3 py-1.5">
        <p className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40">{rows.length} in this reading</p>
      </div>
    </div>
  );
}
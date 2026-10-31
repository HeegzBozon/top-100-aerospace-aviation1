import { useMemo, useState } from 'react';
import { STANDING_COLUMNS, orderFor } from './standingsOrder';

// The standings on a phone.
//
// Three columns of cards cannot be read across a hand's width — they stack, and the
// whole point of the board (the same field ordered three ways) is lost in the scroll. So
// the phone prints one row per nominee with all three measures on it: Borda, Elo and the
// combined hint side by side, the measure being ordered by lit in copper, and a tap on a
// heading re-orders the field down that measure. No sideways scrolling, no stacking.

const CELLS = [
  { key: 'borda', label: 'Borda' },
  { key: 'elo', label: 'Elo' },
  { key: 'combined', label: 'Comb' },
];

function valueFor(row, key) {
  if (key === 'borda') return row.borda_projected ? Math.round(row.borda_projected) : '—';
  if (key === 'elo') return row.appearances > 0 || row.elo !== 1200 ? Math.round(row.elo) : '—';
  const measured = row.borda_projected > 0 || row.appearances > 0;
  return measured ? row.combined_index : '—';
}

function moveTone(delta) {
  if (!delta) return 'rgba(30,58,90,0.25)';
  return delta > 0 ? '#B87333' : 'rgba(30,58,90,0.45)';
}

export default function MobileStandingsLedger({ rows = [], moves = {}, since, mode = 'live', onOpen }) {
  const [measure, setMeasure] = useState('combined');

  // The pool ordered down the chosen measure, each row carrying where it truly stands
  // and how it moved since the last reading.
  const columnMoves = moves[measure] || {};
  const ordered = useMemo(
    () =>
      orderFor(rows, measure).map((row, index) => ({
        row,
        rank: index + 1,
        move: columnMoves[row.id] || {},
      })),
    [rows, measure, columnMoves],
  );

  const column = STANDING_COLUMNS.find((item) => item.key === measure) || STANDING_COLUMNS[0];

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-editorial-navy/10 bg-white">
        {/* The headings are the control: press one and the field is ordered down it. */}
        <div className="grid grid-cols-[18px_1fr_40px_38px_40px] items-end gap-1 bg-editorial-navy px-2 py-1.5">
          <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-editorial-cream/45">#</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-editorial-cream/45">Name</span>
          {CELLS.map((cell) => {
            const active = cell.key === measure;
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setMeasure(cell.key)}
                aria-pressed={active}
                className="text-right text-[8px] font-bold uppercase tracking-[0.12em] transition-colors"
                style={{ color: active ? '#C9A87C' : 'rgba(250,248,245,0.45)' }}
              >
                {cell.label}
                <span
                  className="mt-0.5 block h-[1.5px] w-full"
                  style={{ background: active ? '#C9A87C' : 'transparent' }}
                />
              </button>
            );
          })}
        </div>

        <div className="max-h-[62vh] overflow-y-auto">
          {ordered.map((entry) => {
            const { row, rank, move = {} } = entry;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onOpen?.({ row, rank, move, column })}
                className="grid w-full grid-cols-[18px_1fr_40px_38px_40px] items-center gap-1 border-t border-editorial-navy/10 px-2 py-1.5 text-left transition-colors hover:bg-editorial-cream/70"
              >
                <span className="flex flex-col leading-none">
                  <span className="font-heading text-[11px] tabular-nums text-editorial-navy/45">{rank}</span>
                  <span className="mt-0.5 text-[8px] font-bold tabular-nums" style={{ color: moveTone(move.delta) }}>
                    {move.isNew ? 'new' : move.delta ? `${move.delta > 0 ? '▲' : '▼'}${Math.abs(move.delta)}` : '·'}
                  </span>
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold leading-tight text-editorial-navy">
                    {row.name}
                  </span>
                  <span className="block truncate text-[9px] uppercase tracking-[0.1em] leading-tight text-editorial-navy/40">
                    {[row.cohort_label, `${row.appearances || 0} marks`].filter(Boolean).join(' · ')}
                  </span>
                </span>

                {CELLS.map((cell) => {
                  const active = cell.key === measure;
                  return (
                    <span
                      key={cell.key}
                      className={`text-right text-[11px] tabular-nums ${
                        active ? 'font-semibold text-editorial-navy' : 'text-editorial-navy/55'
                      }`}
                    >
                      {valueFor(row, cell.key)}
                    </span>
                  );
                })}
              </button>
            );
          })}

          {ordered.length === 0 && (
            <p className="px-3 py-8 text-center text-[11px] leading-relaxed text-editorial-navy/55">
              No nominee is standing in this reading. The pool appears as cohorts activate.
            </p>
          )}
        </div>
      </div>

      <p className="mt-1.5 text-[9.5px] leading-relaxed text-editorial-navy/45">
        Ordered by {column.label.toLowerCase()} · {column.hint.toLowerCase()}.
        {since ? ` Movement since ${new Date(since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.` : ''}{' '}
        {mode === 'internal'
          ? 'Internal sets: recorded, never scored.'
          : 'Borda and Combined are projected; Elo is scored from the marks in view.'}
      </p>
    </div>
  );
}
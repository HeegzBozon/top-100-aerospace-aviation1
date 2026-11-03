import { ArrowLeft, Trophy } from 'lucide-react';
import TouchKeys from './TouchKeys';
import useArcadeRecords from './useArcadeRecords';

// The keys a cabinet is asked for. Sentinel and Belt Run are steered; Guardian is aimed
// at with a finger, so it is handed no pad at all.
const KEY_SETS = {
  sentinel: [
    { keyName: 'ArrowLeft', label: 'Steer left', glyph: '◀' },
    { keyName: ' ', label: 'Fire', glyph: 'FIRE' },
    { keyName: 'ArrowRight', label: 'Steer right', glyph: '▶' },
  ],
  'belt-run': [
    { keyName: 'ArrowLeft', label: 'Turn left', glyph: '◀' },
    { keyName: 'ArrowUp', label: 'Thrust', glyph: '▲' },
    { keyName: ' ', label: 'Fire', glyph: 'FIRE' },
    { keyName: 'ArrowRight', label: 'Turn right', glyph: '▶' },
  ],
};

const format = (n) => (n ? n.toLocaleString() : '—');

export default function ArcadeStage({ cabinet, onExit, embedded = false }) {
  const { records, submit } = useArcadeRecords();
  const keys = KEY_SETS[cabinet.id] || [];
  const Game = cabinet.component;

  // Every point the machine counts is offered to the house record; it keeps whichever
  // stands highest, so a record can be set mid-run and the cabinet says so at once.
  const onScore = (score) => submit(cabinet.id, score);

  return (
    <div className={embedded ? '' : 'mx-auto w-full max-w-4xl px-4 py-8 md:px-8'}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-editorial-copper/40 pb-3">
        <div className="min-w-0">
          <p className="pd-label text-editorial-gold/80">The Arcade · in play</p>
          <h1 className="font-heading text-2xl leading-tight text-editorial-cream md:text-3xl">{cabinet.label}</h1>
          <p className="mt-1 text-xs text-editorial-cream/60">
            {cabinet.mechanism} · {cabinet.controls}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="arcade-record inline-flex items-center gap-1.5 px-2.5 py-1">
            <Trophy className="h-3.5 w-3.5" style={{ color: cabinet.accent }} />
            <span className="text-[10px] uppercase tracking-[0.16em] text-editorial-cream/70">Record</span>
            <span className="font-heading text-sm text-editorial-cream">{format(records[cabinet.id])}</span>
          </span>
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded border border-editorial-cream/25 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-cream/80 transition-colors hover:border-editorial-copper hover:text-editorial-cream"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Hall
          </button>
        </div>
      </div>

      <div className="arcade-glass relative mt-4 overflow-hidden rounded-lg">
        <Game onScore={onScore} />
      </div>

      {keys.length > 0 ? (
        <div className="mt-4 md:hidden">
          <p className="pd-label mb-2 text-editorial-gold/70">Cabinet keys</p>
          <TouchKeys keys={keys} />
        </div>
      ) : (
        <p className="mt-4 text-xs text-editorial-cream/60 md:hidden">Tap the sky inside the glass to intercept.</p>
      )}
    </div>
  );
}
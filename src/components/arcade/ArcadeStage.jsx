import { useEffect } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import TouchKeys from './TouchKeys';
import useArcadeRecords from './useArcadeRecords';
import useArcadeControls from './useArcadeControls';
import { isAimCabinet } from './arcadeConfig';
import { notePlay } from './arcadeProgress';

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

  // The console's ring, centre and face keys are handed to the machine while it is open, so
  // a cabinet plays the same on the hardware as it does under a keyboard.
  useArcadeControls(cabinet, onExit);

  // A turn at a machine is what the passport's East Wing quests and the cabinet badges read.
  useEffect(() => { notePlay(cabinet.id); }, [cabinet.id]);

  // Every point the machine counts is offered to the house record; it keeps whichever
  // stands highest, so a record can be set mid-run and the cabinet says so at once.
  const onScore = (score) => submit(cabinet.id, score);

  return (
    <div className={embedded ? '' : 'mx-auto w-full max-w-4xl px-4 py-8 md:px-8'}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-editorial-copper/40 pb-2.5">
        <div className="min-w-0">
          {/* The marquee is read on one line inside the glass, so the machine is never
              pushed down the picture by its own title. */}
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-gold/80">The Arcade · in play</p>
          <h1 className="font-heading text-xl leading-tight text-editorial-cream md:text-3xl">{cabinet.label}</h1>
          <p className="mt-0.5 truncate text-[11px] text-editorial-cream/60 md:mt-1 md:text-xs">
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

      <div className="arcade-glass relative mt-3 overflow-hidden rounded-lg md:mt-4">
        <Game onScore={onScore} />
      </div>

      {keys.length > 0 ? (
        <div className="mt-3 md:hidden">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-editorial-gold/70">Cabinet keys</p>
            <p className="text-[9px] uppercase tracking-[0.12em] text-editorial-cream/40">or the wheel</p>
          </div>
          <TouchKeys keys={keys} />
        </div>
      ) : (
        <p className="mt-3 text-xs text-editorial-cream/60 md:hidden">
          {isAimCabinet(cabinet) ? 'Tap the sky inside the glass to intercept. B steps back to the hall.' : 'Play it on the glass.'}
        </p>
      )}
    </div>
  );
}
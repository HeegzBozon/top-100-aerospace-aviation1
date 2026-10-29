import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

// One movement cue, printed beside a position. Copper for a climb, quiet navy for a fall,
// a hairline for a field that has not moved: no green or red — the platform reports
// movement, it does not cheer for it.
export default function StandingMovement({ delta, isNew, since }) {
  if (isNew) {
    return (
      <span
        className="inline-flex w-[24px] justify-end text-[8.5px] font-bold uppercase tracking-[0.14em] text-editorial-label"
        title="Was not in the pool at the last reading"
      >
        New
      </span>
    );
  }

  if (!delta) {
    return (
      <span className="inline-flex w-[24px] items-center justify-end" title="No movement">
        <Minus className="h-2.5 w-2.5 text-editorial-navy/25" />
      </span>
    );
  }

  const climbed = delta > 0;
  const Icon = climbed ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex w-[24px] items-center justify-end gap-0.5 text-[9.5px] font-bold tabular-nums ${
        climbed ? 'text-editorial-copper' : 'text-editorial-navy/45'
      }`}
      title={`${climbed ? 'Up' : 'Down'} ${Math.abs(delta)} place${Math.abs(delta) === 1 ? '' : 's'}${
        since ? ` since ${new Date(since).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}` : ''
      }`}
    >
      <Icon className="h-2.5 w-2.5" />
      {Math.abs(delta)}
    </span>
  );
}
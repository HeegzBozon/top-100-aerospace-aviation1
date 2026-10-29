import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  List,
  Pause,
  Play,
} from 'lucide-react';
import { READ_PACES } from './BookTransport';

const CREAM = '#FAF8F5';
const COPPER = '#B87333';
const GOLD = '#C9A87C';

// The record's transport, cut for the shelf.
//
// The same pages, the same measure: one segment a page across the top — the copper on
// the spread being read, every segment a way to its page — and under it the turn keys,
// the readout, the pace and the contents. It is the book's own transport laid along the
// machine's shelf, so the record is driven from the hardware rather than from a strip
// covering the page.
//
// Every key here is a fixed size and the row never wraps: the shelf is a moulded part
// with a fixed width, so the transport shrinks with it rather than spilling over the
// seams and the account key at its ends. The pace is one key that cycles, printing the
// pace it is set to, because four printed keys were the widest thing on the shelf.
function Key({ onClick, disabled, label, children, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-25 ${
        primary ? 'h-8 w-8' : 'h-7 w-7 hover:bg-white/10'
      }`}
      style={
        primary
          ? { background: COPPER, border: `1px solid ${COPPER}`, color: CREAM }
          : { color: CREAM }
      }
    >
      {children}
    </button>
  );
}

export default function BookDockTransport({
  labels = [],
  index = 0,
  visibleCount = 1,
  playing = false,
  pace = 'normal',
  onFirst,
  onPrev,
  onNext,
  onTogglePlay,
  onJump,
  onContents,
  onPace,
}) {
  const pageCount = labels.length;
  if (!pageCount) return null;

  const paceIndex = Math.max(
    0,
    READ_PACES.findIndex((p) => p.key === pace)
  );
  const current = READ_PACES[paceIndex] || READ_PACES[0];
  const nextPace = READ_PACES[(paceIndex + 1) % READ_PACES.length];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* The measure: every page a segment, and a way to it */}
      <div
        className="flex items-center gap-[3px] px-1"
        role="group"
        aria-label="Jump to a page"
      >
        {labels.map((label, i) => {
          const active = i >= index && i < index + visibleCount;
          const read = i < index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump?.(i)}
              aria-label={`Page ${i + 1}: ${label}`}
              aria-current={active ? 'page' : undefined}
              className="h-[3px] min-w-0 flex-1 rounded-full transition-colors hover:opacity-80"
              style={{
                background: active
                  ? COPPER
                  : read
                    ? 'rgba(201,168,124,0.55)'
                    : 'rgba(250,248,245,0.18)',
                boxShadow: active ? `0 0 8px ${COPPER}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="flex min-w-0 items-center gap-1">
        <Key onClick={onFirst} disabled={index <= 0} label="Back to the cover">
          <ChevronsLeft className="h-3 w-3" />
        </Key>
        <Key onClick={onPrev} disabled={index <= 0} label="Previous page">
          <ChevronLeft className="h-3.5 w-3.5" />
        </Key>
        <Key onClick={onTogglePlay} label={playing ? 'Pause the record' : 'Play the record'} primary>
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Key>
        <Key
          onClick={onNext}
          disabled={index + visibleCount >= pageCount}
          label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Key>

        <span
          className="shrink-0 px-1 text-[11px] tabular-nums"
          style={{ fontFamily: 'var(--font-heading)', color: CREAM }}
          aria-live="polite"
        >
          {String(index + 1).padStart(2, '0')}
          <span style={{ color: 'rgba(250,248,245,0.35)' }}>
            {visibleCount > 1
              ? `–${String(Math.min(index + visibleCount, pageCount)).padStart(2, '0')}`
              : ''}{' '}
            / {String(pageCount).padStart(2, '0')}
          </span>
        </span>

        <button
          type="button"
          onClick={() => onPace?.(nextPace.key)}
          aria-label={`Playback pace: ${current.label}. Change to ${nextPace.label}`}
          title={`Pace · ${current.label}`}
          className="shrink-0 rounded-full px-2 py-1 font-body text-[8px] font-bold uppercase tracking-[0.16em] transition-colors"
          style={{
            border: '1px solid rgba(184,115,51,0.6)',
            background: 'rgba(184,115,51,0.16)',
            color: GOLD,
          }}
        >
          {current.label}
        </button>

        <button
          type="button"
          onClick={onContents}
          aria-label="Contents"
          title="Contents"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.62)' }}
        >
          <List className="h-3 w-3" style={{ color: GOLD }} />
        </button>
      </div>
    </div>
  );
}
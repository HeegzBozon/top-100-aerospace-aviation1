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
function Key({ onClick, disabled, label, children, primary }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-25 ${
        primary ? 'h-9 w-9' : 'h-8 w-8 hover:bg-white/10'
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

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      {/* The measure: every page a segment, and a way to it */}
      <div
        className="flex items-center gap-[3px] px-1"
        role="group"
        aria-label="Jump to a page"
      >
        {labels.map((label, i) => {
          const current = i >= index && i < index + visibleCount;
          const read = i < index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onJump?.(i)}
              aria-label={`Page ${i + 1}: ${label}`}
              aria-current={current ? 'page' : undefined}
              className="h-[3px] min-w-0 flex-1 rounded-full transition-colors hover:opacity-80"
              style={{
                background: current
                  ? COPPER
                  : read
                    ? 'rgba(201,168,124,0.55)'
                    : 'rgba(250,248,245,0.18)',
                boxShadow: current ? `0 0 8px ${COPPER}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <Key onClick={onFirst} disabled={index <= 0} label="Back to the cover">
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Key>
        <Key onClick={onPrev} disabled={index <= 0} label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Key>
        <Key onClick={onTogglePlay} label={playing ? 'Pause the record' : 'Play the record'} primary>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Key>
        <Key onClick={onNext} disabled={index >= pageCount - 1} label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Key>

        <span
          className="shrink-0 px-1.5 text-[12px] tabular-nums"
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

        <div
          className="ml-1 flex items-center gap-0.5"
          role="group"
          aria-label="Playback pace"
        >
          {READ_PACES.map(({ key, label }) => {
            const active = pace === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPace?.(key)}
                aria-pressed={active}
                className="rounded-full px-2 py-1 font-body text-[8.5px] font-bold uppercase tracking-[0.16em] transition-colors"
                style={
                  active
                    ? {
                        background: 'rgba(184,115,51,0.24)',
                        border: '1px solid rgba(184,115,51,0.75)',
                        color: GOLD,
                      }
                    : {
                        border: '1px solid rgba(250,248,245,0.14)',
                        color: 'rgba(250,248,245,0.52)',
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContents}
          aria-label="Contents"
          title="Contents"
          className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.62)' }}
        >
          <List className="h-3.5 w-3.5" style={{ color: GOLD }} />
        </button>
      </div>
    </div>
  );
}
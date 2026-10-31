import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  List,
  Pause,
  Play,
} from 'lucide-react';

const CREAM = '#FAF8F5';
const COPPER = '#B87333';
const GOLD = '#C9A87C';

// How the record plays. Slower and faster scale the dwell each spread is held
// for; skim is one quick pass that settles at the end instead of looping.
export const READ_PACES = [
  { key: 'slower', label: 'Slower' },
  { key: 'normal', label: 'Normal' },
  { key: 'faster', label: 'Faster' },
  { key: 'skim', label: 'Skim' },
];

export const PACE_SCALE = { slower: 1.6, normal: 1, faster: 0.55, skim: 0.25 };

const Key = ({ onClick, disabled, label, children, primary }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`flex items-center justify-center rounded-full transition-colors disabled:opacity-25 ${
      primary ? 'h-10 w-10' : 'h-9 w-9 hover:bg-white/10'
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

// The transport for the record.
//
// The same pages the book prints, played: the measure across the top is the whole
// record — a segment a page, the copper on the spread being read — and it is also
// the way to any page, so a reader can leap rather than turn. Under it: the front,
// the turn, play, and the contents.
export default function BookTransport({
  labels = [],
  index = 0,
  visibleCount = 1,
  playing = false,
  onFirst,
  onPrev,
  onNext,
  onTogglePlay,
  onJump,
  onContents,
  pace = 'normal',
  onPace,
}) {
  const pageCount = labels.length;
  if (!pageCount) return null;

  const percent = Math.max(
    0,
    Math.min(100, Math.round(((index + visibleCount) / pageCount) * 100))
  );

  return (
    <div
      className="px-3 pb-2 pt-1.5 sm:px-8 sm:pb-2.5 sm:pt-2"
      style={{ borderTop: '1px solid rgba(201,168,124,0.18)' }}
    >
      {/* How far through the record the reader is, as one running measure */}
      <div className="mb-2 flex items-center gap-2.5">
        <div
          role="progressbar"
          aria-label="Progress through the record"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-[3px] flex-1 overflow-hidden rounded-full"
          style={{ background: 'rgba(250,248,245,0.14)' }}
        >
          <span
            className="block h-full rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${COPPER}, ${GOLD})`,
            }}
          />
        </div>
        <span
          className="font-body text-[9px] font-semibold tabular-nums tracking-[0.16em]"
          style={{ color: 'rgba(250,248,245,0.48)' }}
        >
          {percent}%
        </span>
      </div>

      <div className="mb-2 flex items-center gap-1" role="group" aria-label="Jump to a page">
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
              className="h-1.5 flex-1 rounded-full transition-colors hover:opacity-80"
              style={{
                background: current
                  ? COPPER
                  : read
                    ? 'rgba(201,168,124,0.55)'
                    : 'rgba(250,248,245,0.16)',
                boxShadow: current ? `0 0 8px ${COPPER}` : 'none',
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-0.5">
        <Key onClick={onFirst} disabled={index <= 0} label="Back to the cover">
          <ChevronsLeft className="h-4 w-4" />
        </Key>
        <Key onClick={onPrev} disabled={index <= 0} label="Previous page">
          <ChevronLeft className="h-5 w-5" />
        </Key>

        <Key
          onClick={onTogglePlay}
          label={playing ? 'Pause the record' : 'Play the record'}
          primary
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Key>

        <span
          className="px-2 text-[13px] tabular-nums"
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

        <Key onClick={onNext} disabled={index >= pageCount - 1} label="Next page">
          <ChevronRight className="h-5 w-5" />
        </Key>

        <button
          type="button"
          onClick={onContents}
          className="ml-1.5 flex items-center gap-1.5 rounded-full px-2.5 py-2 font-body text-[9px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.62)' }}
        >
          <List className="h-3.5 w-3.5" style={{ color: GOLD }} />
          Contents
        </button>
      </div>

      {/* Pace: three speeds of the same reading, and skim for a quick pass */}
      <div
        className="mt-1.5 flex items-center justify-center gap-0.5"
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
              className="rounded-full px-2.5 py-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] transition-colors"
              style={
                active
                  ? { background: 'rgba(184,115,51,0.22)', border: `1px solid rgba(184,115,51,0.75)`, color: GOLD }
                  : { border: '1px solid rgba(250,248,245,0.14)', color: 'rgba(250,248,245,0.52)' }
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
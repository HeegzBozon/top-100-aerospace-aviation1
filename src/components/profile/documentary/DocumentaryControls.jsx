import { BookOpen, ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';

// The transport. Nothing moves on its own: every advance is a press, and the
// rail doubles as the chapter index so a visitor can cut straight to any chapter.
export default function DocumentaryControls({
  chapters,
  index,
  playing,
  canPlay,
  voiceOn,
  onJump,
  onPrev,
  onNext,
  onTogglePlay,
  onToggleVoice,
  onSwitchToRead,
}) {
  const atEnd = index >= chapters.length - 1;

  return (
    <div className="border-t border-editorial-gold/20 bg-[#0d1b2b]">
      <div className="flex items-stretch gap-1 px-4 pt-3">
        {chapters.map((chapter, i) => (
          <button
            key={chapter.key}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Chapter ${chapter.number}: ${chapter.label}`}
            aria-current={i === index ? 'true' : undefined}
            title={`${chapter.number} · ${chapter.label}`}
            className={`group h-7 flex-1 border-t-2 pt-0 transition-colors ${
              i === index
                ? 'border-editorial-copper'
                : i < index
                  ? 'border-editorial-gold/50 hover:border-editorial-gold'
                  : 'border-editorial-cream/15 hover:border-editorial-cream/40'
            }`}
          >
            <span className="sr-only">{chapter.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            aria-label="Previous chapter"
            className="doc-key"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!canPlay}
            aria-label={playing ? 'Pause the film' : 'Play the film'}
            className="doc-key-primary"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={atEnd}
            aria-label="Next chapter"
            className="doc-key"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.24em] text-editorial-cream/55">
          {`Chapter ${chapters[index]?.number} of ${String(chapters.length).padStart(2, '0')}`} · {chapters[index]?.label}
        </p>

        <div className="ml-auto flex items-center gap-1">
          {canPlay && (
            <button
              type="button"
              onClick={onToggleVoice}
              aria-pressed={voiceOn}
              className="doc-key gap-2 px-3"
              title={voiceOn ? 'Narration on' : 'Narration off'}
            >
              {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="font-body text-[9.5px] font-semibold uppercase tracking-[0.2em]">
                Narration
              </span>
            </button>
          )}

          <button type="button" onClick={onSwitchToRead} className="doc-key gap-2 px-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-body text-[9.5px] font-semibold uppercase tracking-[0.2em]">
              Read instead
            </span>
          </button>
        </div>
      </div>

      {!canPlay && (
        <p className="border-t border-editorial-gold/15 px-4 py-2 font-body text-[10.5px] leading-relaxed text-editorial-cream/45">
          Spoken narration is not available in this browser. The film is fully captioned — step through
          it with the arrows.
        </p>
      )}
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowLeft, Settings2 } from 'lucide-react';

// Editorial glass pill that floats above the HomeDock. Houses exit, slide
// navigation, play-pause, and a serif slide counter. Matches the dock's
// material language — dark glass, gold accent — so the two pills read as
// a coordinated pair rather than competing bars.
export default function DeckControls({ current, total, playing, accent, label, onPrev, onNext, onTogglePlay, isOwner, onOpenPresentation }) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] px-4">
      <div
        className="flex items-center gap-1 rounded-full px-2 py-2 shadow-2xl"
        style={{ background: 'rgba(7,17,31,0.92)', border: '1px solid rgba(201,168,124,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Exit / Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all hover:bg-white/10"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          aria-label="Exit deck"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        <Divider />

        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105"
          style={{ background: accent, color: '#07111f' }}
          aria-label={playing ? 'Pause autoplay' : 'Start autoplay'}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={current >= total - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: 'rgba(255,255,255,0.8)' }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <Divider />

        {/* Counter + label */}
        <div className="flex items-center gap-2.5 px-1.5">
          <span
            className="text-sm tabular-nums"
            style={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {String(current + 1).padStart(2, '0')}
            <span style={{ color: 'rgba(255,255,255,0.35)' }}> / {String(total).padStart(2, '0')}</span>
          </span>
          <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {label}
          </span>
        </div>

        {/* Presentation settings — owner only */}
        {isOwner && onOpenPresentation && (
          <>
            <Divider />
            <button
              onClick={onOpenPresentation}
              className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold uppercase tracking-[0.14em] transition-all hover:bg-white/10"
              style={{ color: '#c9a87c' }}
              aria-label="Presentation settings"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Presentation</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-6 w-px bg-white/15" />;
}
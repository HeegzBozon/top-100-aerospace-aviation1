import { ChevronLeft, ChevronRight, Play, Pause, Settings2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Minimal editorial control bar. Thin sand-toned strip with glyph controls
// and a serif slide counter. Not a chunky media-player chrome.
export default function DeckControls({ current, total, playing, accent, label, onPrev, onNext, onTogglePlay, isOwner, onOpenPresentation }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: `linear-gradient(180deg, transparent 0%, ${B.navyDeep}E6 40%, ${B.navyDeep} 100%)` }}
    >
      <div className="max-w-2xl mx-auto px-6 pb-6 pt-10 flex items-center justify-center gap-5">
        <button
          onClick={onPrev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: B.cream, border: `1px solid ${B.cream}22` }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: accent, color: B.navyDeep }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={onNext}
          disabled={current >= total - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: B.cream, border: `1px solid ${B.cream}22` }}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 ml-2">
          <span
            className="text-sm tabular-nums"
            style={{ color: B.cream, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {String(current + 1).padStart(2, '0')} <span style={{ color: `${B.cream}55` }}>/ {String(total).padStart(2, '0')}</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: `${B.cream}88` }}>
            {label}
          </span>
        </div>

        {isOwner && onOpenPresentation && (
          <button
            onClick={onOpenPresentation}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
            style={{ color: B.cream, border: `1px solid ${B.cream}22` }}
          >
            <Settings2 className="w-3.5 h-3.5" /> Presentation
          </button>
        )}
      </div>
    </div>
  );
}
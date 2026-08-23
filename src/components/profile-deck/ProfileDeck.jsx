import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Settings2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { slideLabel } from './slideDeckConfig';
import DeckControls from './DeckControls';

// The profile IS the deck. Full-bleed slides fill the viewport; a fixed
// control bar at the bottom drives prev / play-pause / next. Autoplay
// honors the Fellow's configured mode (loop | stop_at_end | manual) and
// dwell seconds. Keyboard: ArrowLeft/ArrowRight navigate, Space toggles play.
export default function ProfileDeck({ slides, settings, accent, isOwner, onOpenPresentation }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = slides.length;

  const autoplayMode = settings?.autoplay_mode || 'manual';
  const dwell = Math.max(3, settings?.dwell_seconds || 6);

  const goNext = useCallback(() => {
    setCurrent((c) => {
      if (c + 1 >= total) return autoplayMode === 'loop' ? 0 : c;
      return c + 1;
    });
  }, [total, autoplayMode]);

  const goPrev = useCallback(() => {
    setPlaying(false);
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const togglePlay = useCallback(() => {
    // If at the end and not looping, restart from the beginning on play
    if (current >= total - 1 && autoplayMode !== 'loop') {
      setCurrent(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [current, total, autoplayMode]);

  // Autoplay timer — advances after dwell seconds
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (autoplayMode === 'stop_at_end' && current + 1 >= total) {
        setPlaying(false);
      } else if (autoplayMode === 'loop' && current + 1 >= total) {
        setCurrent(0);
      } else {
        setCurrent((c) => Math.min(c + 1, total - 1));
      }
    }, dwell * 1000);
    return () => clearTimeout(timer);
  }, [playing, current, dwell, autoplayMode, total]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, togglePlay]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <div className="relative min-h-screen" style={{ background: B.navyDeep }}>
      <div key={current} className="deck-slide-enter min-h-screen">
        {slide.content}
      </div>

      <DeckControls
        current={current}
        total={total}
        playing={playing}
        accent={accent}
        label={slide.label}
        onPrev={goPrev}
        onNext={goNext}
        onTogglePlay={togglePlay}
        isOwner={isOwner}
        onOpenPresentation={onOpenPresentation}
      />
    </div>
  );
}
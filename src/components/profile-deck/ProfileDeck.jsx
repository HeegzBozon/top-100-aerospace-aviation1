import { useState, useEffect, useCallback, useMemo } from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { FIRST_PASS_DWELL, SECOND_PASS_DWELL } from './slideDeckConfig';
import DeckControls from './DeckControls';

// The profile IS the deck. Full-bleed slides fill the viewport; a fixed
// control bar at the bottom drives prev / play-pause / next. Autoplay
// honors the Fellow's configured mode (loop | stop_at_end | manual) and
// dwell seconds. Keyboard: ArrowLeft/ArrowRight navigate, Space toggles play.
export default function ProfileDeck({ slides, settings, accent, isOwner, onOpenPresentation }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pass, setPass] = useState(0);
  const total = slides.length;

  // Autoplay loops by default. The first pass runs fast (hook the viewer),
  // the second pass slows down (let them read), and every pass after that
  // uses the Fellow's configured dwell — settling into a gentle rhythm.
  const autoplayMode = settings?.autoplay_mode || 'loop';
  const configuredDwell = Math.max(3, settings?.dwell_seconds || 6);
  const dwell = useMemo(() => {
    if (pass === 0) return Math.max(3, FIRST_PASS_DWELL);
    if (pass === 1) return Math.max(3, SECOND_PASS_DWELL);
    return configuredDwell;
  }, [pass, configuredDwell]);

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

  // Autoplay timer — advances after dwell seconds, which varies by pass.
  // Pass 0 = fast hook, pass 1 = slower read, pass 2+ = configured dwell.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (current + 1 >= total) {
        if (autoplayMode === 'loop') {
          setPass((p) => p + 1);
          setCurrent(0);
        } else {
          setPlaying(false);
        }
      } else {
        setCurrent((c) => c + 1);
      }
    }, dwell * 1000);
    return () => clearTimeout(timer);
  }, [playing, current, dwell, autoplayMode, total]);

  // Keyboard navigation — arrows navigate, space toggles play
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

  // Pause autoplay when the tab is hidden — don't burn cycles in the background
  useEffect(() => {
    const handler = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

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
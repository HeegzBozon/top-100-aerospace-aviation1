import { useState, useEffect, useRef } from 'react';

// Narrated pacing: compute how long each page should dwell.
// Text-heavy pages linger so the reader (and screen recorder) can absorb them;
// visual pages move briskly to keep the film flowing.
export function computePageDwell(page) {
  if (!page) return 4000;
  const blocks = page.content_blocks || [];
  const layout = page.layout_type;

  switch (layout) {
    case 'cover':           return 5000;
    case 'chapter_divider': return 3500;
    case 'colophon':        return 4500;
    case 'masthead':        return 5500;
    case 'pull_quote':      return 6500;
    case 'feature_spread':  return 5500;
    case 'profile':         return 7000;
    default: break;
  }

  // Article pages — scale with reading density (~180 wpm, slow and cinematic)
  let dwell = 3500;
  for (const b of blocks) {
    if (b.type === 'body') {
      const words = (b.text || '').split(/\s+/).filter(Boolean).length;
      dwell += words * 320;
    } else if (b.type === 'heading') {
      dwell += 700;
    } else if (b.type === 'pull_quote') {
      dwell += 2000;
    } else if (b.type === 'kicker') {
      dwell += 400;
    } else if (b.type === 'byline') {
      dwell += 300;
    }
  }
  return Math.min(dwell, 16000);
}

export const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

/**
 * Cinematic autoplay hook. Drives a single `goNext` callback on a per-page
 * dwell timer, with a smooth 0→1 progress value for the progress bar.
 *
 * @param {Object}   opts
 * @param {number}   opts.currentPageIndex — the page currently displayed
 * @param {number}   opts.totalPages      — total page count
 * @param {Function} opts.goNext          — advance one page
 * @param {Array}    opts.pages           — page records (for pacing)
 * @param {boolean}  opts.isPlaying       — whether autoplay is active
 * @param {number}   opts.speed           — playback speed multiplier
 * @returns {{ progress: number, dwellMs: number }}
 */
export function useCinematicPlayback({ currentPageIndex, totalPages, goNext, pages, isPlaying, speed }) {
  const [progress, setProgress] = useState(0);
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  const page = pages?.[currentPageIndex];
  const baseDwell = computePageDwell(page);
  const adjustedDwell = baseDwell / (speed || 1);

  useEffect(() => {
    setProgress(0);

    // Stop at the end — don't loop
    if (!isPlaying || currentPageIndex >= totalPages - 1) {
      return;
    }

    const start = Date.now();
    let raf;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / adjustedDwell, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Advance to the next page — the parent state change re-runs this effect
        goNextRef.current?.();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [isPlaying, currentPageIndex, adjustedDwell, totalPages]);

  return { progress, dwellMs: adjustedDwell };
}
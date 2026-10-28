import { useState, useEffect, useRef } from 'react';

// How long a page is held, so a film of the issue can be read rather than watched.
//
// Every page is held for the time its own words take at an average reading pace, on top
// of the beat its kind of page deserves — a cover needs a look, a divider needs less. A
// page that runs past the frame is rolled under the reader in that time (see
// usePageTeleprompter) rather than held still, which is what makes the pace honest.
const READ_MS_PER_WORD = 260; // ≈ 230 words a minute
const MAX_DWELL = 90000;      // a very long page still turns

const BASE_DWELL = {
  cover: 5000,
  chapter_divider: 3500,
  colophon: 4500,
  masthead: 5500,
  pull_quote: 6500,
  feature_spread: 5500,
  profile: 5500,
  toc: 5000,
};

const wordsIn = (text) => (text || '').split(/\s+/).filter(Boolean).length;

export function computePageDwell(page) {
  if (!page) return 4000;
  const blocks = page.content_blocks || [];
  let dwell = BASE_DWELL[page.layout_type] || 3500;

  for (const b of blocks) {
    switch (b.type) {
      case 'body':       dwell += wordsIn(b.text) * READ_MS_PER_WORD + 600; break;
      case 'pull_quote': dwell += wordsIn(b.text) * READ_MS_PER_WORD + 1000; break;
      case 'heading':    dwell += 800; break;
      case 'kicker':     dwell += 400; break;
      case 'byline':     dwell += 300; break;
      default: break;
    }
  }

  return Math.min(dwell, MAX_DWELL);
}

// Skim: the issue walked through rather than read — every page held for the same short
// beat whatever it carries, so a reader can look the volume over and stop where it earns
// their time.
export const SKIM_SPEED = 'skim';
const SKIM_DWELL = 1600;

// The paces on offer, fastest last. A number is a multiplier on the reading pace; skim is
// its own setting, because it is not a pace of reading at all.
export const PLAYBACK_OPTIONS = [
  { value: 0.5, label: '0.5×' },
  { value: 1, label: '1×' },
  { value: 1.5, label: '1.5×' },
  { value: 2, label: '2×' },
  { value: 3, label: '3×' },
  { value: 4, label: '4×' },
  { value: SKIM_SPEED, label: 'Skim' },
];

export const PLAYBACK_SPEEDS = PLAYBACK_OPTIONS.map((o) => o.value);

export const speedLabel = (speed) =>
  PLAYBACK_OPTIONS.find((o) => o.value === speed)?.label ?? `${speed}×`;

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
  // A skimmed page is not read, so it is not held for its words: one short beat each.
  const adjustedDwell = speed === SKIM_SPEED ? SKIM_DWELL : baseDwell / (speed || 1);

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
import { useState, useEffect, useMemo, useRef } from 'react';

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

// Timed: the issue played in a set length, rather than at a set pace.
//
// A reader who says "give me this book in a minute" is not asking for a faster skim — a
// metronome flicking every page for the same beat, which reads as neither film nor book. They
// are asking for the whole issue to land inside a known time, which means the pages are given
// unequal time on purpose: a cover is allowed to hold, a divider is allowed to snap past, a
// dense spread breathes a beat longer than a bare one. That unevenness is the rhythm, and it
// is reckoned from the book itself, so the same minute plays the same way twice.
export const TIME_PREFIX = 'time-';
export const TIME_PRESETS = [30, 45, 60, 90];
const TIME_MIN = 15;              // a whole issue cannot be told in less
const TIME_MAX = 3600;
// However tight the budget, a page is held long enough to register as a page rather than a
// flicker — so a very short run simply takes the time it needs.
const MIN_TIMED_DWELL = 700;

// How much of the run each kind of page is allowed to weigh.
const TYPE_WEIGHT = {
  cover: 2.6,
  masthead: 1.3,
  toc: 1.1,
  chapter_divider: 0.55,
  pull_quote: 1.2,
  feature_spread: 1.4,
  profile: 1.15,
  colophon: 1.1,
  back_cover: 0.9,
};

export const isTimedSpeed = (speed) => typeof speed === 'string' && speed.startsWith(TIME_PREFIX);

export const timedSeconds = (speed) =>
  (isTimedSpeed(speed) ? Math.round(Number(speed.slice(TIME_PREFIX.length))) || 0 : 0);

export const timedSpeed = (seconds) =>
  `${TIME_PREFIX}${Math.min(TIME_MAX, Math.max(TIME_MIN, Math.round(Number(seconds) || 0)))}`;

// A page's share of a timed run: its kind, and how much there is to read once the page is
// open — a long spread is given more of the minute than a plate of portraits.
export function pageWeight(page) {
  if (!page) return 1;
  const base = TYPE_WEIGHT[page.layout_type] ?? 1;
  const words = (page.content_blocks || []).reduce((count, block) => count + wordsIn(block.text), 0);
  return base * (1 + Math.min(words, 600) / 1400);
}

// The beats a timed run hands out, one per page — the timeline a timed issue is played on.
export function timelineDwells(pages, seconds) {
  const list = pages || [];
  if (!list.length) return [];
  const weights = list.map(pageWeight);
  const total = weights.reduce((sum, weight) => sum + weight, 0) || list.length;
  const budget = Math.max(Number(seconds) || 0, 0) * 1000;
  return weights.map((weight) => Math.max(MIN_TIMED_DWELL, (budget * weight) / total));
}

export const speedLabel = (speed) => {
  if (isTimedSpeed(speed)) return `${timedSeconds(speed)}s`;
  return PLAYBACK_OPTIONS.find((o) => o.value === speed)?.label ?? `${speed}×`;
};

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
  const timed = isTimedSpeed(speed);
  const timeline = useMemo(
    () => (timed ? timelineDwells(pages, timedSeconds(speed)) : null),
    [timed, speed, pages],
  );
  // A timed run gives each page the beat the timeline hands it; a skimmed page is not read, so
  // it is not held for its words either — one short beat each.
  const adjustedDwell = timed
    ? (timeline?.[currentPageIndex] ?? MIN_TIMED_DWELL)
    : speed === SKIM_SPEED
      ? SKIM_DWELL
      : baseDwell / (speed || 1);

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
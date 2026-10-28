import { useCallback, useEffect, useRef, useState } from 'react';

// The roll, when a page is read.
//
// A page is read, not flashed: when it runs past the frame, the page itself rolls under
// the reader at reading pace and comes to rest on its last line rather than waiting for a
// hand. Two things drive that roll, and only ever one at a time:
//
//   • while the film is playing, the film's own progress drives it — the same value that
//     fills the rule on the glass — so the page and the rule can never disagree, and the
//     speed selector changes both together;
//   • read by hand, the page walks itself as a teleprompter does, at an average reading
//     pace taken from the words on the page. A hand on the page takes the roll back.
//
// The attribute is how the page's own head finds the thing that scrolls it, so the head
// can tell when it has been pinned (see PinnedPageHead).
export const PAGE_SCROLL_ATTR = 'data-page-scroll';

// The roll while the film holds the page spends the first 88% of the hold; the rest is
// the beat spent on the last line.
const ROLL_PORTION = 0.88;

// Average reading pace for the self-driven roll — the pace the film's dwell is reckoned
// from as well, so a page walks at the speed it is meant to be read at either way.
const WORDS_PER_MINUTE = 230;
const MIN_ROLL_MS = 9000;

const wordsInPage = (el) => (el?.textContent || '').trim().split(/\s+/).filter(Boolean).length;

export function usePageTeleprompter({ playing, progress, pageKey, autoscroll = false }) {
  const ref = useRef(null);
  const [overflow, setOverflow] = useState(0);
  // The hand wins: a reader who scrolls the page themselves stops the teleprompter for
  // that page, and it is handed back when they turn to another one.
  const [handled, setHandled] = useState(false);

  // How far the page runs past its frame — reckoned again whenever the page is laid out
  // or a picture lands in it, so a portrait that loads late still counts.
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setOverflow(Math.max(el.scrollHeight - el.clientHeight, 0));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [measure, pageKey]);

  // A page opens at its head, whoever turned to it, and answers to the hand again.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = 0;
    setHandled(false);
  }, [pageKey]);

  // The film's roll, and only while the film is playing: its progress is the page's place.
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing || overflow <= 0) return;
    const rolled = Math.min(Math.max(progress || 0, 0) / ROLL_PORTION, 1);
    el.scrollTop = rolled * overflow;
  }, [playing, progress, overflow, pageKey]);

  // The teleprompter, for a page read by hand: it walks from where the page is now to its
  // last line in the time the words on it take at an average reading pace.
  useEffect(() => {
    const el = ref.current;
    if (!el || !autoscroll || playing || handled || overflow <= 0) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const words = wordsInPage(el);
    if (words < 40) return undefined;
    const duration = Math.max((words / WORDS_PER_MINUTE) * 60000, MIN_ROLL_MS);
    const from = Math.min(el.scrollTop, overflow);
    const start = Date.now();
    let raf;

    const tick = () => {
      const part = Math.min((Date.now() - start) / duration, 1);
      el.scrollTop = from + part * (overflow - from);
      if (part < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const yieldToHand = () => setHandled(true);
    el.addEventListener('wheel', yieldToHand, { passive: true });
    el.addEventListener('touchstart', yieldToHand, { passive: true });
    el.addEventListener('pointerdown', yieldToHand);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('wheel', yieldToHand);
      el.removeEventListener('touchstart', yieldToHand);
      el.removeEventListener('pointerdown', yieldToHand);
    };
  }, [autoscroll, playing, handled, overflow, pageKey]);

  return { ref, overflow };
}
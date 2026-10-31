import { useCallback, useEffect, useRef, useState } from 'react';

// The roll, when a page is read.
//
// A page is read, not flashed: when it runs past the frame, the page itself rolls under
// the reader at reading pace and comes to rest on its last line rather than waiting for a
// hand. The roll keeps its own clock — the words on the page at an average reading pace —
// so it runs whether the issue is playing as a film or being read by hand, and the film's
// speed multiplier scales it with the pace the pages are turning at. A hand on the page
// takes the roll back for that page.
//
// The attribute is how the page's own head finds the thing that scrolls it, so the head
// can tell when it has been pinned (see PinnedPageHead).
export const PAGE_SCROLL_ATTR = 'data-page-scroll';

// Average reading pace — the same pace the film's dwell is reckoned from, so a page walks
// at the speed it is meant to be read at, whether the film is running or not.
const WORDS_PER_MINUTE = 230;
const MIN_ROLL_MS = 9000;

const wordsInPage = (el) => (el?.textContent || '').trim().split(/\s+/).filter(Boolean).length;

export function usePageTeleprompter({ pageKey, autoscroll = false, playing = false, speed = 1, paused = false }) {
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

  // The roll: from where the page stands now to its last line, in the time its words take.
  // It restarts whenever the film starts or stops, so a resumed page picks up where the
  // reading left off rather than jumping back to its head.
  useEffect(() => {
    const el = ref.current;
    // A page put on hold keeps its place: the roll stands exactly where it was left, and
    // picks up from there when the reader hands it back.
    if (!el || !autoscroll || handled || paused || overflow <= 0) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const words = wordsInPage(el);
    if (words < 40) return undefined;

    const pace = speed > 0 ? speed : 1;
    const duration = Math.max((words / WORDS_PER_MINUTE) * 60000, MIN_ROLL_MS) / pace;
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
  }, [autoscroll, playing, speed, handled, overflow, pageKey, paused]);

  return { ref, overflow };
}
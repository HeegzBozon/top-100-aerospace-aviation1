import { useCallback, useEffect, useRef, useState } from 'react';

// The roll, when a page is played as film.
//
// A page is read, not flashed: when it runs past the frame, the page itself rolls under
// the reader at reading pace while the film holds it, and comes to rest on its last line
// a beat before the turn. The roll is driven by the film's own progress — the same value
// that fills the rule on the glass — so the page and the rule can never disagree about
// where the reading is.
//
// The attribute is how the page's own head finds the thing that scrolls it, so the head
// can tell when it has been pinned (see PinnedPageHead).
export const PAGE_SCROLL_ATTR = 'data-page-scroll';

// The roll spends the first 88% of the hold; the rest is the beat spent on the last line.
const ROLL_PORTION = 0.88;

export function usePageTeleprompter({ playing, progress, pageKey }) {
  const ref = useRef(null);
  const [overflow, setOverflow] = useState(0);

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

  // A page opens at its head, whoever turned to it.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = 0;
  }, [pageKey]);

  // The roll itself, and only while the film is playing: a page at rest belongs to the
  // hand holding the glass.
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing || overflow <= 0) return;
    const rolled = Math.min(Math.max(progress || 0, 0) / ROLL_PORTION, 1);
    el.scrollTop = rolled * overflow;
  }, [playing, progress, overflow, pageKey]);

  return { ref, overflow };
}
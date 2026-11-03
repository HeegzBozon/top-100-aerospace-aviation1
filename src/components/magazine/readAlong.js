import { useCallback, useEffect, useRef, useState } from 'react';

// Read along: the page read at the pace it is held for.
//
// Skim walks an issue fast and stops where a page earns the time. Reading pace holds each
// page for the words it carries (see useCinematicPlayback), and this is that same clock
// pointed at the type: the paragraph under the reader takes one word at its time, so a
// reader following it never loses their place and never has to guess how much of the page
// is left.
//
// Only editorial body copy is paced — the paragraphs the page's dwell is already reckoned
// from, marked with data-read-along. Covers, plates, dividers and the page's own keys carry
// nothing to follow, so they show no cursor and keep the behaviour they had.
//
// One page at a time: the hook is switched on only for the page being read. Every other
// page on the glass — the other half of a spread, a page held out of the film — is left
// exactly as it was, with no mark, no clock and nothing rolling it.
export const READ_ALONG_ATTR = 'data-read-along';

const MS_PER_WORD = 260;      // ≈ 230 words a minute, the pace a page is held at
const SENTENCE_HOLD = 1.9;    // a word that closes a sentence is held a beat longer
const PARAGRAPH_HOLD = 1.25;  // ...and the last word of a paragraph a little longer again

// The reading band: the strip of the frame the cursor keeps itself in, so the eye is never
// sent hunting up and down the page for the word being read.
const BAND_IN = 0.28;
const BAND_OUT = 0.62;
const BAND_AT = 0.38;

const endsSentence = (word) => /[.!?…:;]["'”’)\]]?$/.test(word);

// Every word on the page, in the order it is read, as an offset into the text node it sits
// in. Nothing is rewritten in the DOM: the mark is drawn over the type, never into it, so
// the set text stays exactly as it was composed.
function wordsOf(container) {
  const words = [];
  container.querySelectorAll(`[${READ_ALONG_ATTR}]`).forEach((block) => {
    const found = [];
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue || '';
      const pattern = /\S+/g;
      let match;
      while ((match = pattern.exec(text))) {
        found.push({ node, start: match.index, end: match.index + match[0].length, word: match[0] });
      }
    }
    if (!found.length) return;
    found[found.length - 1].paragraphEnd = true;
    words.push(...found);
  });
  return words;
}

// Where a word is set, in the page's own coordinates — the same ones the scroller moves by,
// so the mark stays on its word however far the page has rolled.
function boxOf(container, word) {
  if (!word?.node?.isConnected) return null;
  try {
    const range = document.createRange();
    range.setStart(word.node, word.start);
    range.setEnd(word.node, word.end);
    const box = range.getBoundingClientRect();
    if (!box.width && !box.height) return null;
    const frame = container.getBoundingClientRect();
    // A page is composed at one design size and drawn scaled to the frame it is given (see
    // FlipPage), so a word's rect is in the drawn size while the scroller counts in the
    // composed one. Dividing by the ratio it was drawn at puts the mark back where the word
    // actually sits, at the size the word actually is.
    const scale = container.offsetWidth ? frame.width / container.offsetWidth : 1;
    const at = scale || 1;
    return {
      top: (box.top - frame.top - container.clientTop * at) / at + container.scrollTop,
      left: (box.left - frame.left - container.clientLeft * at) / at + container.scrollLeft,
      width: box.width / at,
      height: box.height / at,
    };
  } catch {
    return null;
  }
}

export function useReadAlong({
  containerRef,
  pageKey,
  enabled = false,
  playing = false,
  paused = false,
  speed = 1,
}) {
  const [index, setIndex] = useState(0);
  const [cursor, setCursor] = useState(null);
  // A hand on the page holds the cursor where it stands; a tap on a word gives it back.
  const [yielded, setYielded] = useState(false);
  const wordsRef = useRef([]);
  const pace = typeof speed === 'number' && speed > 0 ? speed : 1;

  // Collect the page's copy when the page becomes the one being read, and let go of it the
  // moment the film moves on: a page that is not being read holds no mark at all.
  useEffect(() => {
    const el = containerRef.current;
    wordsRef.current = el && enabled ? wordsOf(el) : [];
    setIndex(0);
    setYielded(false);
    if (!wordsRef.current.length) setCursor(null);
    // The mark is laid on the page rather than in its flow, so the page is the frame it is
    // placed in.
    if (el && enabled && window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
  }, [containerRef, enabled, pageKey]);

  // Find the word, put the mark on it, and keep it in the band.
  useEffect(() => {
    const el = containerRef.current;
    const words = wordsRef.current;
    if (!el || !enabled || !words.length) {
      setCursor(null);
      return;
    }
    const at = Math.min(index, words.length - 1);
    const box = boxOf(el, words[at]);
    if (!box) {
      setCursor(null);
      return;
    }
    setCursor({ ...box, at: at + 1, total: words.length });
    // The page is drawn after the word — the only thing allowed to roll a page while it is
    // being read, so the roll it had is stood down for as long as the mark is on it.
    const band = el.clientHeight;
    if (!band) return;
    const fromTop = box.top - el.scrollTop;
    if (fromTop < band * BAND_IN || fromTop + box.height > band * BAND_OUT) {
      el.scrollTop = Math.max(box.top - band * BAND_AT, 0);
    }
  }, [containerRef, enabled, index, pageKey]);

  // The clock: one word at its time, with the held beats a reader takes anyway.
  useEffect(() => {
    if (!enabled || !playing || paused || yielded) return undefined;
    const words = wordsRef.current;
    if (!words.length || index >= words.length - 1) return undefined;
    const word = words[index];
    const hold = endsSentence(word.word) ? SENTENCE_HOLD : word.paragraphEnd ? PARAGRAPH_HOLD : 1;
    const timer = window.setTimeout(
      () => setIndex((at) => Math.min(at + 1, wordsRef.current.length - 1)),
      (MS_PER_WORD * hold) / pace,
    );
    return () => window.clearTimeout(timer);
  }, [enabled, playing, paused, yielded, index, pace, pageKey]);

  // A hand on the page takes the cursor for that page and holds it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return undefined;
    const hand = () => setYielded(true);
    el.addEventListener('wheel', hand, { passive: true });
    el.addEventListener('touchstart', hand, { passive: true });
    return () => {
      el.removeEventListener('wheel', hand);
      el.removeEventListener('touchstart', hand);
    };
  }, [containerRef, enabled]);

  // Tap a word: the page is read on from there.
  const resumeAt = useCallback((x, y) => {
    const el = containerRef.current;
    const words = wordsRef.current;
    if (!el || !words.length) return;
    const frame = el.getBoundingClientRect();
    const scale = el.offsetWidth ? frame.width / el.offsetWidth : 1;
    const at = scale || 1;
    const px = (x - frame.left - el.clientLeft * at) / at + el.scrollLeft;
    const py = (y - frame.top - el.clientTop * at) / at + el.scrollTop;
    let best = 0;
    let nearest = Infinity;
    words.forEach((word, i) => {
      const box = boxOf(el, word);
      if (!box) return;
      const y2 = py < box.top ? box.top - py : py > box.top + box.height ? py - (box.top + box.height) : 0;
      const x2 = px < box.left ? box.left - px : px > box.left + box.width ? px - (box.left + box.width) : 0;
      const away = y2 * 1000 + x2;
      if (away < nearest) {
        nearest = away;
        best = i;
      }
    });
    setIndex(best);
    setYielded(false);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return undefined;
    const onTap = (event) => {
      if (!event.target.closest?.(`[${READ_ALONG_ATTR}]`)) return;
      // A printed link is followed, not paced.
      if (event.target.closest('a')) return;
      event.preventDefault();
      event.stopPropagation();
      resumeAt(event.clientX, event.clientY);
    };
    el.addEventListener('click', onTap, true);
    return () => el.removeEventListener('click', onTap, true);
  }, [containerRef, enabled, resumeAt]);

  return { cursor };
}
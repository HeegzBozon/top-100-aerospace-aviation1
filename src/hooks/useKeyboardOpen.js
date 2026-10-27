import { useEffect, useState } from "react";

// Is the on-screen keyboard up on a phone, and how much of the picture is it holding?
//
// The keys are the one thing that stands where the console's controls stand, so
// they are measured rather than guessed at: the visual viewport is the only place
// a keyboard reports itself, and the tallest that viewport has stood on this screen
// is what the keys are being read against. On a browser that shrinks the layout
// viewport along with the keys (Android, when it chooses to), the difference is nil
// and nothing needs standing aside — the whole picture has already moved up with
// them, chin and all.
const GLASS = "(max-width: 767px)";
const KEYBOARD_MIN = 120; // px of picture held before this counts as keys, not chrome

export default function useKeyboardOpen() {
  const [keyboard, setKeyboard] = useState({ open: false, height: 0 });

  useEffect(() => {
    const viewport = window.visualViewport;
    const query = window.matchMedia(GLASS);
    if (!viewport || !query.matches) return undefined;

    let tallest = viewport.height;
    let frame = 0;
    let alive = true;

    const measure = () => {
      frame = 0;
      if (!alive) return;

      const held = Math.max(0, Math.round(window.innerHeight - (viewport.height + viewport.offsetTop)));
      // Only a frame with nothing over it may lift the mark: opening and closing the
      // keys can then never ratchet the picture smaller, one press at a time.
      if (held < KEYBOARD_MIN) tallest = Math.max(tallest, viewport.height);

      const height = Math.max(held, Math.round(tallest - viewport.height));
      const open = height >= KEYBOARD_MIN;
      setKeyboard((was) => {
        const next = { open, height: open ? height : 0 };
        return was.open === next.open && was.height === next.height ? was : next;
      });
    };

    const onShift = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // A turn of the phone is a new picture: the keys are measured against the fresh
    // height, never the one the last orientation left behind.
    const onTurn = () => {
      tallest = viewport.height;
      onShift();
    };

    measure();
    viewport.addEventListener("resize", onShift);
    viewport.addEventListener("scroll", onShift);
    window.addEventListener("orientationchange", onTurn);
    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", onShift);
      viewport.removeEventListener("scroll", onShift);
      window.removeEventListener("orientationchange", onTurn);
    };
  }, []);

  return keyboard;
}
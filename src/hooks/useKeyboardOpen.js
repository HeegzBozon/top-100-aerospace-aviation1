import { useEffect, useState } from "react";

// Is the on-screen keyboard up on a phone, and how much of the picture is it holding?
//
// The keys are the one thing that stands where the console's controls stand, so
// they are measured rather than guessed at: the visual viewport is the only place a
// keyboard reports itself. On iOS the layout viewport keeps its height while the
// visual one is held down by the keys; on a browser that shrinks the layout viewport
// with them instead, the difference is nil and nothing needs standing aside — the
// whole picture has already moved up, chin and all.
const GLASS = "(max-width: 767px)";
const KEYBOARD_MIN = 120; // px of picture held before this counts as keys, not chrome

export default function useKeyboardOpen() {
  const [keyboard, setKeyboard] = useState({ open: false, height: 0 });

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport || !window.matchMedia(GLASS).matches) return undefined;

    let frame = 0;
    let alive = true;

    const measure = () => {
      frame = 0;
      if (!alive) return;

      const held = Math.max(0, Math.round(window.innerHeight - viewport.height));
      const open = held >= KEYBOARD_MIN;
      setKeyboard((was) => {
        const next = { open, height: open ? held : 0 };
        return was.open === next.open && was.height === next.height ? was : next;
      });
    };

    const onShift = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    viewport.addEventListener("resize", onShift);
    viewport.addEventListener("scroll", onShift);
    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", onShift);
      viewport.removeEventListener("scroll", onShift);
    };
  }, []);

  return keyboard;
}
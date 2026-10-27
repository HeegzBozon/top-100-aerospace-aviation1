import { useEffect, useState } from "react";

// Is the on-screen keyboard up on a phone, and how much of the picture is it holding?
//
// Two signals, because neither is always there. A field with the cursor in it is the
// one the keys were called up for, and it is what keeps the console's controls away
// from the picture whatever the frame can report. The visual viewport is where the
// keys give their own height — read from the bottom of the viewport and nothing
// added, since the height already carries the strip under them. A browser that
// shrinks the layout viewport with the keys instead reports nothing extra and needs
// nothing: the whole picture has already moved up, chin and all.
const GLASS = "(max-width: 767px)";
const KEYBOARD_MIN = 120; // px of picture held before this counts as keys, not chrome
const FIELD = "input, textarea, select, [contenteditable='true']";

const typingInto = () => {
  const active = document.activeElement;
  return !!active && !!active.matches?.(FIELD);
};

export default function useKeyboardOpen() {
  const [keyboard, setKeyboard] = useState({ open: false, height: 0 });

  useEffect(() => {
    if (!window.matchMedia(GLASS).matches) return undefined;

    const viewport = window.visualViewport;
    let frame = 0;
    let alive = true;

    const measure = () => {
      frame = 0;
      if (!alive) return;

      // A picture zoomed in on — which is what Safari does the moment a field
      // smaller than 16px takes the cursor — shortens the visual viewport exactly as
      // a keyboard does, and says nothing about the keys. Nothing is measured from
      // it: the glass keeps its height instead of reserving room for hardware that
      // is not there.
      const zoomed = viewport ? viewport.scale > 1.01 : false;
      const held =
        viewport && !zoomed ? Math.max(0, Math.round(window.innerHeight - viewport.height)) : 0;
      const open = typingInto() || held >= KEYBOARD_MIN;
      // The keys' own height where the frame can report it, capped so one bad
      // reading can never take more of the picture than the keys themselves could.
      // Where it cannot be read at all, nothing is reserved: the picture keeps its
      // height and the field is carried into view over the keys instead.
      const height =
        held >= KEYBOARD_MIN ? Math.min(held, Math.round(window.innerHeight * 0.6)) : 0;

      setKeyboard((was) => {
        const next = { open, height };
        return was.open === next.open && was.height === next.height ? was : next;
      });
    };

    const onShift = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    viewport?.addEventListener("resize", onShift);
    viewport?.addEventListener("scroll", onShift);
    document.addEventListener("focusin", onShift);
    document.addEventListener("focusout", onShift);
    window.addEventListener("resize", onShift);
    return () => {
      alive = false;
      if (frame) cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", onShift);
      viewport?.removeEventListener("scroll", onShift);
      document.removeEventListener("focusin", onShift);
      document.removeEventListener("focusout", onShift);
      window.removeEventListener("resize", onShift);
    };
  }, []);

  return keyboard;
}
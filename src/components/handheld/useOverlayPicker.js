import { useEffect, useRef } from "react";
import { registerPicker, touchPicker } from "./handheldPicker";

// A panel opened over the picture is walked by the ring.
//
// Every other picker on this machine is registered by a surface that knows its own
// options. A popover — a sheet, a menu, a form standing over the page — does not: it
// is mounted by whatever opened it, in a portal of its own, with its options built at
// run time. So the console reads it off the glass instead: the topmost open panel is
// found, its controls are collected in reading order, and the ring walks them while
// the centre presses the one under the cursor. The radio's keypad numbers the same
// list, so the key printed 3 opens the third control it can see.
//
// Nothing here knows what a control is for. A turn moves the cursor and names what it
// landed on, the centre presses it, B or MENU closes the panel — the same grammar
// every other picker on the machine answers in.
const OVERLAYS = [
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"][data-state="open"]',
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
  '[data-hh-popover="true"]',
  ".desk-sheet",
].join(",");

const CONTROLS = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const shown = (el) => {
  if (!el || !el.isConnected) return false;
  if (el.closest('[aria-hidden="true"]')) return false;
  const box = el.getBoundingClientRect();
  return box.width > 2 && box.height > 2;
};

const topOverlay = () => {
  const open = Array.from(document.querySelectorAll(OVERLAYS)).filter(shown);
  return open.length ? open[open.length - 1] : null;
};

const controlsIn = (overlay) => {
  if (!overlay) return [];
  const found = Array.from(overlay.querySelectorAll(CONTROLS)).filter(shown);
  return found.filter((el, i) => found.indexOf(el) === i);
};

const labelOf = (el) => {
  const written =
    el.getAttribute("aria-label") ||
    el.innerText ||
    el.value ||
    el.getAttribute("placeholder") ||
    el.getAttribute("title") ||
    "";
  return written.replace(/\s+/g, " ").trim().slice(0, 42) || "Option";
};

const closeTop = () => {
  // The panel is not ours to unmount, so it is asked to close the way a keyboard
  // asks: the dismissal every one of these panels already listens for.
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }),
  );
};

export default function useOverlayPicker(enabled = true) {
  const overlay = useRef(null);
  const cursor = useRef(0);
  const api = useRef(null);

  const land = (target) => {
    const list = controlsIn(overlay.current);
    if (!list.length) return null;
    const at = Math.max(0, Math.min(list.length - 1, target));
    cursor.current = at;
    const el = list[at];
    el.focus?.({ preventScroll: true });
    el.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    return labelOf(el);
  };

  const walk = (direction) => {
    const list = controlsIn(overlay.current);
    if (!list.length) return null;
    const next = cursor.current + direction;
    // The cursor law: a list stops at its ends rather than wrapping, so a turn past
    // the last control is declined and the console scrolls the glass instead.
    if (next < 0 || next >= list.length) return null;
    return land(next);
  };

  if (!api.current) {
    api.current = {
      // A panel stands over everything else, so it takes the ring outright.
      modal: true,
      labels: () => controlsIn(overlay.current).map(labelOf),
      index: () => cursor.current,
      goTo: (i) => land(i),
      step: (direction) => walk(direction),
      page: (direction) => walk(direction),
      enter: () => {
        const el = controlsIn(overlay.current)[cursor.current];
        if (!el) return false;
        el.click?.();
        return true;
      },
      back: () => {
        if (!overlay.current) return false;
        closeTop();
        return true;
      },
      // The keypad's figures: the digit printed on a control is its place in the list.
      goToCode: (digit) => {
        const at = Number(digit);
        if (!at) return null;
        return land(at - 1);
      },
    };
  }

  useEffect(() => {
    if (!enabled) return undefined;
    let unregister = null;
    let signature = "";
    let frame = 0;

    const sync = () => {
      frame = 0;
      const found = topOverlay();
      if (found !== overlay.current) {
        overlay.current = found;
        cursor.current = 0;
      }

      if (found) {
        // A finger on a control moves the cursor to it, so the ring carries on from
        // where the hand left off rather than from the top of the panel.
        const list = controlsIn(found);
        const at = list.indexOf(document.activeElement);
        if (at >= 0) cursor.current = at;

        if (!unregister) unregister = registerPicker(api.current);
        const next = list.map(labelOf).join("|");
        if (next !== signature) {
          signature = next;
          touchPicker();
        }
        return;
      }

      signature = "";
      if (unregister) {
        unregister();
        unregister = null;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    sync();
    const watcher = new MutationObserver(schedule);
    watcher.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "hidden", "aria-hidden"],
    });
    window.addEventListener("focusin", schedule);

    return () => {
      watcher.disconnect();
      window.removeEventListener("focusin", schedule);
      if (frame) cancelAnimationFrame(frame);
      if (unregister) unregister();
      overlay.current = null;
    };
  }, [enabled]);
}
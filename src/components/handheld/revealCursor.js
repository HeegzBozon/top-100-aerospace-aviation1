import { getStage } from "./useModuleNavigation";

// Bring the thing standing under the console's cursor into the picture.
//
// The glass is the scroller — the page behind the device never moves — so this works
// in the glass's own coordinates and only ever moves what the picture holds. A lit key
// is placed with a little air above and below it, so it never comes to rest flush
// against the strip across the head of the glass or the readout band at its foot, and
// a turn that lands on something already comfortably in view is left exactly where it
// is. An element taller than the opening is shown from its top, which is the end a
// reader needs first.
const AIR = 16;

export default function revealCursor(key) {
  if (!key) return;
  const stage = getStage();
  const element = document.querySelector(`[data-hh-key="${key}"]`);
  if (!stage || !element || !stage.contains(element)) return;

  const box = element.getBoundingClientRect();
  const glass = stage.getBoundingClientRect();
  const ceiling = glass.top + AIR;
  const floor = glass.bottom - AIR;

  let delta = 0;
  if (box.top < ceiling) delta = box.top - ceiling;
  else if (box.bottom > floor) delta = Math.min(box.bottom - floor, box.top - ceiling);

  if (!delta) return;

  const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  stage.scrollBy({ top: Math.round(delta), behavior: calm ? "auto" : "smooth" });
}
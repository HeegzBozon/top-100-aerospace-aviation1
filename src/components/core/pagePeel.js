// The peel. Every surface change turns the same sheet of paper: it lies over the
// old surface for a beat, then rolls back off the bottom-right corner, its lit
// edge curling ahead of the shadow it throws on the page beneath.
//
// One progress value drives all three parts, so they always move as one piece of
// stock — the shadow, the sheet, and the roll where the paper lifts.

export const PEEL_MS = 780;
export const PEEL_EASING = "cubic-bezier(0.36, 0, 0.18, 1)";

// Painted bottom to top: the cast falls on the new page, then the paper, then the
// rolled edge sitting on top of it.
export const PEEL_LAYERS = ["cast", "sheet", "curl"];

// The rolled edge and the shadow it throws, as a share of the page's side.
const BAND = 9;
const CAST = 15;

// How far the corner has rolled, at each beat of the turn: a beat of rest while
// the sheet lands, then the roll, then the tail as it leaves the frame.
const OFFSETS = [0, 0.1, 0.62, 0.88, 1];
const ROLL = [0, 0.04, 0.6, 0.88, 1];
const OPACITY = {
  cast: [1, 1, 1, 0.7, 0],
  sheet: [1, 1, 1, 1, 0],
  curl: [1, 1, 1, 0.9, 0],
};

// The corner's cut, in percent, from the bottom-right inwards.
const cut = (roll) => Math.max(0, (1 - roll) * 100);

const shape = (layer, a) => {
  if (layer === "curl") {
    return `polygon(100% ${a}%, ${a}% 100%, ${a - BAND}% 100%, 100% ${a - BAND}%)`;
  }
  if (layer === "cast") {
    return `polygon(100% ${a + CAST}%, ${a + CAST}% 100%, ${a}% 100%, 100% ${a}%)`;
  }
  return `polygon(0% 0%, 100% 0%, 100% ${a}%, ${a}% 100%, 0% 100%)`;
};

export function peelFrames(layer) {
  return OFFSETS.map((offset, i) => ({
    offset,
    clipPath: shape(layer, cut(ROLL[i])),
    opacity: OPACITY[layer][i],
  }));
}
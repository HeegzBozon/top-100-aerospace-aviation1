// The device's geometry, in one place.
//
// index.css consumes these as custom properties to inset every surface, so the
// hardware is never hidden behind content — and because the console and the
// loading chassis apply the same numbers, the picture never shifts as the console
// takes over from a load.
//
// Above the glass, on the case itself: the shell's top edge, then the moulding —
// and the picture opens below both. Nothing is printed on the case, so the device
// starts at the same slim margin as its sides and the glass opens as high as the
// hardware allows: every pixel the old band held is the picture's now.
const FRAME_GUTTER = 14; // the desk margin: how much surface shows around the shell
const BEZEL_WIDTH = 18; // the moulding drawn back out around the glass

// Inside the glass: the strip cut across its head, and the air it leaves under it.
const NAV_CLEARANCE = 34;

// Inside the glass, at its foot: the readout band — the cycle's stamp and the Share
// pill. It is taken from the picture's own bottom edge rather than added below it, so
// the pane keeps its full width and everything that lives on the picture is inset
// above the band instead of running under it.
const FOOT_CLEARANCE = 32;

// Below the glass: the chin, carrying the wheel, the keys, the speaker and the plate.
// The chin is three bands: the controls (the wheel's own height, which out-measures
// both the key cluster and the speaker), the groove under them, and the footer plate —
// under which the case runs on a little, so the plate is set into the moulding rather
// than bleeding off its bottom edge. The count below is what those add up to, plus a
// hair of slack — the live chin is measured from its content, so this has to stay
// at or above it or the case would sit on the bottom of the picture.
const DECK_CLEARANCE = 158;

export { NAV_CLEARANCE, DECK_CLEARANCE, FRAME_GUTTER, BEZEL_WIDTH };

// Whoever is painting the hardware puts its space on the document. The count is
// the point: a loading chassis handing the device to the console must not take
// the insets away in the frame between them, and the console must not lose them
// when the shell is told to put the device away.
let holders = 0;

export function applyShellVars() {
  holders += 1;
  document.body.classList.add("hh-shell");
  const root = document.documentElement.style;
  root.setProperty("--hh-shell-top", `${FRAME_GUTTER}px`);
  root.setProperty("--hh-top", `${FRAME_GUTTER + BEZEL_WIDTH}px`);
  root.setProperty("--hh-nav", `${NAV_CLEARANCE}px`);
  root.setProperty("--hh-bottom", `${DECK_CLEARANCE + FRAME_GUTTER + BEZEL_WIDTH}px`);
  root.setProperty("--hh-foot", `${FOOT_CLEARANCE}px`);
  root.setProperty("--hh-frame", `${FRAME_GUTTER}px`);
  root.setProperty("--hh-bezel-w", `${BEZEL_WIDTH}px`);
}

export function releaseShellVars() {
  holders = Math.max(0, holders - 1);
  if (holders) return;
  document.body.classList.remove("hh-shell");
  const root = document.documentElement.style;
  [
    "--hh-top",
    "--hh-nav",
    "--hh-shell-top",
    "--hh-bottom",
    "--hh-foot",
    "--hh-frame",
    "--hh-bezel-w",
  ].forEach((name) => root.setProperty(name, "0px"));
}
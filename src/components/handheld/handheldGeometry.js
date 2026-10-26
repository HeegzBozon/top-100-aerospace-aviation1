// The device's geometry, in one place.
//
// index.css consumes these as custom properties to inset every surface, so the
// hardware is never hidden behind content — and because the console and the
// loading chassis apply the same numbers, the picture never shifts as the console
// takes over from a load.
//
// Above the glass, on the case itself: the shell's top lip, the crown printed on
// it, then the moulding — and the picture opens below all three.
const TOP_CLEARANCE = 7; // the shell's own top edge
const BAR_CLEARANCE = 34; // the crown band, where the mark and the name are printed
const FRAME_GUTTER = 14; // the desk margin: how much surface shows around the shell
const BEZEL_WIDTH = 18; // the moulding drawn back out around the glass

// Inside the glass: the rail, and the air it floats in.
const NAV_CLEARANCE = 52;

// Below the glass: the chin, carrying the wheel, the keys, the grille and the plate.
const DECK_CLEARANCE = 132;

export { TOP_CLEARANCE, BAR_CLEARANCE, NAV_CLEARANCE, DECK_CLEARANCE, FRAME_GUTTER, BEZEL_WIDTH };

// Whoever is painting the hardware puts its space on the document. The count is
// the point: a loading chassis handing the device to the console must not take
// the insets away in the frame between them, and the console must not lose them
// when the shell is told to put the device away.
let holders = 0;

export function applyShellVars() {
  holders += 1;
  document.body.classList.add("hh-shell");
  const root = document.documentElement.style;
  root.setProperty("--hh-shell-top", `${TOP_CLEARANCE + FRAME_GUTTER}px`);
  root.setProperty(
    "--hh-top",
    `${TOP_CLEARANCE + BAR_CLEARANCE + FRAME_GUTTER + BEZEL_WIDTH}px`,
  );
  root.setProperty("--hh-bar", `${BAR_CLEARANCE}px`);
  root.setProperty("--hh-nav", `${NAV_CLEARANCE}px`);
  root.setProperty("--hh-bottom", `${DECK_CLEARANCE + FRAME_GUTTER + BEZEL_WIDTH}px`);
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
    "--hh-bar",
    "--hh-nav",
    "--hh-shell-top",
    "--hh-bottom",
    "--hh-frame",
    "--hh-bezel-w",
  ].forEach((name) => root.setProperty(name, "0px"));
}
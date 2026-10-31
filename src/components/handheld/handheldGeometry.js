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
// The moulding drawn back out around the glass. It is set deeper than the steps
// themselves need: a wider case around a smaller picture is what gives the opening
// its depth, and the shell's corner grows with it so the bezel keeps one width as it
// turns (see HandheldBody and HandheldScreenFrame).
const BEZEL_WIDTH = 14;

// Inside the glass at its head: nothing. The legend band that used to be cut across the
// top of the picture is on the case now, at the head of the chin (see ChinMenuBar), so the
// glass opens straight onto the surface being read.
const NAV_CLEARANCE = 0;

// Inside the glass, at its foot: the readout band — the cycle's stamp. It is the glass's
// own footer rather than a strip added below the picture: taken from the pane's bottom
// edge, so the pane keeps its full width and everything that lives on the picture is
// inset above the band instead of running under it.
const FOOT_CLEARANCE = 32;

// Below the glass: the chin, carrying the machine's menu bar, the key row both faces wear,
// then the wheel, the face keys and the speaker. The chin is three bands: the menu bar cut
// in at its head, the row of eight caps under it, and the controls (the wheel's own height,
// which out-measures both the face keys and the speaker), with the case's foot padding
// under them. The count below is what those add up to, plus a hair of slack — the live chin
// is measured from its content, so this has to stay at or above it or the case would sit on
// the bottom of the picture.
const DECK_CLEARANCE = 190;

// The radio face needs more case than the wheel does: the menu bar, the walking cluster
// and a full keypad are more rows than the wheel ever had. It is measured the same way —
// the bar, the cluster, the speaker slot and the keypad, plus the air around them — so the
// glass opens straight onto whichever face is fitted. The pad shares the case with the bar
// above it, so the bar's own band is counted in here: at 222 the pad's last row ran out
// through the foot of the machine.
const RADIO_CLEARANCE = 240;

export { NAV_CLEARANCE, DECK_CLEARANCE, RADIO_CLEARANCE, FRAME_GUTTER, BEZEL_WIDTH, FOOT_CLEARANCE };

// Whoever is painting the hardware puts its space on the document. The count is
// the point: a loading chassis handing the device to the console must not take
// the insets away in the frame between them, and the console must not lose them
// when the shell is told to put the device away.
let holders = 0;

// The chin's depth, for the face that is fitted: the wheel's case or the radio's.
export function setDeckClearance(clearance = DECK_CLEARANCE) {
  document.documentElement.style.setProperty("--hh-bottom", `${clearance + FRAME_GUTTER}px`);
}

// The foot is the face's too: the wheel's glass carries the cycle band, and the radio's
// does not — its own readout across the head of the keypad already prints where the
// machine is standing, so a second band on the glass would only repeat it and eat the
// picture. A foot of 0 is the face that needs none.
export function applyShellVars(clearance = DECK_CLEARANCE, foot = FOOT_CLEARANCE) {
  holders += 1;
  document.body.classList.add("hh-shell");
  const root = document.documentElement.style;
  root.setProperty("--hh-shell-top", `${FRAME_GUTTER}px`);
  root.setProperty("--hh-top", `${FRAME_GUTTER + BEZEL_WIDTH}px`);
  root.setProperty("--hh-nav", `${NAV_CLEARANCE}px`);
  // The picture opens straight onto the chin: no band of moulding is held below the
  // pane, so the glass's bottom edge IS the chin's top edge and the readout band inside
  // it is the lowest part of the picture. How deep the chin is belongs to the face
  // fitted to it, so it is handed in rather than assumed.
  setDeckClearance(clearance);
  root.setProperty("--hh-foot", `${foot}px`);
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
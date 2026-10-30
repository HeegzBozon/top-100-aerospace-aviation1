// The handset's geometry, in one place.
//
// The moulding is a desk machine now. A phone has no room to give half its width to
// a case, so the picture takes the whole viewport and the controls ride over it as a
// floating console (see TouchConsole, and the deck that draws it). Every inset here is
// therefore zero — and it stays published, because the surfaces built for the glass
// read these properties for their own bars, panels, drawers and page turns: a zero
// hands those surfaces the full screen instead of a framed window, without any of them
// needing to know which machine they are on.
//
// The values are still applied through the same counted holders, so a loading chassis
// handing the picture to the app never adds or takes away an edge.
const FRAME_GUTTER = 0;
const BEZEL_WIDTH = 0;
// The strip that used to be cut across the head of the glass is now a drawer over the
// picture, so the glass owes it no clearance at all.
const NAV_CLEARANCE = 0;
// Nor the readout band that rode the foot of the glass.
const FOOT_CLEARANCE = 0;
// Nor the chin: the wheel, the keys and the plate stand in the console overlay.
const DECK_CLEARANCE = 0;

export { NAV_CLEARANCE, DECK_CLEARANCE, FRAME_GUTTER, BEZEL_WIDTH };

// Whoever is painting the picture puts its edges on the document. The count is the
// point: a loading chassis handing over to the app must not take the edges away in the
// frame between them.
let holders = 0;

export function applyShellVars() {
  holders += 1;
  document.body.classList.add("hh-shell");
  const root = document.documentElement.style;
  root.setProperty("--hh-shell-top", `${FRAME_GUTTER}px`);
  root.setProperty("--hh-top", `${FRAME_GUTTER + BEZEL_WIDTH}px`);
  root.setProperty("--hh-nav", `${NAV_CLEARANCE}px`);
  root.setProperty("--hh-bottom", `${DECK_CLEARANCE + FRAME_GUTTER}px`);
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
import { RADIO } from "./consoleMode";

// The line of keys a surface prints above its own options.
//
// Every surface used to print the ring's legend — ◀▶ Walk · A Open — because the wheel
// was the only face there was. On the radio that line names hardware that is not on the
// case: there is no ring to turn and no A to press, and a hand reading it finds no way
// in at all. The walking keys are UP and DOWN, the confirm key is the keypad's #, and
// the way back is BACK. One helper, two legends, so a surface says the true thing
// whichever face is fitted.
export const navHint = (face, { walk = "Walk", open = "Open" } = {}) =>
  face === RADIO ? `▲▼ ${walk} · # ${open}` : `◀▶ ${walk} · A ${open}`;

// The console's own drawers speak of their own keys: the ring's centre loads an entry,
// the keypad's # does the same on the radio.
export const drawerHint = (face, { move = "Move", run = "Go", back = "Back" } = {}) =>
  face === RADIO
    ? `▲▼ ${move} · # ${run} · BACK ${back}`
    : `◀▶ ${move} · ● ${run} · B ${back}`;
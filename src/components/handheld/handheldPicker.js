import { useEffect, useState } from "react";

// One picker at a time — the one on top. A surface whose options are discrete and
// enterable — the title screen's surfaces, the committee's ballot, the profile's own
// panels — registers one here, and the console's ring walks those options while the
// confirm key opens the one standing under the cursor.
//
// The pickers are held as a stack, because surfaces nest: the committee's console
// holds a menu of panels, and a panel can hold a menu of its own. A surface that
// registers while another is up takes the wheel; the moment it unmounts, the picker
// underneath answers again, so a nested surface hands the ring back exactly as it
// found it. Only the top one is ever asked anything.
//
// The cursor law (docs/handheld-cursor-rules.md): a list stops at its ends. A
// surface walks its options and declines the turn past the first or the last, so
// the console hands that turn to the glass and the page reads on. Nothing on this
// device wraps — the console's own drawer stops with everything else, bumping at
// its first and its last entry.
//
// A page of prose registers a deck instead (see handheldDeck). A surface that
// registers a picker answers four questions:
//   labels / index / goTo — what the rail and the masthead read
//   step  — a turn of the ring. Returning null declines the turn, and the
//           console scrolls the glass instead, which is how an open panel is
//           read down the page.
//   page  — back and forward on the ring: the neighbour
//   enter — the confirm key. Returning false hands the key back, so a surface
//           with nothing to open leaves A doing what it always did.
//   back  — returning true means the press was taken (a panel closing).
//   steer — optional, and rare. A surface that is steered by the ring itself — a
//           game — hands over { prints, hold(dir, on) }: its own four prints for
//           the ring, and the zone under the thumb reported held as up, down,
//           left or right until the thumb comes off. While such a surface is
//           active and nothing of the console's own is open over the glass, the
//           four zones stop being menu/back/forward/play, and a rotation no
//           longer walks anything.
//
// The registry is module-level because the console and the page render as
// siblings in the layout, not as parent and child.
let stack = [];
const listeners = new Set();

const announce = () => listeners.forEach((listener) => listener());

export const registerPicker = (api) => {
  stack = [...stack.filter((entry) => entry !== api), api];
  announce();
  return () => {
    stack = stack.filter((entry) => entry !== api);
    announce();
  };
};

export const getPicker = () => stack[stack.length - 1] || null;

// The surface calls this whenever its options or its cursor move.
export const touchPicker = () => announce();

export const useHandheldPicker = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    listener();
    return () => listeners.delete(listener);
  }, []);
  return getPicker();
};
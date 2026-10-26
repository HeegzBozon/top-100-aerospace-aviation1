import { useEffect, useState } from "react";

// One picker at a time. A surface whose options are discrete and enterable — the
// title screen's surfaces, the profile's own panels — registers one here, and
// the console's ring walks those options while the confirm key opens the one
// standing under the cursor.
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
//
// The registry is module-level because the console and the page render as
// siblings in the layout, not as parent and child.
let picker = null;
const listeners = new Set();

const announce = () => listeners.forEach((listener) => listener());

export const registerPicker = (api) => {
  picker = api;
  announce();
  return () => {
    if (picker === api) {
      picker = null;
      announce();
    }
  };
};

export const getPicker = () => picker;

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
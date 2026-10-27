// One surface at a time answers the four face keys. A surface with four things
// standing under the hand — the chamber's candidates — registers a handler here and
// the keypad becomes its instrument; the moment it stops taking keys, or unmounts,
// the keypad goes back to what it always was: A confirms, B backs out, X lists the
// sections, Y shares.
//
// A handler is handed the key's own name and returns true when it has taken the
// press, false to let the console keep it.
//
// The registry is module-level because the console and the page render as siblings in
// the layout, not as parent and child.
import { useEffect, useState } from "react";

let handler = null;
const listeners = new Set();

const announce = () => listeners.forEach((fn) => fn(handler !== null));

export const registerFaceKeys = (fn) => {
  handler = fn;
  announce();
  return () => {
    if (handler === fn) {
      handler = null;
      announce();
    }
  };
};

export const pressFaceKey = (name) => (handler ? handler(name) === true : false);

// Whether a surface is holding the four keys. The hardware reads this to put on the
// legends that go with it: while the keys are held, Y prints its own letter — it is a
// vote — and the ring's play zone carries the share.
export const useFaceKeysClaimed = () => {
  const [claimed, setClaimed] = useState(handler !== null);

  useEffect(() => {
    setClaimed(handler !== null);
    listeners.add(setClaimed);
    return () => listeners.delete(setClaimed);
  }, []);

  return claimed;
};
// One surface at a time answers the four face keys. A surface with four things
// standing under the hand — the chamber's candidates — registers a handler here and
// the keypad becomes its instrument; the moment it stops taking keys, or unmounts,
// the keypad goes back to what it always was: A confirms, B backs out, X lists the
// sections, Y opens the Edit drawer.
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

// The radio's own keys. The keypad has no letters on it, so a surface with four things
// standing under the hand — the chamber's candidates — claims the digits instead: the
// same claim, made in the face's own alphabet. A digit claimed here is taken before the
// keypad is allowed to tune or to jump: the surface answers for it.
let digitHandler = null;

export const registerDigits = (fn) => {
  digitHandler = fn;
  return () => {
    if (digitHandler === fn) digitHandler = null;
  };
};

export const pressDigit = (digit) => (digitHandler ? digitHandler(digit) === true : false);

// Whether a surface is holding the four keys. The hardware reads this to put on the
// legends that go with it: while the keys are held, Y prints its own letter — it is a
// vote — and the share stays on the pill at the foot of the glass, where it always is.
export const useFaceKeysClaimed = () => {
  const [claimed, setClaimed] = useState(handler !== null);

  useEffect(() => {
    setClaimed(handler !== null);
    listeners.add(setClaimed);
    return () => listeners.delete(setClaimed);
  }, []);

  return claimed;
};
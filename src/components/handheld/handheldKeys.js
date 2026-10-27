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
let handler = null;

export const registerFaceKeys = (fn) => {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
};

export const pressFaceKey = (name) => (handler ? handler(name) === true : false);
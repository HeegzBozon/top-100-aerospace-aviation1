import { useEffect, useState } from "react";

// A SURFACE MAY BORROW THE DESK'S DIAL.
//
// The glass already lets a surface borrow the wheel (components/handheld/handheldPicker).
// The faceplate works the same way. A surface that is a tuner in its own right — the
// television, with a dial of stations — registers here, and while it stands on the picture
// the CH knob and the SCAN key turn through that surface's own channels instead of through
// the machine's index. Nothing else on the faceplate changes, and the machine's band comes
// back whole the moment the surface goes.
//
// Contract:
//   count()            how many positions the dial has
//   index()            where the dial is standing
//   target()           what to print under the figures: { band, label } — never a route,
//                      because a borrowed dial never navigates
//   step(direction)    turn one click
//   enter()            PUSH: the surface's own press
let active = null;
const listeners = new Set();

const publish = () => listeners.forEach((listener) => listener(active));

export function registerDeskTuner(tuner) {
  active = tuner;
  publish();
  return () => {
    if (active !== tuner) return;
    active = null;
    publish();
  };
}

// The tuner standing under the dial right now, if a surface asked for it.
export function useDeskTuner() {
  const [tuner, setTuner] = useState(active);
  useEffect(() => {
    setTuner(active);
    listeners.add(setTuner);
    return () => listeners.delete(setTuner);
  }, []);
  return tuner;
}
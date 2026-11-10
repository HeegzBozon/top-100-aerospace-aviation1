import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// The machine has two faces.
//
// The wheel is the one it was built with: one flat ivory ring under a picture that
// reads by the screenful. The radio is the one a hand knows from a field transceiver:
// a numbered keypad under a backlit readout, so a surface made of numbered entries —
// a roster, a volume, an issue's pages — is walked by typing the number rather than
// by rolling towards it.
//
// A surface is drawn with the face whose grammar it is written in, and the reader can
// always overrule that: the MODE key on the maker's plate steps Automatic → Wheel →
// Radio, and what is chosen there is what the machine wears from then on, across
// surfaces and across reloads, until it is set back to Automatic.
export const WHEEL = "wheel";
export const RADIO = "radio";
export const AUTO = "auto";

const STORAGE_KEY = "top100-console-mode";

// Which face a surface is written in. The click wheel is the machine's face by default
// — the title screen included, whose menu the ring walks key by key. The radio is a
// face the reader puts on with the MODE key, never one the machine assumes for them.
//
// The crosscheck is the exception, and only on the glass: four numbered records, placed
// by typing the number the card prints rather than by rolling towards it. There the
// machine puts the radio on by itself, and the MODE key still overrules it for good.
const RADIO_SURFACES = [/^\/vote(\/|$)/, /^\/selection-committee(\/|$)/, /^\/my-top100(\/|$)/];

const onHandheld = () => {
  try {
    return window.matchMedia("(max-width: 767px)").matches;
  } catch {
    return false;
  }
};

export function autoModeFor(pathname) {
  const path = pathname || "";
  if (onHandheld() && RADIO_SURFACES.some((pattern) => pattern.test(path))) {
    return { mode: RADIO, reason: "four numbered records" };
  }
  return { mode: WHEEL, reason: "read by the screenful" };
}

const read = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === WHEEL || stored === RADIO ? stored : AUTO;
  } catch {
    return AUTO;
  }
};

// The key's own legend: the face in use, and — while the machine is choosing for
// itself — that it is choosing.
export const modeLegend = (chosen, mode) => {
  if (chosen === RADIO) return "Radio";
  if (chosen === WHEEL) return "Wheel";
  return mode === RADIO ? "Auto · Radio" : "Auto · Wheel";
};

// What the reader chose is held here rather than inside one component, because two
// things read it: the console, which wears the face, and the surface, which prints the
// keys of the face it is being read on. A press of the MODE key has to reach both in
// the same frame, or a surface goes on printing the ring's legend under the keypad.
let choice = read();
const listeners = new Set();
const announce = () => listeners.forEach((listener) => listener());

const choose = (next) => {
  choice = next;
  try {
    if (next === AUTO) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage unavailable — the choice simply lasts this visit.
  }
  announce();
};

// The choice made from the menu bar's View menu rather than by stepping the MODE key:
// the same store, so the console and the surface print the face together.
export const setConsoleMode = (next) => choose(next);

const useChoice = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  return choice;
};

export default function useConsoleMode(pathname) {
  const chosen = useChoice();
  const automatic = autoModeFor(pathname);
  const mode = chosen === AUTO ? automatic.mode : chosen;
  const cycle = () => choose(chosen === AUTO ? WHEEL : chosen === WHEEL ? RADIO : AUTO);
  return { mode, chosen, automatic, cycle, legend: modeLegend(chosen, mode) };
}

// The face the machine is wearing right now, for a surface that has to print its own
// key legends: the radio has no ring and no A, so the wheel's legend is a lie there.
export const useConsoleFace = () => useConsoleMode(useLocation().pathname).mode;
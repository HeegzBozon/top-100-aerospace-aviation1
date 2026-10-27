import { useEffect, useState } from "react";

// One deck at a time. A surface built for the glass (ModuleSlideDeck) registers
// itself here so the console can drive it: back and forward turn the page, play
// reads a section and turns to the next, the rail shows where you stand. The
// registry is module-level because the console and the page render as siblings
// in the layout, not as parent and child.
let deck = null;
const listeners = new Set();

const announce = () => listeners.forEach((listener) => listener());

export const registerDeck = (api) => {
  deck = api;
  announce();
  return () => {
    if (deck === api) {
      deck = null;
      announce();
    }
  };
};

export const getDeck = () => deck;

// The deck calls this whenever its slide set or position changes.
export const touchDeck = () => announce();

export const useHandheldDeck = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    listeners.add(listener);
    listener();
    return () => listeners.delete(listener);
  }, []);
  return getDeck();
};
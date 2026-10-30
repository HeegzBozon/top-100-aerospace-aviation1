import { useEffect, useSyncExternalStore } from "react";

// The shelf's borrowed controls.
//
// The dock is the machine's own row of keys, and on most surfaces it shows the tiles.
// A surface that has controls of its own — the record's transport is the first — lends
// them to the shelf instead, so the picture keeps the whole tube and the controls a hand
// reaches for are already on the shelf rather than a strip laid over the work. Each
// surface claims one named slot and hands back a node; the dock renders the slots in
// order and puts the shelf back the moment the last one is given up.
const slots = new Map();
let snapshot = {};
const listeners = new Set();

function publish() {
  snapshot = Object.fromEntries(
    [...slots.entries()]
      .sort((a, b) => a[1].order - b[1].order)
      .map(([key, value]) => [key, value.node]),
  );
  listeners.forEach((notify) => notify());
}

export function setDeskDockSlot(key, node, order = 0) {
  const held = slots.get(key);
  if (!node) {
    if (!held) return;
    slots.delete(key);
  } else {
    if (held && held.node === node && held.order === order) return;
    slots.set(key, { node, order });
  }
  publish();
}

const subscribe = (notify) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};
const read = () => snapshot;

export function useDeskDockSlots() {
  return useSyncExternalStore(subscribe, read, read);
}

// A surface claims its slot while it stands, and gives it back when it goes.
export function useDeskDockSlot(key, node, order = 0) {
  useEffect(() => {
    setDeskDockSlot(key, node, order);
    return () => setDeskDockSlot(key, null);
  }, [key, node, order]);
}
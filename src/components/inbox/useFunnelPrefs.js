import { useState } from 'react';

// How a Fellow has set out their funnels: the funnel in view, the funnels they named
// themselves, and per funnel the tiles they hide and the custom tiles they composed.
// Kept on this device.
const KEY = 'inbox-funnel-prefs-v2';
const read = () => {
  try { return { active: '', named: [], byFunnel: {}, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { active: '', named: [], byFunnel: {} }; }
};

export default function useFunnelPrefs() {
  const [prefs, setPrefs] = useState(read);
  const save = (next) => { setPrefs(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const tilesFor = (fk) => ({ hidden: [], custom: [], ...(prefs.byFunnel[fk] || {}) });
  const setTiles = (fk, patch) => save({ ...prefs, byFunnel: { ...prefs.byFunnel, [fk]: { ...tilesFor(fk), ...patch } } });
  return {
    prefs,
    tilesFor,
    setActive: (key) => save({ ...prefs, active: key }),
    addFunnel: (f) => { const key = `f${Date.now()}`; save({ ...prefs, active: key, named: [...prefs.named, { ...f, key }] }); },
    removeFunnel: (key) => save({ ...prefs, active: '', named: prefs.named.filter((f) => f.key !== key) }),
    toggle: (fk, key) => { const t = tilesFor(fk); setTiles(fk, { hidden: t.hidden.includes(key) ? t.hidden.filter((k) => k !== key) : [...t.hidden, key] }); },
    add: (fk, tile) => setTiles(fk, { custom: [...tilesFor(fk).custom, { ...tile, key: `c${Date.now()}` }] }),
    remove: (fk, key) => setTiles(fk, { custom: tilesFor(fk).custom.filter((c) => c.key !== key) }),
  };
}
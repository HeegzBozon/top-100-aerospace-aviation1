import { useState } from 'react';

// How a Fellow has set out their funnel: the tiles they keep hidden and the custom
// tiles they have composed. Kept on this device.
const KEY = 'inbox-funnel-prefs';
const read = () => {
  try { return { hidden: [], custom: [], ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { hidden: [], custom: [] }; }
};

export default function useFunnelPrefs() {
  const [prefs, setPrefs] = useState(read);
  const save = (next) => { setPrefs(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  return {
    prefs,
    toggle: (key) => save({ ...prefs, hidden: prefs.hidden.includes(key) ? prefs.hidden.filter((k) => k !== key) : [...prefs.hidden, key] }),
    add: (tile) => save({ ...prefs, custom: [...prefs.custom, { ...tile, key: `c${Date.now()}` }] }),
    remove: (key) => save({ ...prefs, custom: prefs.custom.filter((c) => c.key !== key) }),
  };
}
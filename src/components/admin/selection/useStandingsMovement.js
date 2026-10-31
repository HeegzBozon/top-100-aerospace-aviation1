import { useEffect, useMemo, useState } from 'react';
import { STANDING_COLUMNS } from './standingsOrder';

const KEY = 'top100.selection.standings.v2';
const KEYS = STANDING_COLUMNS.map((c) => c.key);

// How long a snapshot stays the yardstick before a new one is taken. Short enough that
// the operator sees real movement, long enough that a minute-by-minute refresh does not
// wipe the cue out from under them.
const COMPARE_WINDOW_MS = 10 * 60 * 1000;

function readSnapshot() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* storage is a convenience here, never a requirement */
  }
}

function ranksOf(ordered) {
  return Object.fromEntries(ordered.map((row, index) => [row.id, index + 1]));
}

// Movement in each column, read against the last snapshot this browser held for the same
// scope. Nothing is stored server-side: a position that moved is a fact about what the
// operator has seen, not a measurement the platform publishes.
export default function useStandingsMovement(rankings = {}, scopeKey = 'all') {
  const [baseline, setBaseline] = useState(null);
  const sizes = KEYS.map((key) => (rankings[key] || []).length).join(':');

  useEffect(() => {
    if (!(rankings[KEYS[0]] || []).length) return;
    const stored = readSnapshot();
    const usable = stored && stored.scopeKey === scopeKey ? stored : null;
    setBaseline(usable);
    const stale = !usable || Date.now() - usable.savedAt > COMPARE_WINDOW_MS;
    if (stale) {
      writeSnapshot({
        scopeKey,
        savedAt: Date.now(),
        ranks: Object.fromEntries(KEYS.map((key) => [key, ranksOf(rankings[key] || [])])),
      });
    }
  }, [sizes, scopeKey, rankings]);

  return useMemo(() => {
    if (!baseline) return { moves: {}, since: null };
    const moves = {};
    KEYS.forEach((key) => {
      const before = baseline.ranks?.[key] || {};
      const column = {};
      (rankings[key] || []).forEach((row, index) => {
        const was = before[row.id];
        column[row.id] = typeof was === 'number' ? { delta: was - (index + 1) } : { isNew: true };
      });
      moves[key] = column;
    });
    return { moves, since: baseline.savedAt };
  }, [rankings, baseline]);
}
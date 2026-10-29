import { useEffect, useMemo, useState } from 'react';

const KEY = 'top100.selection.standings.v1';

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

// Movement in the standings, read against the last snapshot this browser held for the
// same scope. Nothing is stored server-side: a position that moved is a fact about what
// the operator has seen, not a measurement the platform publishes.
export default function useStandingsMovement(rows = [], scopeKey = 'all') {
  const [baseline, setBaseline] = useState(null);

  useEffect(() => {
    if (!rows.length) return;
    const stored = readSnapshot();
    const usable = stored && stored.scopeKey === scopeKey ? stored : null;
    setBaseline(usable);
    const stale = !usable || Date.now() - usable.savedAt > COMPARE_WINDOW_MS;
    if (stale) {
      writeSnapshot({
        scopeKey,
        savedAt: Date.now(),
        positions: Object.fromEntries(rows.map((r) => [r.id, r.position])),
      });
    }
  }, [rows, scopeKey]);

  return useMemo(() => {
    if (!baseline) return { moves: {}, since: null };
    const moves = {};
    rows.forEach((row) => {
      const before = baseline.positions?.[row.id];
      moves[row.id] =
        typeof before === 'number' ? { delta: before - row.position } : { isNew: true };
    });
    return { moves, since: baseline.savedAt };
  }, [rows, baseline]);
}
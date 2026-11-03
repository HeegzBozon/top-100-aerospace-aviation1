import { useCallback, useState } from 'react';
import { noteRecord } from './arcadeProgress';

// THE HOUSE RECORD.
//
// The best score each cabinet has seen on this machine. It is kept on the device
// rather than on the platform: a cabinet's record belongs to the room it stands in,
// not to a person's profile, and nothing here is ever read by discovery or measurement.
const KEY = 'arcade-records-v1';

function read() {
  try {
    const held = JSON.parse(localStorage.getItem(KEY) || '{}');
    return held && typeof held === 'object' ? held : {};
  } catch {
    return {};
  }
}

export default function useArcadeRecords() {
  const [records, setRecords] = useState(read);

  // Files a score against a cabinet. Returns true when it stands as the new record,
  // so the cabinet can light its lamp.
  const submit = useCallback((cabinetId, score) => {
    if (!cabinetId || !Number.isFinite(score) || score <= 0) return false;
    const best = records[cabinetId] || 0;
    if (score <= best) return false;
    const next = { ...records, [cabinetId]: Math.floor(score) };
    setRecords(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // A machine with no store simply keeps no record.
    }
    // The same number stands as a cabinet badge milestone on the passport's East Wing shelf.
    noteRecord(cabinetId, score);
    return true;
  }, [records]);

  const clear = useCallback(() => {
    setRecords({});
    try {
      localStorage.removeItem(KEY);
    } catch {
      // nothing to do — the record was never written
    }
  }, []);

  return { records, submit, clear };
}
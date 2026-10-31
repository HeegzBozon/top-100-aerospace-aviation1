import { useCallback, useEffect, useRef, useState } from 'react';

// The briefing is read once — once, full stop. It used to be recorded per Fellow on the
// device, which meant the same person who came in as a visitor and then signed in was
// briefed twice, and anyone arriving on a second surface was briefed again. The record is
// now one mark for the machine, written the moment the briefing is shown rather than when
// it is dismissed: a Fellow who closes the tab mid-read has still seen it.
const SEEN_KEY = 'top100.missionBriefing.v1';
// Records written before the mark was unified, kept only so nobody is briefed a second
// time by the change: an old per-Fellow mark is read, then folded into the one mark.
const LEGACY_PREFIX = 'top100.missionBriefing.v1:';

function readMark(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeMark(key) {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // A browser that keeps no storage sees the briefing again; nothing else changes.
  }
}

export default function useMissionBriefing(identity, ready = true) {
  const legacyKey = `${LEGACY_PREFIX}${String(identity || 'guest').toLowerCase()}`;
  const [open, setOpen] = useState(false);
  const decided = useRef(false);

  const markSeen = useCallback(() => {
    writeMark(SEEN_KEY);
  }, []);

  useEffect(() => {
    if (!ready || decided.current) return;
    decided.current = true;
    if (readMark(SEEN_KEY)) return;
    if (readMark(legacyKey)) {
      // Already briefed under the old record: adopt it rather than brief again.
      markSeen();
      return;
    }
    setOpen(true);
    markSeen();
  }, [ready, legacyKey, markSeen]);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
  }, [markSeen]);

  return { open, setOpen, close };
}
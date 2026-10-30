import { useCallback, useEffect, useRef, useState } from 'react';

// The briefing is read once. The record is kept per Fellow on the device, so a second
// Fellow on the same machine is not skipped, and it is written the moment the briefing is
// shown rather than when it is dismissed — a Fellow who closes the tab mid-read has still
// seen it, and is not briefed again on every pass through the committee.
const SEEN_PREFIX = 'top100.missionBriefing.v1:';

export default function useMissionBriefing(identity, ready = true) {
  const key = `${SEEN_PREFIX}${String(identity || 'guest').toLowerCase()}`;
  const [open, setOpen] = useState(false);
  const decided = useRef(false);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(key, new Date().toISOString());
    } catch {
      // A browser that keeps no storage sees the briefing again; nothing else changes.
    }
  }, [key]);

  useEffect(() => {
    if (!ready || decided.current) return;
    decided.current = true;
    let seen = null;
    try {
      seen = window.localStorage.getItem(key);
    } catch {
      seen = null;
    }
    if (seen) return;
    setOpen(true);
    markSeen();
  }, [ready, key, markSeen]);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
  }, [markSeen]);

  return { open, setOpen, close };
}
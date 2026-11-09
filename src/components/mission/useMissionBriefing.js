import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The briefing is read once — once, full stop. It used to be recorded per Fellow on the
// device, which meant the same person who came in as a visitor and then signed in was
// briefed twice, and anyone arriving on a second surface was briefed again. The record is
// now one mark for the machine, written the moment the briefing is shown rather than when
// it is dismissed: a Fellow who closes the tab mid-read has still seen it.
//
// The device mark is only the fast path. It is not the record: a preview frame, a private
// window or a browser set to keep no storage keeps nothing at all, and the briefing came
// back up on every visit because of it. The durable mark therefore sits on the Fellow's own
// account, and a device that remembers nothing still reads that the commission was taken.
const SEEN_KEY = 'top100.missionBriefing.v1';
// Records written before the mark was unified, kept only so nobody is briefed a second
// time by the change: an old per-Fellow mark is read, then folded into the one mark.
const LEGACY_PREFIX = 'top100.missionBriefing.v1:';
// The field on the Fellow's own record that makes the briefing once-only.
const RECORD_FIELD = 'mission_briefing_seen_at';

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
    // A browser that keeps no storage leans on the record instead; nothing else changes.
  }
}

export default function useMissionBriefing(user, ready = true) {
  const email = user?.email;
  const seenOnRecord = !!user?.[RECORD_FIELD];
  const legacyKey = `${LEGACY_PREFIX}${String(email || 'guest').toLowerCase()}`;
  const [open, setOpen] = useState(false);
  const decided = useRef(false);

  const markSeen = useCallback(() => {
    writeMark(SEEN_KEY);
    // The durable copy. Failing to write it costs nothing — the device mark still holds on
    // a machine that keeps storage, and an offline press is not worth an error on screen.
    base44.auth.updateMe({ [RECORD_FIELD]: new Date().toISOString() }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!ready || decided.current) return;
    decided.current = true;
    // Already read on this account: adopt the device mark and stay silent.
    if (seenOnRecord) {
      writeMark(SEEN_KEY);
      return;
    }
    if (readMark(SEEN_KEY)) return;
    if (readMark(legacyKey)) {
      // Already briefed under the old record: adopt it rather than brief again.
      markSeen();
      return;
    }
    setOpen(true);
    markSeen();
  }, [ready, seenOnRecord, legacyKey, markSeen]);

  const close = useCallback(() => {
    setOpen(false);
    markSeen();
  }, [markSeen]);

  return { open, setOpen, close };
}
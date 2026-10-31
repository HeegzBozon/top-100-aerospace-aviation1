import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The reader's place in the knowledge base. One record per Fellow, keyed by email,
// holding the article keys they have opened — so the hub can be walked across sessions
// and a chapter is complete when every module in it appears here.
//
// A visitor who is not signed in has no record: the hub reads exactly the same, it
// simply keeps nothing. Saving never blocks the reading — a failed write leaves the page
// as it stands and the place is simply not banked.
//
// Two things this got wrong before, and does not now:
//  · the write carried only the keys, so the owner rule (which reads the write itself)
//    could not match the Fellow and every update was refused in silence. The record's
//    own email is written with the keys.
//  · marks made before the record arrived were replaced by whatever the record held, so
//    the first article of a visit never banked. What is marked is now merged with what
//    was stored, and a debounced write that is still waiting is flushed on the way out.
const DEBOUNCE_MS = 900;

export default function useCourseProgress() {
  const [read, setRead] = useState([]);
  const [ready, setReady] = useState(false);
  const readRef = useRef([]);
  readRef.current = read;

  const recordId = useRef(null);
  const timer = useRef(null);
  const pending = useRef(null);
  const email = useRef(null);

  const write = useRef(null);
  write.current = async (keys) => {
    if (!email.current || !keys?.length) return;
    const payload = {
      // The owner rule reads the write itself, so the record's key travels with it.
      fellow_email: email.current,
      read_keys: keys,
      last_read_at: new Date().toISOString(),
    };
    try {
      if (recordId.current) {
        await base44.entities.CourseProgress.update(recordId.current, payload);
      } else {
        const created = await base44.entities.CourseProgress.create(payload);
        recordId.current = created?.id || null;
      }
    } catch {
      // the place is simply not banked this time
    }
  };

  // One write per burst of reading, not one per turn of the wheel.
  const queue = (keys) => {
    if (!email.current) return;
    pending.current = keys;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      const next = pending.current;
      pending.current = null;
      write.current(next);
    }, DEBOUNCE_MS);
  };
  const queueRef = useRef(null);
  queueRef.current = queue;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      let me = null;
      try {
        me = await base44.auth.me();
      } catch {
        me = null; // a visitor: the hub still reads, it just keeps nothing
      }
      if (!alive) return;

      if (me?.email) {
        email.current = me.email;
        try {
          const page = await base44.entities.CourseProgress.filter(
            { fellow_email: me.email },
            { sort: '-updated_date', limit: 1 },
          );
          const record = Array.isArray(page) ? page[0] : page?.items?.[0];
          if (!alive) return;
          if (record) {
            recordId.current = record.id;
            const stored = record.read_keys || [];
            // What was marked while the record was in flight is kept, not replaced.
            const merged = Array.from(new Set([...stored, ...readRef.current]));
            readRef.current = merged;
            setRead(merged);
            if (merged.length > stored.length) queueRef.current(merged);
          }
        } catch {
          // unreadable progress is not a broken hub
        }
      }

      if (alive) setReady(true);
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Leaving the page mid-read still banks the place.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      const next = pending.current;
      pending.current = null;
      if (next) write.current(next);
    },
    [],
  );

  const markRead = (key) => {
    if (!key || readRef.current.includes(key)) return;
    const next = [...readRef.current, key];
    readRef.current = next;
    setRead(next);
    queueRef.current(next);
  };
  const markRef = useRef(null);
  markRef.current = markRead;

  return {
    read,
    ready,
    markRead: (key) => markRef.current(key),
  };
}
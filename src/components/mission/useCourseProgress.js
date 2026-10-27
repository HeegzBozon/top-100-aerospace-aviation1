import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The reader's place in the course. One record per Fellow, keyed by email, holding
// the module keys they have been through — so the course can be walked across
// sessions, and a chapter is complete when every module in it appears here.
//
// A visitor who is not signed in has no record: the course reads exactly the same,
// it simply keeps nothing. Saving never blocks the reading — a failed write leaves
// the page as it stands and the position is simply not banked.
export default function useCourseProgress() {
  const [read, setRead] = useState([]);
  const [ready, setReady] = useState(false);
  const readRef = useRef([]);
  readRef.current = read;

  const recordId = useRef(null);
  const timer = useRef(null);
  const email = useRef(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      let me = null;
      try {
        me = await base44.auth.me();
      } catch {
        me = null; // a visitor: the course still reads, it just keeps nothing
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
            setRead(record.read_keys || []);
          }
        } catch {
          // unreadable progress is not a broken course
        }
      }

      if (alive) setReady(true);
    };

    load();
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // One write per burst of reading, not one per scroll.
  const queue = useCallback((keys) => {
    if (!email.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const at = new Date().toISOString();
      try {
        if (recordId.current) {
          await base44.entities.CourseProgress.update(recordId.current, { read_keys: keys, last_read_at: at });
        } else {
          const created = await base44.entities.CourseProgress.create({
            fellow_email: email.current,
            read_keys: keys,
            last_read_at: at,
          });
          recordId.current = created?.id || null;
        }
      } catch {
        // the place is simply not banked this time
      }
    }, 1200);
  }, []);

  const markRead = useCallback(
    (key) => {
      if (!key || readRef.current.includes(key)) return;
      const next = [...readRef.current, key];
      readRef.current = next;
      setRead(next);
      queue(next);
    },
    [queue],
  );

  return { read, ready, markRead };
}
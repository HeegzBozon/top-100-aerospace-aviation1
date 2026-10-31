import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';

// The wheel walks the Inbox: a turn moves the cursor item by item (stopping at the
// ends, per the cursor law), back/forward on the ring switch Inbox / Pinned / Done,
// the confirm key opens the item under the cursor, and back marks it done.
export default function useInboxPicker({ rows, views, view, setView, onDone, onOpen }) {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const live = useRef({});
  live.current = { rows, views, view, setView, onDone, onOpen, cursor };

  useEffect(() => { if (cursor >= rows.length) setCursor(Math.max(0, rows.length - 1)); }, [rows.length, cursor]);

  useEffect(() => {
    const land = (i) => {
      const { rows: r } = live.current;
      if (i < 0 || i >= r.length) return null;
      setCursor(i);
      document.getElementById(`inbox-row-${r[i].key}`)?.scrollIntoView({ block: 'nearest' });
      return r[i].title;
    };
    return registerPicker({
      labels: () => live.current.rows.map((r) => r.title),
      index: () => live.current.cursor,
      step: (d) => land(live.current.cursor + d),
      goTo: land,
      page: (d) => {
        const { views: v, view: cur, setView: set } = live.current;
        const next = v[v.indexOf(cur) + d];
        if (!next) return null;
        set(next);
        setCursor(0);
        return next[0].toUpperCase() + next.slice(1);
      },
      enter: () => {
        const row = live.current.rows[live.current.cursor];
        if (!row) return false;
        if (row.enquiry) live.current.onOpen(row.key);
        else navigate(row.to);
        return true;
      },
      back: () => {
        const row = live.current.rows[live.current.cursor];
        if (!row || live.current.view === 'done') return false;
        live.current.onDone(row.key);
        return true;
      },
    });
  }, [navigate]);

  useEffect(() => { touchPicker(); }, [cursor, rows.length, view]);

  return { cursorKey: rows[cursor]?.key, setCursor };
}
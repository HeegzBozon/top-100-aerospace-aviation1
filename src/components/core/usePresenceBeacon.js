import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// The machine's own heartbeat. One beat a minute from every signed-in person, written onto
// their one row, so the desks can say who is on the wire and where they are standing.
//
// The row is remembered on the device (a convenience only — the record is the server's):
// a beat updates the row it made before; a row that has since been cleared is remade on the
// next beat rather than failing quietly. Nothing is written while the tab is put away.

const BEAT_MS = 60 * 1000;

export default function usePresenceBeacon(user) {
  const location = useLocation();
  const route = location.pathname;
  const email = user?.email;
  const name = user?.full_name || email;

  useEffect(() => {
    if (!email) return;

    const key = `top100-presence:${email}`;
    let stopped = false;

    const beat = async () => {
      const rowId = localStorage.getItem(key);
      const payload = {
        user_email: email,
        user_name: name || email,
        route: route || '/',
        last_seen_at: new Date().toISOString(),
      };

      try {
        if (rowId) {
          await base44.entities.Presence.update(rowId, payload);
        } else {
          const created = await base44.entities.Presence.create(payload);
          if (created?.id) localStorage.setItem(key, created.id);
        }
      } catch {
        // The remembered row is gone or was never readable: forget it and file a fresh
        // one on the next beat.
        localStorage.removeItem(key);
      }
    };

    if (!stopped) beat();
    const timer = setInterval(() => {
      if (!document.hidden) beat();
    }, BEAT_MS);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [email, name, route]);
}
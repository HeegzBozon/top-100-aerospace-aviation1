import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';

const asRows = (value) => (Array.isArray(value) ? value : value?.items || []);

// The conferences this host owns — drafts included, which is the point of the workspace —
// and the attendance declared against each. An administrator reads every conference on the
// network, because oversight is theirs and the same list is where an approval is checked.
export default function useHostConferences(email, isAdmin) {
  const [state, setState] = useState({ loading: true, failed: false });
  const [rooms, setRooms] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!email && !isAdmin) return undefined;
    let alive = true;
    setState({ loading: true, failed: false });

    (async () => {
      const results = await Promise.allSettled([
        base44.entities.ConferenceRoom.list('-start_date', 200),
        base44.entities.ConferenceRsvp.list('-declared_at', 1000),
      ]);
      if (!alive) return;

      const [roomResult, rsvpResult] = results;
      if (roomResult.status === 'rejected') {
        setState({ loading: false, failed: true });
        return;
      }

      setRooms(asRows(roomResult.value));
      setRsvps(rsvpResult.status === 'fulfilled' ? asRows(rsvpResult.value) : []);
      setState({ loading: false, failed: false });
    })();

    return () => { alive = false; };
  }, [email, isAdmin, attempt]);

  const mine = useMemo(() => {
    const own = isAdmin ? rooms : rooms.filter((room) => room.facilitator_email === email);
    const rank = (room) => (room.status === 'draft' ? 0 : 1);
    return own.sort((a, b) => rank(a) - rank(b) || new Date(a.start_date || 0) - new Date(b.start_date || 0));
  }, [rooms, email, isAdmin]);

  const attendeesFor = useCallback(
    (room) => (room ? rsvps.filter((rsvp) => rsvp.room_id === room.id) : []),
    [rsvps],
  );

  const replace = useCallback((room) => {
    if (!room?.id) return;
    setRooms((rows) => {
      const exists = rows.some((row) => row.id === room.id);
      return exists ? rows.map((row) => (row.id === room.id ? room : row)) : [room, ...rows];
    });
  }, []);

  return {
    state,
    rooms: mine,
    attendeesFor,
    replace,
    retry: () => setAttempt((n) => n + 1),
    reload: () => setAttempt((n) => n + 1),
  };
}
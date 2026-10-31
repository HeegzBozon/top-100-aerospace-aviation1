import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { phaseForRoom } from '@/components/conference-room/conferenceRoomConfig';

const asRows = (value) => (Array.isArray(value) ? value : value?.items || []);

// The circuit: every conference open to the network, the Fellows standing in each one, and
// the ones this reader has declared for. One read of each collection covers the whole board
// — never a read per card.
export default function useConferences() {
  const [state, setState] = useState({ loading: true, failed: false });
  const [rooms, setRooms] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [me, setMe] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

    (async () => {
      const results = await Promise.allSettled([
        base44.auth.me(),
        base44.entities.ConferenceRoom.list('-start_date', 200),
        base44.entities.ConferenceRsvp.list('-declared_at', 1000),
      ]);
      if (!alive) return;

      const [meResult, roomResult, rsvpResult] = results;

      // The board itself is the one read that cannot fail quietly: without it there is
      // nothing to show. Attendance is additive, and a failure there leaves the board
      // standing with empty rooms rather than blanking the page.
      if (roomResult.status === 'rejected') {
        setState({ loading: false, failed: true });
        return;
      }

      setMe(meResult.status === 'fulfilled' ? meResult.value : null);
      setRooms(asRows(roomResult.value));
      setRsvps(rsvpResult.status === 'fulfilled' ? asRows(rsvpResult.value) : []);
      setState({ loading: false, failed: false });
    })();

    return () => { alive = false; };
  }, [attempt]);

  const circuit = useMemo(
    () => rooms.filter((room) => room.status !== 'draft'),
    [rooms],
  );

  const { upcoming, past } = useMemo(() => {
    const byStart = (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0);
    return {
      upcoming: circuit.filter((room) => phaseForRoom(room) !== 'done').sort(byStart),
      past: circuit.filter((room) => phaseForRoom(room) === 'done').sort((a, b) => byStart(b, a)),
    };
  }, [circuit]);

  const attendeesFor = useCallback(
    (room) => (room ? rsvps.filter((rsvp) => rsvp.room_id === room.id) : []),
    [rsvps],
  );

  const myRoomIds = useMemo(() => {
    const ids = new Set();
    rsvps.forEach((rsvp) => {
      if (me?.email && rsvp.fellow_email === me.email) ids.add(rsvp.room_id);
    });
    return ids;
  }, [rsvps, me]);

  // What this reader has declared for, in the order it happens.
  const mine = useMemo(
    () => circuit
      .filter((room) => myRoomIds.has(room.id))
      .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)),
    [circuit, myRoomIds],
  );

  return {
    state,
    me,
    circuit,
    upcoming,
    past,
    mine,
    attendeesFor,
    myRoomIds,
    retry: () => setAttempt((n) => n + 1),
  };
}
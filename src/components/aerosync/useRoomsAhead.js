import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { phaseForRoom } from '@/components/conference-room/conferenceRoomConfig';

const ROOM_STATUSES = ['open', 'live'];

// The rooms still ahead, and the three things a Fellow should have in place before standing
// in one. Rooms and RSVPs come from the conference entities; the prep counts come from the
// record and the availability board. Each is its own query, so one going down never blanks
// the other: the board reports a failure only when nothing at all could be read.
export default function useRoomsAhead() {
  const [state, setState] = useState({ loading: true, failed: false });
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const email = me?.email;

      const results = await Promise.allSettled([
        base44.entities.ConferenceRoom.list('-start_date', 60),
        base44.entities.ConferenceRsvp.list('-declared_at', 300),
        email ? base44.entities.Service.count({ provider_user_email: email, is_active: true }) : 0,
        email ? base44.entities.Connection.count({ recipient_email: email, status: 'pending' }) : 0,
        email ? base44.entities.Nominee.filter({ nominee_email: email }, { limit: 1 }) : [],
      ]);
      if (!alive) return;

      if (results.every((result) => result.status === 'rejected')) {
        setState({ loading: false, failed: true });
        return;
      }

      const rows = (index) => {
        const value = results[index].status === 'fulfilled' ? results[index].value : null;
        return Array.isArray(value) ? value : value?.items || [];
      };
      const num = (index) => {
        const value = results[index].status === 'fulfilled' ? results[index].value : 0;
        return typeof value === 'number' ? value : 0;
      };

      setData({
        me,
        rooms: rows(0),
        rsvps: rows(1),
        availability: num(2),
        pendingIntros: num(3),
        nominee: rows(4)[0] || null,
      });
      setState({ loading: false, failed: false });
    })();

    return () => {
      alive = false;
    };
  }, [attempt, refreshKey]);

  // Rooms that are still ahead of us, in the order they arrive. A room that has already
  // closed belongs to the archive, not here.
  const ahead = useMemo(() => {
    return (data?.rooms || [])
      .filter((room) => ROOM_STATUSES.includes(room.status) && phaseForRoom(room) !== 'done')
      .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
  }, [data]);

  const nextRoom = useMemo(() => ahead.find((room) => phaseForRoom(room) === 'live') || ahead[0] || null, [ahead]);
  const laterRooms = ahead.filter((room) => room.id !== nextRoom?.id);

  const rsvpsByRoom = useMemo(() => {
    const map = {};
    (data?.rsvps || []).forEach((rsvp) => {
      (map[rsvp.room_id] = map[rsvp.room_id] || []).push(rsvp);
    });
    return map;
  }, [data]);

  const me = data?.me || null;

  const attendeesFor = useCallback((room) => (room ? rsvpsByRoom[room.id] || [] : []), [rsvpsByRoom]);
  const myRsvpFor = useCallback(
    (room) => attendeesFor(room).find((rsvp) => rsvp.fellow_email === me?.email) || null,
    [attendeesFor, me],
  );

  return {
    state,
    data,
    me,
    ahead,
    nextRoom,
    laterRooms,
    attendeesFor,
    myRsvpFor,
    retry: () => setAttempt((n) => n + 1),
    refresh: () => setRefreshKey((key) => key + 1),
  };
}
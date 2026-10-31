import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const asRows = (value) => (Array.isArray(value) ? value : value?.items || []);

// One conference, its roster, and the private notes this reader has filed from it.
//
// The record is the read that has to succeed: a conference that cannot be read is either
// missing or withheld (a draft that belongs to its host), and both are answered honestly
// rather than as an error. Attendance and notes are additive — one going down leaves the
// conference standing with an empty room rather than a blank page.
export default function useConferenceRoom(roomId) {
  const [state, setState] = useState({ loading: true, failed: false, missing: false });
  const [room, setRoom] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [met, setMet] = useState([]);
  const [me, setMe] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const loadSide = useCallback(async (record) => {
    if (!record) return;
    const [rsvpResult, noteResult] = await Promise.allSettled([
      base44.entities.ConferenceRsvp.filter({ room_id: record.id }, '-declared_at', 500),
      base44.entities.ConferenceContact.filter({ conference_name: record.conference_name }, '-created_date', 200),
    ]);
    setAttendees(rsvpResult.status === 'fulfilled' ? asRows(rsvpResult.value) : []);
    setMet(noteResult.status === 'fulfilled' ? asRows(noteResult.value) : []);
  }, []);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false, missing: false });

    (async () => {
      const meResult = await base44.auth.me().catch(() => null);

      let record = null;
      try {
        record = await base44.entities.ConferenceRoom.get(roomId);
      } catch (error) {
        if (!alive) return;
        if (error?.status === 404) {
          setState({ loading: false, failed: false, missing: true });
          return;
        }
        setState({ loading: false, failed: true, missing: false });
        return;
      }

      if (!alive) return;
      if (!record) {
        setState({ loading: false, failed: false, missing: true });
        return;
      }

      setMe(meResult);
      setRoom(record);
      await loadSide(record);
      if (!alive) return;
      setState({ loading: false, failed: false, missing: false });
    })();

    return () => { alive = false; };
  }, [roomId, attempt, loadSide]);

  // Attendance and notes refresh in place — the page never drops back to its loader
  // because a Fellow declared for a room or filed a note from it.
  const refresh = useCallback(async () => {
    await loadSide(room);
  }, [loadSide, room]);

  const forget = useCallback((contactId) => {
    setMet((rows) => rows.filter((row) => row.id !== contactId && row.email !== contactId));
  }, []);

  return {
    state,
    room,
    attendees,
    met,
    me,
    refresh,
    forget,
    retry: () => setAttempt((n) => n + 1),
  };
}
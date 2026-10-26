import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { phaseForRoom } from './conferenceRoomConfig';

// A Fellow's conference participation across the full event cycle: declared
// RSVPs and independently verified attendances, joined to their rooms.
// A verified attendance is resolved separately from a declared RSVP — a room
// the Fellow declared for but never had verified stays a declaration and is
// never presented as part of the credential. Coordination only: never read by
// discovery, ranking, or scoring.
export default function useConferenceCircle(email) {
  const [circle, setCircle] = useState({ next: [], live: [], past: [], loading: true, error: false });

  const load = useCallback(async () => {
    if (!email) {
      setCircle({ next: [], live: [], past: [], loading: false, error: false });
      return;
    }
    setCircle((c) => ({ ...c, loading: true, error: false }));
    try {
      // Rooms and declarations are required to state anything true; a failure
      // there surfaces as an error rather than a hollow "no conferences".
      // Verified attendance is additive — its absence never invalidates the rest.
      const [rooms, rsvps, attendances] = await Promise.all([
        base44.entities.ConferenceRoom.list('-start_date', 200),
        base44.entities.ConferenceRsvp.filter({ fellow_email: email }),
        base44.entities.ConferenceAttendance.filter({ fellow_email: email }).catch(() => []),
      ]);

      const roomById = new Map((rooms || []).map((r) => [r.id, r]));
      const attendanceByRoom = new Map((attendances || []).map((a) => [a.room_id, a]));

      // A room the reader can't resolve is skipped — draft rooms are not
      // surfaced through a profile.
      const build = (roomId, rsvp, attendance) => {
        const room = roomById.get(roomId);
        if (!room && !attendance) return null;
        return {
          id: roomId,
          conference_name: room?.conference_name || attendance?.conference_name || rsvp?.conference_name || '',
          conference_series: room?.conference_series || attendance?.conference_series || '',
          start_date: room?.start_date || attendance?.start_date || '',
          end_date: room?.end_date || attendance?.end_date || '',
          city: room?.city || attendance?.city || '',
          country: room?.country || attendance?.country || '',
          domain_focus: room?.domain_focus || attendance?.domain_focus || '',
          phase: room ? phaseForRoom(room) : 'done',
          verified: !!attendance,
          focus_area: rsvp?.focus_area || attendance?.focus_area || '',
          volunteer: !!rsvp?.volunteer,
        };
      };

      const entries = [];
      const seen = new Set();
      (rsvps || []).forEach((r) => {
        const entry = build(r.room_id, r, attendanceByRoom.get(r.room_id));
        if (entry) { entries.push(entry); seen.add(r.room_id); }
      });
      (attendances || []).forEach((a) => {
        if (seen.has(a.room_id)) return;
        const entry = build(a.room_id, null, a);
        if (entry) entries.push(entry);
      });

      const ascending = (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0);
      setCircle({
        next: entries.filter((e) => e.phase === 'upcoming').sort(ascending),
        live: entries.filter((e) => e.phase === 'live').sort(ascending),
        past: entries.filter((e) => e.phase === 'done').sort((a, b) => ascending(b, a)),
        loading: false,
        error: false,
      });
    } catch {
      setCircle({ next: [], live: [], past: [], loading: false, error: true });
    }
  }, [email]);

  useEffect(() => { load(); }, [load]);

  return { ...circle, reload: load };
}
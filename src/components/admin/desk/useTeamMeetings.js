import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The desk's diary: bookings, the roster they are made against, and the away days the
// form warns about. One read, one place to write, so the list and the form never disagree.
export default function useTeamMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [roster, setRoster] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const [booked, people, away] = await Promise.allSettled([
        base44.entities.TeamMeeting.filter({}, { sort: 'start_at', limit: 300 }),
        base44.entities.User.list(),
        base44.entities.WorkShift.filter({ kind: { $in: ['vacation', 'sick', 'out'] } }, { limit: 300 }),
      ]);
      if (booked.status === 'rejected') throw booked.reason;
      setMeetings(booked.value?.items || []);
      const peopleRows = people.status === 'fulfilled' ? people.value || [] : [];
      setRoster(
        [...new Map(peopleRows.filter((u) => u?.full_name).map((u) => [u.email, { name: u.full_name, email: u.email }])).values()].sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
      );
      setAbsences(away.status === 'fulfilled' ? away.value?.items || [] : []);
      setState('ready');
    } catch (err) {
      setError(err?.message || 'The diary could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    const created = await base44.entities.TeamMeeting.create(payload);
    setMeetings((prev) => [...prev, created].sort((a, b) => String(a.start_at).localeCompare(String(b.start_at))));
    return created;
  }, []);

  const patch = useCallback(async (meeting, changes) => {
    const updated = await base44.entities.TeamMeeting.update(meeting.id, changes);
    setMeetings((prev) => prev.map((row) => (row.id === meeting.id ? updated : row)));
    return updated;
  }, []);

  const remove = useCallback(async (meeting) => {
    await base44.entities.TeamMeeting.delete(meeting.id);
    setMeetings((prev) => prev.filter((row) => row.id !== meeting.id));
  }, []);

  return { meetings, roster, absences, state, error, reload: load, create, patch, remove };
}
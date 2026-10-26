import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { buildDailyTasks, buildOnboarding, dayKey, streakFrom } from './checkInConfig';

const EMPTY = {
  availability: 0,
  dispatches: 0,
  pendingConnections: 0,
  roomRsvps: 0,
  verified: false,
  discipline: '',
  logs: [],
};

// The check-in column's state: what the other columns are asking for today, what
// has been handled, and the streak it adds up to. One bounded read of the log,
// plus the few signals the task generators read — no polling.
export function useCheckIn(user, { placed = 0, phase = null, openRoles = 0, roomsOpen = 0 } = {}) {
  const email = user?.email;
  const today = dayKey();
  const [data, setData] = useState(EMPTY);
  const [state, setState] = useState({ loading: true, failed: false });
  const [busyKey, setBusyKey] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    if (!email) {
      setData(EMPTY);
      setState({ loading: false, failed: false });
      return () => {
        alive = false;
      };
    }

    setState({ loading: true, failed: false });

    (async () => {
      const results = await Promise.allSettled([
        base44.entities.CheckInLog.filter({ user_email: email }, { sort: '-completed_at', limit: 120 }),
        base44.entities.Service.count({ provider_user_email: email, is_active: true }),
        base44.entities.Bulletin.count({ author_email: email }),
        base44.entities.Connection.count({ recipient_email: email, status: 'pending' }),
        base44.entities.ConferenceRsvp.filter({ fellow_email: email }, { limit: 60 }),
        base44.entities.Nominee.filter({ nominee_email: email }, { limit: 1 }),
      ]);
      if (!alive) return;

      if (results.every((result) => result.status === 'rejected')) {
        setState({ loading: false, failed: true });
        return;
      }

      const value = (index, fallback) =>
        results[index].status === 'fulfilled' ? results[index].value : fallback;
      // A read with options comes back as a page; these accept either shape.
      const rows = (index) => {
        const result = value(index, null);
        if (Array.isArray(result)) return result;
        return result?.items || [];
      };
      const nominee = rows(5)[0] || null;
      const logs = rows(0);

      setData({
        logs,
        availability: typeof value(1, 0) === 'number' ? value(1, 0) : 0,
        dispatches: typeof value(2, 0) === 'number' ? value(2, 0) : 0,
        pendingConnections: typeof value(3, 0) === 'number' ? value(3, 0) : 0,
        roomRsvps: rows(4).length,
        verified: Boolean(nominee && nominee.verified_status && nominee.verified_status !== 'unverified'),
        discipline: nominee?.discipline || '',
      });
      setState({ loading: false, failed: false });
    })();

    return () => {
      alive = false;
    };
  }, [email, attempt]);

  const tasks = useMemo(() => {
    const handled = data.logs.filter((log) => log.day_key === today).map((log) => log.task_key);
    return buildDailyTasks(
      {
        user,
        placed,
        phase,
        openRoles,
        roomsOpen,
        availability: data.availability,
        dispatches: data.dispatches,
        pendingConnections: data.pendingConnections,
        roomRsvps: data.roomRsvps,
        verified: data.verified,
        discipline: data.discipline,
      },
      handled,
    );
  }, [data, user, placed, phase, openRoles, roomsOpen, today]);

  const onboarding = useMemo(
    () =>
      buildOnboarding({
        user,
        placed,
        availability: data.availability,
        dispatches: data.dispatches,
        verified: data.verified,
        discipline: data.discipline,
      }),
    [data, user, placed],
  );

  const toggle = useCallback(
    async (task) => {
      if (!email) return;
      setBusyKey(task.key);
      const existing = data.logs.find((log) => log.task_key === task.key && log.day_key === today);

      if (existing) {
        await base44.entities.CheckInLog.delete(existing.id);
        setData((current) => ({
          ...current,
          logs: current.logs.filter((log) => log.id !== existing.id),
        }));
      } else {
        const record = await base44.entities.CheckInLog.create({
          user_email: email,
          fellow_name: user?.full_name || '',
          task_key: task.key,
          column_key: task.column,
          title: task.title,
          day_key: today,
          completed_at: new Date().toISOString(),
        });
        setData((current) => ({ ...current, logs: [record, ...current.logs] }));
      }
      setBusyKey(null);
    },
    [data.logs, email, today, user?.full_name],
  );

  const handled = tasks.filter((task) => task.handled).length;

  return {
    loading: state.loading,
    failed: state.failed,
    retry: () => setAttempt((n) => n + 1),
    tasks,
    onboarding,
    handled,
    total: tasks.length,
    streak: streakFrom(data.logs, today),
    busyKey,
    toggle,
    today,
  };
}
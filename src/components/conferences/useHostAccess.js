import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The host credential, read from the server. The workspace never decides for itself whether
// a Fellow may publish: it asks, and the answer comes from the record's status. Every write
// is checked again on the way in, so this is a reading of the door, not the lock on it.
export default function useHostAccess() {
  const [state, setState] = useState({ loading: true, failed: false, signedOut: false });
  const [access, setAccess] = useState({ isAdmin: false, isHost: false, application: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false, signedOut: false });

    (async () => {
      const authed = await base44.auth.isAuthenticated().catch(() => false);
      if (!alive) return;
      if (!authed) {
        setState({ loading: false, failed: false, signedOut: true });
        return;
      }

      try {
        const response = await base44.functions.invoke('conferenceService', { action: 'hostStatus' });
        const data = response?.data ?? response;
        if (!alive) return;
        setAccess({
          isAdmin: !!data?.isAdmin,
          isHost: !!data?.isHost,
          application: data?.application || null,
        });
        setState({ loading: false, failed: false, signedOut: false });
      } catch {
        if (!alive) return;
        setState({ loading: false, failed: true, signedOut: false });
      }
    })();

    return () => { alive = false; };
  }, [attempt]);

  const apply = useCallback(async (form) => {
    const response = await base44.functions.invoke('conferenceService', { action: 'applyHost', ...form });
    const data = response?.data ?? response;
    if (data?.error) throw new Error(data.error);
    setAccess({
      isAdmin: !!data?.isAdmin,
      isHost: !!data?.isHost,
      application: data?.application || null,
    });
    return data;
  }, []);

  return { state, access, apply, retry: () => setAttempt((n) => n + 1) };
}
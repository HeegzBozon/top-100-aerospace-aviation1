import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { asRegex } from './crmConfig';

// One member's rolodex, read and written through one hook. The search is a filter on the
// server — never a walk through everything on screen — so the list stays one page, and
// every write bumps the same refresh key the list is read from.
export default function useConferenceContacts() {
  // `undefined` means the question has not been answered yet, `null` that there is nobody
  // signed in — a private rolodex has nothing to show for an anonymous visitor.
  const [me, setMe] = useState(undefined);
  const [contacts, setContacts] = useState([]);
  const [state, setState] = useState({ loading: true, failed: false });
  const [term, setTerm] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((user) => alive && setMe(user))
      .catch(() => alive && setMe(null));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (me === undefined) return undefined;
    if (!me) {
      setState({ loading: false, failed: true });
      return undefined;
    }

    let alive = true;
    setState({ loading: true, failed: false });

    const timer = setTimeout(async () => {
      try {
        const query = { created_by_id: me.id };
        const trimmed = term.trim();
        if (trimmed) {
          const match = { $regex: asRegex(trimmed) };
          query.$or = [
            { full_name: match },
            { company: match },
            { email: match },
            { conference_name: match },
          ];
        }
        const page = await base44.entities.ConferenceContact.filter(query, {
          sort: '-updated_date',
          limit: 60,
        });
        if (!alive) return;
        setContacts(page?.items || []);
        setState({ loading: false, failed: false });
      } catch {
        if (alive) setState({ loading: false, failed: true });
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [me, term, attempt, refreshKey]);

  const save = useCallback(
    async (payload, id) => {
      const body = { ...payload, tags: payload.tags || [] };
      if (id) await base44.entities.ConferenceContact.update(id, body);
      else await base44.entities.ConferenceContact.create({ ...body, owner_email: me?.email || '' });
      setRefreshKey((key) => key + 1);
    },
    [me],
  );

  const remove = useCallback(async (id) => {
    await base44.entities.ConferenceContact.delete(id);
    setRefreshKey((key) => key + 1);
  }, []);

  // A logged touch is the whole of "nurturing" in this first release: one press stamps
  // the day the relationship was worked, and the list re-reads with it.
  const touch = useCallback(async (id) => {
    await base44.entities.ConferenceContact.update(id, { last_touch: new Date().toISOString() });
    setRefreshKey((key) => key + 1);
  }, []);

  const searching = term.trim().length > 0;

  return useMemo(
    () => ({ me, contacts, state, term, setTerm, searching, reload, save, remove, touch }),
    [me, contacts, state, term, searching, reload, save, remove, touch],
  );
}
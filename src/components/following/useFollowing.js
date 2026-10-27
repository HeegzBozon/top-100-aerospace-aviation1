import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { personKey, readHonoree } from './honoreeRecord';

// The people a Fellow keeps: the follow graph as this corner of the app needs it.
//
// A follow is one row — who follows whom — and the row is written and removed on the same
// press. The register in the edition, the ledger in AeroSync and the button on a profile
// all read that one row, so a name followed in the magazine is a name kept everywhere.
export default function useFollowing() {
  // `undefined` means the question has not been answered yet, `null` that nobody is signed
  // in — a follow graph belongs to an account and has nothing to show for a visitor.
  const [me, setMe] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [state, setState] = useState({ loading: true, failed: false });
  const [busyKey, setBusyKey] = useState('');
  const [attempt, setAttempt] = useState(0);

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
      setState({ loading: false, failed: false });
      return undefined;
    }

    let alive = true;
    setState({ loading: true, failed: false });
    base44.entities.Follow.filter({ follower_email: me.email }, '-created_date', 500)
      .then((list) => {
        if (!alive) return;
        setRows(list || []);
        setState({ loading: false, failed: false });
      })
      .catch(() => alive && setState({ loading: false, failed: true }));

    return () => {
      alive = false;
    };
  }, [me, attempt]);

  useEffect(() => {
    if (!me) return undefined;
    return base44.entities.Follow.subscribe(() => setAttempt((n) => n + 1));
  }, [me]);

  // The row standing for a person, found on her address and then on her name: the register
  // knows a name before it knows an address, and a name it has already followed is a name
  // it must not offer to follow twice.
  const rowFor = useCallback(
    (person = {}) => {
      const email = personKey(person.email);
      const name = personKey(person.name);
      return (
        rows.find((row) => (email && personKey(row.following_email) === email) || (name && personKey(row.following_name) === name)) ||
        null
      );
    },
    [rows],
  );

  const toggle = useCallback(
    async (person = {}) => {
      if (!me) return { ok: false, reason: 'signed-out' };
      const existing = rowFor(person);
      setBusyKey(personKey(person.email) || personKey(person.name));

      try {
        if (existing) {
          await base44.entities.Follow.delete(existing.id);
          return { ok: true, following: false, name: person.name || existing.following_name || '' };
        }

        const record = await readHonoree(person);
        if (!record.email) return { ok: false, reason: 'no-address' };

        await base44.entities.Follow.create({
          follower_email: me.email,
          follower_name: me.full_name || '',
          follower_avatar_url: me.avatar_url || '',
          following_email: record.email,
          following_name: record.name,
          following_avatar_url: record.avatar || '',
        });
        return { ok: true, following: true, name: record.name };
      } catch {
        return { ok: false, reason: 'failed' };
      } finally {
        setBusyKey('');
        setAttempt((n) => n + 1);
      }
    },
    [me, rowFor],
  );

  return useMemo(
    () => ({
      me,
      rows,
      loading: me === undefined || state.loading,
      failed: state.failed,
      busyKey,
      signedIn: !!me,
      rowFor,
      toggle,
      reload: () => setAttempt((n) => n + 1),
    }),
    [me, rows, state, busyKey, rowFor, toggle],
  );
}
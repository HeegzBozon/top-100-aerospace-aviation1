import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { personKey, splitName } from './honoreeRecord';

// The crossover, held honestly.
//
// A followed person is matched to the rolodex on her address and on nothing else: a name is
// not an identity, and a contact is never attached to a person on a guess. Where the card
// is already held, it is read back beside her; where it is not, the Fellow is offered one
// press to keep her, which is the only way a contact is ever created from a follow.
export default function useRolodexLedger(emails = []) {
  const [me, setMe] = useState(undefined);
  const [contacts, setContacts] = useState([]);
  const [state, setState] = useState({ loading: true, failed: false });
  const [busyKey, setBusyKey] = useState('');
  const [attempt, setAttempt] = useState(0);

  // The addresses, deduped and stable: one query for the whole ledger rather than one per
  // person followed.
  const wanted = useMemo(() => emails.map(personKey).filter((email) => email.includes('@')), [emails.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!me || wanted.length === 0) {
      setContacts([]);
      setState({ loading: false, failed: false });
      return undefined;
    }

    let alive = true;
    setState({ loading: true, failed: false });
    base44.entities.ConferenceContact.filter(
      { created_by_id: me.id, email: { $in: wanted } },
      '-created_date',
      200,
    )
      .then((page) => {
        if (!alive) return;
        setContacts(page?.items || []);
        setState({ loading: false, failed: false });
      })
      .catch(() => alive && setState({ loading: false, failed: true }));

    return () => {
      alive = false;
    };
  }, [me, wanted, attempt]);

  const held = useMemo(() => {
    const map = new Map();
    contacts.forEach((contact) => {
      const key = personKey(contact.email);
      if (key && !map.has(key)) map.set(key, contact);
    });
    return map;
  }, [contacts]);

  const match = useCallback((email) => held.get(personKey(email)) || null, [held]);

  const keep = useCallback(
    async (person = {}) => {
      if (!me) return { ok: false, reason: 'signed-out' };
      if (!person.email) return { ok: false, reason: 'no-address' };

      setBusyKey(personKey(person.email));
      try {
        await base44.entities.ConferenceContact.create({
          owner_email: me.email,
          ...splitName(person.name),
          full_name: person.name || '',
          email: person.email,
          role_title: person.title || '',
          company: person.company || '',
          notes: 'Followed from the 2025 edition.',
          source: 'manual',
        });
        setAttempt((n) => n + 1);
        return { ok: true, name: person.name };
      } catch {
        return { ok: false, reason: 'failed' };
      } finally {
        setBusyKey('');
      }
    },
    [me],
  );

  return useMemo(
    () => ({ me, contacts, match, keep, busyKey, loading: state.loading, failed: state.failed, reload: () => setAttempt((n) => n + 1) }),
    [me, contacts, match, keep, busyKey, state],
  );
}
import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The Fellow's own referrals and the rolodex they are made from.
export default function useReferrals() {
  const [state, setState] = useState('loading');
  const [referrals, setReferrals] = useState([]);
  const [contacts, setContacts] = useState([]);

  const load = useCallback(() => {
    setState('loading');
    Promise.all([
      base44.entities.ConferenceReferral.list('-updated_date', 100),
      base44.entities.ConferenceContact.list('full_name', 300),
    ])
      .then(([r, c]) => { setReferrals(r); setContacts(c); setState('ready'); })
      .catch(() => setState('error'));
  }, []);

  useEffect(load, [load]);

  const create = async (data) => {
    const row = await base44.entities.ConferenceReferral.create({ ...data, status: 'drafted' });
    setReferrals((list) => [row, ...list]);
    return row;
  };

  const update = async (id, data) => {
    const row = await base44.entities.ConferenceReferral.update(id, data);
    setReferrals((list) => list.map((r) => (r.id === id ? row : r)));
  };

  return { state, referrals, contacts, create, update, retry: load };
}
import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const REFERRAL_STEP = {
  drafted: 'Draft — ask for consent',
  consent_asked: 'Waiting on consent',
  consented: 'Agreed — make the introduction',
  introduced: 'Introduced — confirm they connected',
};

// The Inbox: a view over the records that need an answer, with a saved, shared
// triage state per item. Source records stay canonical.
export default function useInbox(user) {
  const [items, setItems] = useState([]);
  const [states, setStates] = useState({});
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    if (!user?.email) return;
    setStatus('loading');
    try {
      const [refs, intros, saved] = await Promise.all([
        base44.entities.ConferenceReferral.filter({ status: { $in: Object.keys(REFERRAL_STEP) } }, '-updated_date', 100),
        base44.entities.IntroRequest.filter({ recipient_email: user.email, status: { $in: ['pending', 'viewed'] } }, '-created_date', 100),
        base44.entities.InboxItemState.list('-updated_date', 500),
      ]);
      const next = [
        ...refs.map((r) => ({
          key: `referral:${r.id}`, bundle: 'referrals', at: r.updated_date,
          title: `${r.subject_name || 'Someone'} → ${r.recipient_name || 'a contact'}`,
          fact: REFERRAL_STEP[r.status], person: r.status === 'consented', to: '/conferences/attend',
        })),
        ...intros.map((i) => ({
          key: `intro:${i.id}`, bundle: 'introductions', at: i.created_date, person: true,
          title: `${i.requester_name || i.requester_email} asks for an introduction`,
          fact: i.target_title || i.message || 'Introduction request', to: '/Profile?surface=availability',
        })),
      ];
      setItems(next);
      setStates(Object.fromEntries(saved.map((s) => [s.item_key, s])));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [user?.email]);

  useEffect(() => { load(); }, [load]);

  const setState = async (key, patch) => {
    const cur = states[key];
    setStates((s) => ({ ...s, [key]: { ...cur, item_key: key, ...patch } }));
    const saved = cur?.id
      ? await base44.entities.InboxItemState.update(cur.id, patch)
      : await base44.entities.InboxItemState.create({ item_key: key, ...patch });
    setStates((s) => ({ ...s, [key]: saved }));
  };

  return { items, states, status, reload: load, setState };
}
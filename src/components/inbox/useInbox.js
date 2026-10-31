import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const REFERRAL_STEP = {
  drafted: 'Draft — ask for consent',
  consent_asked: 'Waiting on consent',
  consented: 'Agreed — make the introduction',
  introduced: 'Introduced — confirm they connected',
};

const ENQUIRY_STEP = { new: 'New — awaiting your reply', opened: 'Read — reply pending', responded: 'Replied — in conversation' };
const NOMINATION_STEP = { new: 'Received — awaiting review', reviewing: 'Under review', approved: 'Approved — in the pool', rejected: 'Not advanced', archived: 'Archived' };
const TIMELINE = { immediate: 'Immediate', this_quarter: 'This quarter', exploratory: 'Exploratory' };
// Proposals and RFQs first, then the two intent tracks: Deal & BD, and Job & Career.
const enquiryBundle = (q) => (q.request_type === 'proposal_rfq' ? 'proposals' : q.mode === 'commercial' ? 'deals' : 'offers');

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
      const [refs, intros, enquiries, saved] = await Promise.all([
        base44.entities.ConferenceReferral.filter({ status: { $in: Object.keys(REFERRAL_STEP) } }, '-updated_date', 100),
        base44.entities.IntroRequest.filter({ recipient_email: user.email, status: { $in: ['pending', 'viewed'] } }, '-created_date', 100),
        base44.entities.ProfileInquiry.filter({ profile_email: user.email, status: { $in: ['new', 'opened', 'responded'] } }, '-created_date', 100),
        base44.entities.InboxItemState.list('-updated_date', 500),
      ]);
      const noms = await base44.entities.NominationIntake.filter({ nominator_email: user.email }, '-created_date', 100).catch(() => []);
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
        ...noms.map((n) => ({
          key: `nomination:${n.id}`, bundle: 'nominations', at: n.created_date, person: false,
          title: `You nominated ${n.nominee_name}`, fact: NOMINATION_STEP[n.status] || 'Received', to: '/selection-committee',
        })),
        ...enquiries.map((q) => ({
          key: `enquiry:${q.id}`, bundle: enquiryBundle(q), at: q.created_date, person: q.status === 'new',
          title: `${q.sender_name || q.sender_email}${q.sender_org ? ` · ${q.sender_org}` : ''}`,
          fact: `${ENQUIRY_STEP[q.status]}${q.timeline ? ` · ${TIMELINE[q.timeline]}` : ''}`, enquiry: q,
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

  // The enquiry desk, folded in: the status set here is the record of how it went.
  // Closing or declining an enquiry also files it as done.
  const setEnquiryStatus = async (item, next) => {
    await base44.entities.ProfileInquiry.update(item.enquiry.id, { status: next, status_updated_at: new Date().toISOString() });
    setItems((list) => list.map((i) => (i.key === item.key
      ? { ...i, enquiry: { ...i.enquiry, status: next }, fact: ENQUIRY_STEP[next] || 'Closed' } : i)));
    if (next === 'closed' || next === 'declined') await setState(item.key, { done: true, snoozed_until: null });
  };

  return { items, states, status, reload: load, setState, setEnquiryStatus };
}
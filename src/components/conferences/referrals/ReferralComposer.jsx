import { useState } from 'react';
import { REASONS } from './referralConfig';

const field = 'w-full rounded-md border border-editorial-cream/15 bg-editorial-navy/60 px-2.5 py-2 text-editorial-cream';

// Three choices and one optional line: who is being referred, to whom, and why.
export default function ReferralComposer({ contacts, onCreate, onCancel }) {
  const [subjectId, setSubjectId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [reason, setReason] = useState('peer');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);

  const pick = (id) => contacts.find((c) => c.id === id);
  const ready = subjectId && recipientId && subjectId !== recipientId;

  const submit = async () => {
    const s = pick(subjectId);
    const r = pick(recipientId);
    setSaving(true);
    await onCreate({
      subject_contact_id: s.id, subject_name: s.full_name, subject_email: s.email,
      recipient_contact_id: r.id, recipient_name: r.full_name, recipient_email: r.email,
      reason, context: context.trim().slice(0, 200),
    });
    setSaving(false);
  };

  const select = (value, set, label, exclude) => (
    <label className="block">
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-gold/80">{label}</span>
      <select className={`${field} mt-1`} value={value} onChange={(e) => set(e.target.value)}>
        <option value="">Choose from your contacts</option>
        {contacts.filter((c) => c.id !== exclude).map((c) => (
          <option key={c.id} value={c.id}>{c.full_name}{c.company ? ` · ${c.company}` : ''}</option>
        ))}
      </select>
    </label>
  );

  if (contacts.length < 2) {
    return <p className="rounded-md border border-dashed border-editorial-cream/20 p-4 text-center text-[12px] text-editorial-cream/70">
      Capture at least two contacts at a show, then refer one to the other here.</p>;
  }

  return (
    <div className="space-y-3">
      {select(subjectId, setSubjectId, 'Who are you referring?', recipientId)}
      {select(recipientId, setRecipientId, 'To whom?', subjectId)}
      <div>
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-gold/80">About</span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {Object.entries(REASONS).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setReason(k)}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${reason === k ? 'border-editorial-gold bg-editorial-gold/20 text-editorial-cream' : 'border-editorial-cream/20 text-editorial-cream/65'}`}>{l}</button>
          ))}
        </div>
      </div>
      <input className={field} maxLength={200} value={context} onChange={(e) => setContext(e.target.value)} placeholder="One line on why (optional)" />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-md border border-editorial-cream/20 py-2 text-[12px] text-editorial-cream/75">Cancel</button>
        <button type="button" disabled={!ready || saving} onClick={submit}
          className="flex-1 rounded-md bg-editorial-copper py-2 text-[12px] font-semibold text-editorial-cream disabled:opacity-40">{saving ? 'Saving…' : 'Draft referral'}</button>
      </div>
    </div>
  );
}
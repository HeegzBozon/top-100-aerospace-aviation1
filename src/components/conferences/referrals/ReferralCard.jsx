import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Check, MessageCircle, Loader2 } from 'lucide-react';
import { sendReferralMessage } from '@/functions/sendReferralMessage';
import { parties, mailto, STEPS } from './referralConfig';

// One referral worked end to end. Send emails each member, files the message in
// Messages, and opens the referrer's own mail for anyone not on the platform yet.
export default function ReferralCard({ referral, onUpdate, onReplace }) {
  const r = referral;
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState('');
  const reached = STEPS.findIndex((s) => s.key === r.status);
  const sent = r.sent_at || {};

  const send = async (step) => {
    setBusy(step);
    setNote('');
    const { data } = await sendReferralMessage({ referral_id: r.id, step }).catch((e) => ({ data: { error: e.response?.data?.error || 'Could not send' } }));
    setBusy(null);
    if (data.error) return setNote(data.error);
    onReplace(data.referral);
    if (data.unregistered.length) window.location.href = mailto(data.unregistered, data.subject, data.body);
    setNote(data.emailed.length ? 'Sent and saved to Messages.' : data.unregistered.length ? 'Opened in your mail.' : 'No email on file for this contact.');
  };

  return (
    <article className="rounded-lg border border-editorial-cream/12 bg-editorial-cream/[0.04] p-3">
      <p className="font-heading text-[14px] leading-tight text-editorial-cream">{r.subject_name} <span className="text-editorial-gold">→</span> {r.recipient_name}</p>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {STEPS.map((s, i) => (
          <button key={s.key} type="button" onClick={() => onUpdate(r.id, { status: s.key })}
            className={`flex items-center justify-center gap-0.5 rounded py-1 text-[9px] font-bold uppercase tracking-[0.06em] ${i <= reached ? 'bg-editorial-copper text-editorial-cream' : 'border border-editorial-cream/15 text-editorial-cream/55'}`}>
            {i <= reached && <Check className="h-2.5 w-2.5" />}{s.label}
          </button>
        ))}
      </div>

      {r.status !== 'declined' && (
        <div className="mt-3 space-y-1.5">
          {parties(r).map((p) => {
            const locked = p.key === 'intro' && reached < 1;
            const thread = r.threads?.[p.key];
            return (
              <div key={p.key} className={`flex items-center gap-2 rounded-md bg-editorial-navy/60 px-2.5 py-2 ${locked ? 'opacity-45' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] text-editorial-cream">{p.label}{sent[p.key] && <Check className="ml-1 inline h-3 w-3 text-editorial-gold" />}</p>
                  <p className="truncate text-[9.5px] text-editorial-cream/50">{p.hint}</p>
                </div>
                {thread && (
                  <Link to={`/Comms?conv=${thread}`} aria-label="Open in Messages" className="rounded-full border border-editorial-cream/20 p-1.5 text-editorial-cream"><MessageCircle className="h-3 w-3" /></Link>
                )}
                <button type="button" disabled={locked || !!busy} onClick={() => send(p.key)}
                  className="flex items-center gap-1 rounded-full bg-editorial-copper px-2.5 py-1 text-[10.5px] font-semibold text-editorial-cream disabled:opacity-40">
                  {busy === p.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}{sent[p.key] ? 'Resend' : 'Send'}
                </button>
              </div>
            );
          })}
          {note && <p className="text-[10.5px] text-editorial-gold">{note}</p>}
        </div>
      )}

      <button type="button" onClick={() => onUpdate(r.id, { status: r.status === 'declined' ? 'drafted' : 'declined' })}
        className="mt-2 text-[10px] text-editorial-cream/45 underline">{r.status === 'declined' ? 'Reopen' : 'Mark declined'}</button>
    </article>
  );
}
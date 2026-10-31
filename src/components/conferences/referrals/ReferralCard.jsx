import { Mail, Share2, Check } from 'lucide-react';
import { messages, mailto, STEPS } from './referralConfig';

// One referral worked end to end: each party gets the message written for them,
// and the referrer moves the opt-in along as replies come back.
export default function ReferralCard({ referral, onUpdate }) {
  const r = referral;
  const reached = STEPS.findIndex((s) => s.key === r.status);
  const msgs = messages(r);

  const share = async (m) => {
    const text = `${m.subject}\n\n${m.body}`;
    if (navigator.share) await navigator.share({ title: m.subject, text }).catch(() => {});
    else await navigator.clipboard.writeText(text);
  };

  const advance = (key) => onUpdate(r.id, { status: key, ...(key === 'introduced' ? { introduced_at: new Date().toISOString() } : {}) });

  return (
    <article className="rounded-lg border border-editorial-cream/12 bg-editorial-cream/[0.04] p-3">
      <p className="font-heading text-[14px] leading-tight text-editorial-cream">{r.subject_name} <span className="text-editorial-gold">→</span> {r.recipient_name}</p>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {STEPS.map((s, i) => (
          <button key={s.key} type="button" onClick={() => advance(s.key)}
            className={`rounded px-1 py-1 text-[8.5px] font-bold uppercase tracking-[0.08em] ${i <= reached ? 'bg-editorial-copper text-editorial-cream' : 'border border-editorial-cream/15 text-editorial-cream/55'}`}>
            {i <= reached && <Check className="mr-0.5 inline h-2.5 w-2.5" />}{s.label}
          </button>
        ))}
      </div>

      {r.status !== 'declined' && (
        <div className="mt-3 space-y-1.5">
          {msgs.map((m, i) => {
            const locked = m.key === 'intro' && reached < 1;
            return (
              <div key={m.key} className={`flex items-center gap-2 rounded-md bg-editorial-navy/50 px-2.5 py-2 ${locked ? 'opacity-40' : ''}`}>
                <span className="font-heading text-[11px] text-editorial-gold">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-editorial-cream/80">{m.party}</span>
                <a href={locked ? undefined : mailto(m)} aria-label="Open in mail" aria-disabled={locked}
                  className="rounded-full border border-editorial-cream/20 p-1.5 text-editorial-cream"><Mail className="h-3 w-3" /></a>
                <button type="button" disabled={locked} onClick={() => share(m)} aria-label="Share or copy"
                  className="rounded-full border border-editorial-cream/20 p-1.5 text-editorial-cream"><Share2 className="h-3 w-3" /></button>
              </div>
            );
          })}
          {reached < 1 && <p className="text-[10px] text-editorial-cream/50">The introduction unlocks once the person referred agrees.</p>}
        </div>
      )}

      <button type="button" onClick={() => advance(r.status === 'declined' ? 'drafted' : 'declined')}
        className="mt-2 text-[10px] text-editorial-cream/45 underline">{r.status === 'declined' ? 'Reopen' : 'Mark declined'}</button>
    </article>
  );
}
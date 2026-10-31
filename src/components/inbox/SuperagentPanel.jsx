import { useState } from 'react';
import { Bot, Loader2, Mail, RotateCcw } from 'lucide-react';
import useAgentHandoff from './useAgentHandoff';
import SuperagentHandOver from './SuperagentHandOver';

const btn = 'inline-flex items-center gap-1 rounded px-2.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50';

// The Superagent's desk for one thread: hand it over, wait for the draft, then review and send it yourself.
export default function SuperagentPanel({ item, ownerEmail, onReplied }) {
  const { handoff, status, reload, handOver, close } = useAgentHandoff(item.key);
  const [busy, setBusy] = useState(false);
  const q = item.enquiry;

  if (status === 'loading') return <p className="mt-3 flex items-center gap-1.5 font-body text-xs text-editorial-label"><Loader2 className="h-3 w-3 animate-spin" /> Checking with your Superagent</p>;
  if (status === 'error') return <button onClick={reload} className={`${btn} mt-3 border border-editorial-navy/20 text-editorial-navy`}><RotateCcw className="h-3 w-3" /> Superagent unavailable · retry</button>;

  if (!handoff) return <SuperagentHandOver item={item} ownerEmail={ownerEmail} onHandOver={handOver} />;

  if (handoff.status === 'requested') return (
    <div className="mt-3 rounded border border-dashed border-editorial-copper/50 px-3 py-2.5">
      <p className="pd-label flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> With your Superagent</p>
      <p className="mt-1 font-body text-xs text-editorial-navy/70">Ask your Superagent to "draft my pending inbox handoffs". Its draft appears here for your review.</p>
      <button onClick={() => close('dismissed')} className={`${btn} mt-2 border border-editorial-navy/20 text-editorial-navy`}>Take it back</button>
    </div>
  );

  const send = async () => {
    setBusy(true);
    const subject = encodeURIComponent('Re: your enquiry');
    window.location.href = `mailto:${q.sender_email}?subject=${subject}&body=${encodeURIComponent(handoff.draft_reply || '')}`;
    await close('used');
    await onReplied();
    setBusy(false);
  };

  return (
    <div className="mt-3 rounded border border-editorial-copper/40 bg-white px-3 py-2.5">
      <p className="pd-label flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> Superagent draft · review before sending</p>
      {handoff.summary && <p className="mt-1 font-body text-xs italic text-editorial-navy/70">{handoff.summary}</p>}
      <p className="mt-2 whitespace-pre-line font-body text-sm text-editorial-navy">{handoff.draft_reply}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button disabled={busy} onClick={send} className={`${btn} bg-editorial-copper text-editorial-cream`}><Mail className="h-3.5 w-3.5" /> Reply with this draft</button>
        <button disabled={busy} onClick={() => close('dismissed')} className={`${btn} border border-editorial-navy/20 text-editorial-navy`}>Set aside</button>
      </div>
    </div>
  );
}
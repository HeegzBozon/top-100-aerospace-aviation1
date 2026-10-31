import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';

const ASKS = [
  { key: 'draft', label: 'Draft a reply' },
  { key: 'summary', label: 'Summarize only' },
];

// Handing one thread over: only this thread's words go with it, and nothing leaves until you send it.
export default function SuperagentHandOver({ item, ownerEmail, onHandOver }) {
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const q = item.enquiry;

  const go = async (ask) => {
    setBusy(ask.key); setError('');
    const context = [
      `From: ${q.sender_name || q.sender_email}${q.sender_org ? `, ${q.sender_org}` : ''}`,
      q.sender_role && `Role: ${q.sender_role}`,
      `Message: ${q.message || '(no message)'}`,
    ].filter(Boolean).join('\n');
    await onHandOver({ owner_email: ownerEmail, source_title: item.title, context, instruction: ask.label })
      .catch(() => setError('That thread could not be handed over.'));
    setBusy(null);
  };

  return (
    <div className="mt-3 border-t border-editorial-navy/10 pt-2.5">
      <p className="pd-label flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> Hand to your Superagent</p>
      <p className="mt-1 font-body text-[11px] text-editorial-navy/60">Only this thread is shared. You review and send every reply.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {ASKS.map((a) => (
          <button key={a.key} disabled={!!busy} onClick={() => go(a)}
            className="inline-flex items-center gap-1 rounded border border-editorial-copper/60 px-2.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-navy disabled:opacity-50">
            {busy === a.key && <Loader2 className="h-3 w-3 animate-spin" />}{a.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 font-body text-xs text-destructive">{error}</p>}
    </div>
  );
}
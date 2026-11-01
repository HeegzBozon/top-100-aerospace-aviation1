import { useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import useAgentHandoff from '@/components/inbox/useAgentHandoff';

// Hands this concierge conversation to the visitor's own Superagent, the same way an inbox thread is
// handed over: only this transcript goes with it, and the agent's summary comes back here.
export default function ConciergeHandoff({ user, history }) {
  const key = `concierge:${user.email}`;
  const { handoff, handOver, close } = useAgentHandoff(key);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const go = async () => {
    setBusy(true); setError('');
    await handOver({
      owner_email: user.email,
      source_title: 'Concierge desk (Matthew Higa)',
      context: history.map(h => `${h.role}: ${h.text}`).join('\n'),
      instruction: 'Summarize what I learned at the concierge desk and list my next steps on the platform.',
    }).catch(() => setError('Could not hand this over.'));
    setBusy(false);
  };

  if (handoff?.status === 'drafted') {
    return (
      <div className="mt-2 flex-none rounded-sm border border-editorial-gold/50 bg-[#14283f] p-2 font-mono text-[11px] text-editorial-cream">
        <p className="mb-1 text-editorial-gold">Your Superagent:</p>
        <p className="max-h-20 overflow-y-auto whitespace-pre-line">{handoff.summary || handoff.draft_reply}</p>
        <button type="button" onClick={() => close('used')} className="mt-1 text-editorial-gold underline">Got it</button>
      </div>
    );
  }
  return (
    <div className="mt-2 flex flex-none items-center justify-between gap-2">
      <button type="button" disabled={busy || !!handoff || !history.length} onClick={go}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-editorial-gold disabled:opacity-50">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
        {handoff ? 'With your Superagent…' : 'Hand to my Superagent'}
      </button>
      {error && <span className="font-mono text-[10px] text-destructive">{error}</span>}
    </div>
  );
}
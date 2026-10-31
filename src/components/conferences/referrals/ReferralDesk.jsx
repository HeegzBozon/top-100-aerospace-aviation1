import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import ReferralComposer from './ReferralComposer';
import ReferralCard from './ReferralCard';

// The referral desk, opened over the glass from the scorecard.
export default function ReferralDesk({ desk, onClose }) {
  const { state, referrals, contacts, create, update, retry } = desk;
  const [composing, setComposing] = useState(false);

  return (
    <div className="hh-glass-panel fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label="Referrals">
      <div className="hh-glass-panel-card flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-editorial-navy shadow-2xl">
        <header className="flex items-center justify-between border-b border-editorial-copper/30 px-4 py-3">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">Double opt-in</p>
            <h2 className="font-heading text-[18px] text-editorial-cream">Referrals</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-editorial-cream/70"><X className="h-4 w-4" /></button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {state === 'loading' && <Loader2 className="mx-auto h-5 w-5 animate-spin text-editorial-gold" />}
          {state === 'error' && (
            <button type="button" onClick={retry} className="w-full rounded-md border border-editorial-cream/20 py-3 text-[12px] text-editorial-cream">Couldn't load. Try again</button>
          )}
          {state === 'ready' && (composing ? (
            <ReferralComposer contacts={contacts} onCancel={() => setComposing(false)}
              onCreate={async (d) => { await create(d); setComposing(false); }} />
          ) : (
            <>
              <button type="button" onClick={() => setComposing(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-editorial-copper py-2.5 text-[12px] font-semibold text-editorial-cream">
                <Plus className="h-3.5 w-3.5" /> New referral
              </button>
              {referrals.length === 0 ? (
                <div className="rounded-lg border border-dashed border-editorial-cream/20 p-5 text-center">
                  <p className="font-heading text-[15px] text-editorial-cream">No referrals yet</p>
                  <p className="mt-1 text-[11px] text-editorial-cream/60">Ask first, give the recipient a heads-up, then introduce both. Each message is written for you.</p>
                </div>
              ) : referrals.map((r) => <ReferralCard key={r.id} referral={r} onUpdate={update} />)}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
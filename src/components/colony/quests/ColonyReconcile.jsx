import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { QUESTS } from './firstFlight';

// A guest passport found on this device after sign-in. Nothing moves until the member
// chooses: the account stays authoritative, progress is added, blank card fields filled.
export default function ColonyReconcile({ guest, onClaim, onLeave }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const n = Object.keys(guest.quests || {}).filter(k => QUESTS.some(q => q.id === k)).length;
  const claim = async () => {
    setBusy(true); setError('');
    try { await onClaim(); } catch { setError('Could not bring it in. Try again.'); setBusy(false); }
  };
  return (
    <div className="absolute inset-x-3 top-3 z-40 mx-auto max-w-md rounded-lg border border-editorial-gold/60 bg-editorial-navy/95 p-4 shadow-xl">
      <p className="text-[10px] uppercase tracking-widest text-editorial-gold">Guest passport found</p>
      <p className="mt-1 font-heading text-lg text-editorial-cream">Bring {guest.name ? `“${guest.name}”` : 'your guest visit'} into your account?</p>
      <p className="mt-1 text-sm text-editorial-cream/70">{n} of 12 quests{guest.card?.title ? `, and a badge (${guest.card.title})` : ''}. Your account name and character stay as they are.</p>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={claim} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-sm font-semibold text-editorial-cream">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Bring it in
        </button>
        <button type="button" onClick={onLeave} disabled={busy} className="flex-1 rounded border border-white/20 py-2 text-sm text-editorial-cream/80">Not now</button>
      </div>
    </div>
  );
}
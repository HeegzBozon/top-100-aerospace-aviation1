import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { DISCOVERY_FIELDS, saveProfileField } from '@/components/colony/conciergeDiscovery';

// A line the concierge drafted for the visitor's profile. Nothing is written until they approve it.
export default function ConciergeProfileDraft({ draft, onSaved }) {
  const [state, setState] = useState('idle');
  if (!draft || !DISCOVERY_FIELDS[draft.field]) return null;
  const save = async () => {
    setState('saving');
    await saveProfileField(draft.field, draft.value).then(() => { setState('saved'); onSaved(draft.field); }).catch(() => setState('error'));
  };
  return (
    <div className="mt-2 rounded-sm border border-editorial-gold/60 bg-[#14283f] p-2 font-mono text-[11px] text-editorial-cream">
      <p className="text-editorial-gold">For your profile · {DISCOVERY_FIELDS[draft.field].label}</p>
      <p className="mt-1 italic">"{draft.value}"</p>
      {state === 'saved' ? <p className="mt-1 flex items-center gap-1 text-editorial-gold"><Check className="h-3 w-3" /> Saved to your profile</p> : (
        <button type="button" disabled={state === 'saving'} onClick={(e) => { e.stopPropagation(); save(); }}
          className="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-editorial-copper px-2 py-1 font-bold uppercase disabled:opacity-50">
          {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}Save to my profile
        </button>
      )}
      {state === 'error' && <p className="mt-1 text-destructive">Could not save. Try again.</p>}
    </div>
  );
}
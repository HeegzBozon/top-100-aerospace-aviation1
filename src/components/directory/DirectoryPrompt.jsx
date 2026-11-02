import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { C } from '@/components/crm/crmConfig';

// One light question, set at the head of a tab. Answering it writes to the profile; it can
// be skipped, and it disappears once answered.
export default function DirectoryPrompt({ kicker, question, children, onSkip }) {
  return (
    <div className="mb-5 rounded-lg p-4" style={{ background: '#fff', border: `1px dashed ${C.copper}` }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: C.copper }}>{kicker}</p>
      <p className="mt-1 font-heading text-lg" style={{ color: C.navy }}>{question}</p>
      <div className="mt-3">{children}</div>
      {onSkip && <button type="button" onClick={onSkip} className="mt-2 text-[10px] underline" style={{ color: C.muted }}>Not now</button>}
    </div>
  );
}

export function SaveKey({ onSave, disabled, label = 'Add to my profile' }) {
  const [state, setState] = useState('idle');
  const go = async () => { setState('saving'); await onSave(); setState('done'); };
  return (
    <button type="button" disabled={disabled || state !== 'idle'} onClick={go}
      className="inline-flex items-center gap-1.5 rounded px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] disabled:opacity-50"
      style={{ background: C.copper, color: C.cream }}>
      {state === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {state === 'done' && <Check className="h-3 w-3" />}
      {state === 'done' ? 'Saved' : label}
    </button>
  );
}
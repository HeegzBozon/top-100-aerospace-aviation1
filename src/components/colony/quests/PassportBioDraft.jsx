import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { saveProfileField } from '@/components/colony/conciergeDiscovery';

// Echo drafts an "About me" from approved answers only. The player edits it and decides.
export default function PassportBioDraft({ items }) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  if (!items.length) return null;

  const write = async () => {
    setBusy('draft'); setMsg('');
    const facts = items.map(i => `${i.label}: ${i.value}`).join('\n');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a warm, professional first-person "About me" for an aerospace and aviation professional profile, under 550 characters. Use ONLY these facts the person approved; invent nothing, no names, no numbers not given. Editorial and confident, not salesy.\n\n${facts}`,
    });
    setDraft(String(res).slice(0, 600)); setBusy('');
  };
  const save = async () => {
    setBusy('save');
    await saveProfileField('about_me', draft);
    setBusy(''); setMsg('Saved to your About me.');
  };

  return (
    <div className="rounded border border-editorial-gold/40 p-3">
      <p className="text-[10px] uppercase tracking-widest text-editorial-gold">Bio draft</p>
      {!draft ? (
        <button type="button" onClick={write} disabled={!!busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-editorial-copper py-2 text-xs uppercase tracking-widest">
          {busy === 'draft' && <Loader2 className="h-3 w-3 animate-spin" />}Draft my bio from approved answers
        </button>
      ) : (
        <>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 600))} rows={6}
            className="mt-2 w-full rounded border border-editorial-gold/40 bg-white/5 p-2 text-sm text-editorial-cream" />
          <button type="button" onClick={save} disabled={!!busy || !draft.trim()} className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-xs uppercase tracking-widest">
            {busy === 'save' && <Loader2 className="h-3 w-3 animate-spin" />}Approve and save as About me
          </button>
          {msg && <p className="mt-1 text-xs text-editorial-gold">{msg}</p>}
        </>
      )}
    </div>
  );
}
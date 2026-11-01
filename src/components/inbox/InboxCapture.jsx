import { useState } from 'react';
import { Loader2, Paperclip, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { entryContext } from './EntryDetail';

const KINDS = ['note', 'task', 'contact', 'upload'];
const field = 'mt-1 w-full rounded border border-editorial-navy/15 bg-white px-2.5 py-2 font-body text-sm text-editorial-navy';

// The triage bucket: anything typed or dropped in by hand, handed to the Superagent for a next step.
export default function InboxCapture({ user, onSaved }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: 'note', title: '', body: '', person_name: '', due_date: '' });
  const [file, setFile] = useState(null);
  const [ask, setAsk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return setError('Give it a title.');
    setBusy(true); setError('');
    try {
      const extra = file ? { file_uri: (await base44.integrations.Core.UploadPrivateFile({ file })).file_uri, file_name: file.name } : {};
      const entry = await base44.entities.InboxEntry.create({ ...form, due_date: form.due_date || undefined, ...extra });
      if (ask) await base44.entities.AgentHandoff.create({
        source_key: `entry:${entry.id}`, status: 'requested', owner_email: user.email, source_title: entry.title,
        context: entryContext(entry), instruction: 'Suggest the next action, a follow-up message and any task to keep this relationship moving',
      });
      setForm({ kind: 'note', title: '', body: '', person_name: '', due_date: '' }); setFile(null); setOpen(false);
      onSaved();
    } catch {
      setError('That entry could not be saved. Try again.');
    }
    setBusy(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="mb-3 flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-editorial-copper/60 bg-white py-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-editorial-navy hover:bg-editorial-sand/50">
      <Plus className="h-3.5 w-3.5 text-editorial-copper" /> Capture
    </button>
  );

  return (
    <div className="mb-3 rounded border border-editorial-copper/50 bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="pd-label">Capture into the Inbox</p>
        <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4 text-editorial-navy/60" /></button>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {KINDS.map((k) => (
          <button key={k} onClick={() => setForm((f) => ({ ...f, kind: k }))}
            className={`rounded py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] ${form.kind === k ? 'bg-editorial-navy text-editorial-cream' : 'border border-editorial-navy/15 text-editorial-navy'}`}>{k}</button>
        ))}
      </div>
      <input className={field} placeholder="Title" value={form.title} onChange={set('title')} />
      <input className={field} placeholder="Who is it with? (optional)" value={form.person_name} onChange={set('person_name')} />
      <textarea className={field} rows={3} placeholder="Notes, context, where the conversation stands" value={form.body} onChange={set('body')} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-editorial-navy/15 px-2.5 py-1.5 font-body text-xs text-editorial-navy">
          <Paperclip className="h-3.5 w-3.5" /> {file ? file.name : 'Attach a file'}
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        <label className="font-body text-xs text-editorial-navy">Follow up <input type="date" className="ml-1 rounded border border-editorial-navy/15 px-1.5 py-1" value={form.due_date} onChange={set('due_date')} /></label>
      </div>
      <label className="mt-2 flex items-center gap-2 font-body text-xs text-editorial-navy">
        <input type="checkbox" checked={ask} onChange={(e) => setAsk(e.target.checked)} /> Ask my Superagent for the next action
      </label>
      {error && <p className="mt-2 font-body text-xs text-destructive">{error}</p>}
      <button disabled={busy} onClick={save} className="mt-3 inline-flex items-center gap-1 rounded bg-editorial-copper px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-cream disabled:opacity-50">
        {busy && <Loader2 className="h-3 w-3 animate-spin" />} File it
      </button>
    </div>
  );
}
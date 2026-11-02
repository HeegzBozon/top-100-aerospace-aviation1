import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Write a release note (platform, admins) or a status update (personal), as draft or released.
export default function ReleaseNoteComposer({ user, scope, season, onSaved }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (status) => {
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.StatusUpdate.create({
      title: title.trim(), body: body.trim(), scope, status, season_name: season.name,
      author_name: user.full_name, released_at: status === 'released' ? new Date().toISOString() : undefined,
    });
    setSaving(false); setTitle(''); setBody(''); onSaved();
  };

  return (
    <div className="mb-3 rounded border border-editorial-navy/10 bg-white p-2.5">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={scope === 'platform' ? 'Release note headline' : 'Status update headline'} className="w-full bg-transparent font-heading text-base text-editorial-navy outline-none" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="What shipped, what changed, what is next." className="mt-1 w-full resize-none bg-transparent font-body text-sm text-editorial-navy outline-none" />
      <div className="flex justify-end gap-2">
        <button disabled={saving || !title.trim()} onClick={() => save('draft')} className="rounded border border-editorial-navy/20 px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-navy disabled:opacity-40">Save draft</button>
        <button disabled={saving || !title.trim()} onClick={() => save('released')} className="flex items-center gap-1 rounded bg-editorial-copper px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-cream disabled:opacity-40">{saving && <Loader2 className="h-3 w-3 animate-spin" />}Release</button>
      </div>
    </div>
  );
}
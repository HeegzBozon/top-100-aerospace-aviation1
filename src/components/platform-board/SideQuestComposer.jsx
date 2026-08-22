import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Community-proposed side quests. Creates a backlog RoadmapItem attributed to the submitter.
export default function SideQuestComposer({ user, accent, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !user?.email) return;
    setBusy(true);
    try {
      await base44.entities.RoadmapItem.create({
        title: title.trim(),
        description: desc.trim(),
        value_stream: 'developmental',
        status: 'backlog',
        type: 'feedback',
        submitter_email: user.email,
      });
      setTitle('');
      setDesc('');
      setOpen(false);
      onSubmitted?.();
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] text-white" style={{ background: accent }}>
        <Plus className="w-3.5 h-3.5" /> Propose a side quest
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl p-3" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Side quest title"
        maxLength={120}
        className="w-full text-sm font-semibold px-3 py-2 rounded-lg mb-2 outline-none"
        style={{ border: `1px solid ${B.border}`, background: '#fff', color: B.navy }}
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="What should the community build, and why does it matter?"
        rows={3}
        className="w-full text-xs px-3 py-2 rounded-lg mb-2 outline-none resize-y"
        style={{ border: `1px solid ${B.border}`, background: '#fff', color: B.navy }}
      />
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => { setOpen(false); setTitle(''); setDesc(''); }} className="text-[11px] font-semibold px-2" style={{ color: B.muted }}>Cancel</button>
        <button onClick={submit} disabled={busy || !title.trim()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: accent }}>
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Submit
        </button>
      </div>
    </div>
  );
}
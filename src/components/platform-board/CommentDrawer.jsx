import { useEffect, useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Right-edge discussion drawer for a single RoadmapItem. Reads/writes PlanningActivity.
export default function CommentDrawer({ item, user, accent, onClose, onChanged }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    if (!item) return;
    setLoading(true);
    base44.entities.PlanningActivity.filter({ item_entity: 'RoadmapItem', item_id: item.id }, '-created_date', 100)
      .then((r) => setComments(r || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [item]);

  const submit = async () => {
    if (!text.trim() || !user?.email) return;
    setBusy(true);
    try {
      await base44.entities.PlanningActivity.create({
        item_entity: 'RoadmapItem',
        item_id: item.id,
        activity_type: 'comment',
        content: text.trim(),
        author_email: user.email,
        author_name: user.full_name,
      });
      await base44.entities.RoadmapItem.update(item.id, { comments_count: (item.comments_count || 0) + 1 });
      setText('');
      load();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: B.border }}>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>Discussion</p>
            <p className="text-sm font-semibold truncate" style={{ color: B.navy }}>{item.title}</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4" style={{ color: B.muted }} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" style={{ color: B.muted }} /></div>
          ) : comments.length === 0 ? (
            <div className="rounded-xl p-6 text-center" style={{ border: `1px dashed ${B.border}`, background: B.cream }}>
              <p className="text-xs italic" style={{ color: B.muted }}>No discussion yet. Start the conversation.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-lg p-3" style={{ background: B.cream }}>
                <p className="text-[11px] font-semibold mb-1" style={{ color: B.navy }}>{c.author_name || c.author_email || 'Fellow'}</p>
                <p className="text-xs leading-snug whitespace-pre-wrap" style={{ color: B.navy }}>{c.content}</p>
              </div>
            ))
          )}
        </div>

        {user?.email ? (
          <div className="p-4 border-t flex items-center gap-2" style={{ borderColor: B.border }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              placeholder="Add a comment…"
              className="flex-1 text-sm px-3 py-2 rounded-full outline-none"
              style={{ border: `1px solid ${B.border}`, color: B.navy }}
            />
            <button onClick={submit} disabled={busy || !text.trim()} className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white disabled:opacity-60" style={{ background: accent }}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t text-center text-xs italic" style={{ borderColor: B.border, color: B.muted }}>Sign in to join the discussion.</div>
        )}
      </div>
    </div>
  );
}
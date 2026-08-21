import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, Pencil, X, Loader2, Send, Check } from 'lucide-react';
import RailBlock from '@/components/fellow-home/RailBlock';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Textarea } from '@/components/ui/textarea';

// Fellow-authored bulletins, visible community-wide. Full CRUD.
export default function CommunityBulletinsRail({ user, accent }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await base44.entities.Bulletin.filter({ scope: 'network' }, '-created_date', 8);
      setItems(res || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const unsub = base44.entities.Bulletin.subscribe((e) => {
      if (e.data?.scope !== 'platform') load();
    });
    return unsub;
  }, []);

  const openCompose = () => {
    setTitle('');
    setBody('');
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (b) => {
    setTitle(b.title || '');
    setBody(b.body || '');
    setEditing(b);
    setOpen(true);
  };

  const submit = async () => {
    if (!title.trim() && !body.trim()) return;
    setBusy(true);
    try {
      if (editing) {
        await base44.entities.Bulletin.update(editing.id, {
          title: title.trim().slice(0, 120),
          body: body.trim().slice(0, 1000),
        });
      } else {
        await base44.entities.Bulletin.create({
          author_email: user.email,
          author_name: user.full_name,
          author_avatar_url: user.avatar_url || '',
          scope: 'network',
          title: title.trim().slice(0, 120),
          body: body.trim().slice(0, 1000),
        });
      }
      setOpen(false);
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setItems((i) => i.filter((x) => x.id !== id));
    await base44.entities.Bulletin.delete(id).catch(() => {});
  };

  const isOwn = (b) => b.author_email === user?.email;

  return (
    <>
      <RailBlock title="Community Bulletins" accent={accent}>
        <div className="space-y-2.5">
          <button onClick={openCompose} className="w-full text-left text-[11px] italic px-2.5 py-1.5 rounded-md transition-colors hover:bg-black/[0.03]" style={{ color: B.muted, border: `1px dashed ${B.border}` }}>
            Post a bulletin…
          </button>
          {loading ? (
            <p className="text-[11px]" style={{ color: B.muted }}>Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-[11px] leading-snug" style={{ color: B.muted }}>No community bulletins yet.</p>
          ) : (
            items.map((b) => (
              <div key={b.id} className="group flex items-start gap-2">
                <Megaphone className="w-3 h-3 mt-0.5 shrink-0" style={{ color: accent }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold leading-snug" style={{ color: B.navy }}>
                    {b.author_name?.split(' ')[0] || 'Fellow'}{b.title ? ` · ${b.title}` : ''}
                  </p>
                  {b.body && <p className="text-[11px] leading-snug line-clamp-2" style={{ color: B.muted }}>{b.body}</p>}
                </div>
                {isOwn(b) && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(b)} style={{ color: B.muted }}><Pencil className="w-3 h-3" /></button>
                    <button onClick={() => remove(b.id)} style={{ color: B.muted }}><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </RailBlock>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>{editing ? 'Edit bulletin' : 'New bulletin'}</h3>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4" style={{ color: B.muted }} /></button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Subject"
              maxLength={120}
              className="w-full text-sm font-semibold px-3 py-2 rounded-lg mb-2 outline-none"
              style={{ border: `1px solid ${B.border}`, color: B.navy }}
            />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a bulletin..." maxLength={1000} rows={4} className="text-sm mb-3" />
            <button
              onClick={submit}
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
              style={{ background: B.navy }}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editing ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />} {editing ? 'Save' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
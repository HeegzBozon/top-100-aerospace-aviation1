import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, Loader2, Send, X, Pencil, Check } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Textarea } from '@/components/ui/textarea';
import { useMyConnections } from '@/components/fellow-home/useConnections';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Avatar({ src, name }) {
  return src ? (
    <img src={src} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold" style={{ background: `${B.navy}14`, color: B.navy }}>
      {name?.charAt(0) || '?'}
    </div>
  );
}

export default function BulletinsModule({ user, accent }) {
  const { accepted } = useMyConnections(user?.email);

  // Network feed: the owner + everyone they're connected with.
  const emails = useMemo(() => {
    const set = new Set([user?.email].filter(Boolean));
    (accepted || []).forEach((c) => {
      set.add(c.requester_email === user.email ? c.recipient_email : c.requester_email);
    });
    return [...set];
  }, [accepted, user?.email]);

  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  // Edit state (CRUD)
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);

  const emailsKey = emails.join(',');

  const load = async () => {
    if (!emails.length) return;
    setLoading(true);
    setError(false);
    try {
      const res = await base44.entities.Bulletin.filter({ author_email: { $in: emails } }, '-created_date', 30);
      setBulletins((res || []).filter((b) => b.scope !== 'platform'));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [emailsKey]);

  useEffect(() => {
    const unsub = base44.entities.Bulletin.subscribe((event) => {
      if (event.data?.scope === 'platform') return;
      if (event.type === 'create') {
        if (emails.includes(event.data?.author_email)) {
          setBulletins((b) => [event.data, ...b].slice(0, 30));
        }
      }
      if (event.type === 'update') {
        setBulletins((b) => b.map((x) => (x.id === event.data?.id ? event.data : x)));
      }
      if (event.type === 'delete') {
        setBulletins((b) => b.filter((x) => x.id !== event.data?.id));
      }
    });
    return unsub;
  }, [emailsKey]);

  const post = async () => {
    if (!title.trim() && !body.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Bulletin.create({
        author_email: user.email,
        author_name: user.full_name,
        author_avatar_url: user.avatar_url || '',
        scope: 'network',
        title: title.trim().slice(0, 120),
        body: body.trim().slice(0, 1000),
      });
      setTitle('');
      setBody('');
      setComposing(false);
    } catch {
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditTitle(b.title || '');
    setEditBody(b.body || '');
  };

  const saveEdit = async () => {
    if (!editTitle.trim() && !editBody.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Bulletin.update(editingId, {
        title: editTitle.trim().slice(0, 120),
        body: editBody.trim().slice(0, 1000),
      });
      setEditingId(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setBulletins((b) => b.filter((x) => x.id !== id));
    await base44.entities.Bulletin.delete(id).catch(() => {});
  };

  const isOwn = (b) => b.author_email === user?.email;

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] flex items-center gap-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          <Megaphone className="w-4 h-4" style={{ color: accent }} /> Bulletins
        </h2>
        <span className="text-[11px]" style={{ color: B.muted }}>from your network</span>
      </div>

      <div className="px-5 py-4 space-y-3">
        {composing && (
          <div className="space-y-2 pb-3" style={{ borderBottom: `1px solid ${B.border}` }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Subject"
              maxLength={120}
              className="w-full text-sm font-semibold bg-transparent outline-none"
              style={{ color: B.navy }}
            />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a bulletin..." maxLength={1000} rows={3} className="text-sm" />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setComposing(false)} disabled={posting} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={post} disabled={posting} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Post
              </button>
            </div>
          </div>
        )}

        {!composing && (
          <button onClick={() => setComposing(true)} className="w-full text-left text-xs italic px-3 py-2 rounded-lg transition-colors hover:bg-black/[0.03]" style={{ color: B.muted, border: `1px dashed ${B.border}` }}>
            Post a bulletin to your network…
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" style={{ color: B.muted }} /></div>
        ) : error ? (
          <p className="text-xs text-center py-4" style={{ color: B.muted }}>Couldn't load bulletins.</p>
        ) : bulletins.length === 0 ? (
          <div className="py-6 text-center">
            <Megaphone className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: B.navy }} />
            <p className="text-xs" style={{ color: B.muted }}>No bulletins yet.</p>
            <p className="text-[11px] mt-1" style={{ color: B.muted }}>Posts from you and your connections will appear here.</p>
          </div>
        ) : (
          bulletins.map((b) => (
            <article key={b.id} className="group flex gap-3 pb-3" style={{ borderBottom: `1px solid ${B.border}` }}>
              <Avatar src={b.author_avatar_url} name={b.author_name} />
              <div className="min-w-0 flex-1">
                {editingId === b.id ? (
                  <div className="space-y-2">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Subject"
                      maxLength={120}
                      className="w-full text-sm font-semibold bg-transparent outline-none"
                      style={{ color: B.navy }}
                    />
                    <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} maxLength={1000} rows={3} className="text-sm" />
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingId(null)} disabled={saving} className="text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-1 hover:opacity-70" style={{ color: B.muted }}>
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button onClick={saveEdit} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60" style={{ background: B.navy }}>
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-xs font-semibold truncate" style={{ color: B.navy }}>{b.author_name || 'Fellow'}</span>
                      <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: B.muted }}>{timeAgo(b.created_date)}</span>
                    </div>
                    {b.title && <h3 className="text-sm font-bold mb-0.5" style={{ color: B.navy }}>{b.title}</h3>}
                    {b.body && <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{b.body}</p>}
                  </>
                )}
              </div>
              {isOwn(b) && editingId !== b.id && (
                <div className="flex flex-col gap-1 shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(b)} style={{ color: B.muted }} className="hover:opacity-70">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(b.id)} style={{ color: B.muted }} className="hover:opacity-70">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, Loader2, Send, X } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { Textarea } from '@/components/ui/textarea';

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

export default function BulletinsModule({ user, accent }) {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await base44.entities.Bulletin.filter({ author_email: user.email }, '-created_date', 20);
      setBulletins(res || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.email) load(); }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Bulletin.subscribe((event) => {
      if (event.type === 'create') setBulletins((b) => [event.data, ...b].slice(0, 20));
      if (event.type === 'delete') setBulletins((b) => b.filter((x) => x.id !== event.data?.id));
    });
    return unsub;
  }, [user?.email]);

  const post = async () => {
    if (!title.trim() && !body.trim()) return;
    setPosting(true);
    try {
      await base44.entities.Bulletin.create({
        author_email: user.email,
        author_name: user.full_name,
        author_avatar_url: user.avatar_url || '',
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

  const remove = async (id) => {
    setBulletins((b) => b.filter((x) => x.id !== id));
    await base44.entities.Bulletin.delete(id).catch(() => {});
  };

  const name = (user?.full_name || 'Fellow').split(' ')[0];

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] flex items-center gap-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          <Megaphone className="w-4 h-4" style={{ color: accent }} /> {name}'s Bulletins
        </h2>
        {!composing && (
          <button onClick={() => setComposing(true)} className="text-[11px] font-semibold uppercase tracking-[0.14em] hover:opacity-70" style={{ color: accent }}>
            Post
          </button>
        )}
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

        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" style={{ color: B.muted }} /></div>
        ) : error ? (
          <p className="text-xs text-center py-4" style={{ color: B.muted }}>Couldn't load bulletins.</p>
        ) : bulletins.length === 0 ? (
          <div className="py-6 text-center">
            <Megaphone className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: B.navy }} />
            <p className="text-xs" style={{ color: B.muted }}>No bulletins yet.</p>
            <p className="text-[11px] mt-1" style={{ color: B.muted }}>Post a short broadcast to your community.</p>
          </div>
        ) : (
          bulletins.map((b) => (
            <article key={b.id} className="group relative pb-3" style={{ borderBottom: `1px solid ${B.border}` }}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-sm font-bold" style={{ color: B.navy }}>{b.title || 'Untitled'}</h3>
                <span className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: B.muted }}>{timeAgo(b.created_date)}</span>
              </div>
              {b.body && <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{b.body}</p>}
              <button onClick={() => remove(b.id)} className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: B.muted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
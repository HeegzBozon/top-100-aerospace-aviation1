import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

function ring(child, hasStory, accent) {
  return (
    <div className="w-14 h-14 rounded-full p-[2px]" style={{ background: hasStory ? `linear-gradient(135deg, ${accent}, ${B.navy})` : B.border }}>
      <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: B.cream }}>
        {child}
      </div>
    </div>
  );
}

function avatar(src, name) {
  return src
    ? <img src={src} alt={name} className="w-full h-full object-cover" />
    : <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ background: `${B.navy}14`, color: B.navy }}>{name?.charAt(0) || '?'}</div>;
}

// My TOP 100 rail — each entry carries a story ring when that Fellow has a live story.
export default function Top100Rail({ rankings, groups = [], onOpen, accent, loading }) {
  if (loading) {
    return (
      <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${B.border}` }}>
          <div className="h-3 w-28 rounded animate-pulse" style={{ background: `${B.navy}14` }} />
        </div>
        <div className="px-5 py-4 flex gap-4 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: `${B.navy}10` }} />
              <div className="h-2 w-10 rounded animate-pulse" style={{ background: `${B.navy}14` }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!rankings.length) {
    return (
      <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${B.border}` }}>
          <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>My TOP 100</h2>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: B.muted }}>Your list is empty.</p>
          <Link to="/nominate" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
            <Plus className="w-3.5 h-3.5" /> Build your list
          </Link>
        </div>
      </section>
    );
  }

  const matchIdx = (r) => groups.findIndex((g) =>
    (r.email && g.author.email === r.email) ||
    (r.nominee_avatar && g.author.avatar && g.author.avatar === r.nominee_avatar) ||
    (g.author.name && r.nominee_name && g.author.name.trim().toLowerCase() === r.nominee_name.trim().toLowerCase())
  );

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>My TOP 100</h2>
        <Link to="/nominate" className="text-[10px] font-semibold uppercase tracking-[0.14em] hover:opacity-70" style={{ color: accent }}>Refine</Link>
      </div>
      <div className="px-5 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
        {rankings.map((r) => {
          const idx = matchIdx(r);
          const hasStory = idx >= 0;
          const content = (
            <>
              <div className="relative">
                {ring(avatar(r.nominee_avatar, r.nominee_name), hasStory, accent)}
                <span className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: B.navy, color: '#fff', border: `2px solid ${B.cream}` }}>
                  {r.rank}
                </span>
              </div>
              <span className="text-[10px] font-medium max-w-[56px] truncate text-center" style={{ color: B.navy }}>{r.nominee_name?.split(' ')[0] || 'Fellow'}</span>
            </>
          );
          return hasStory ? (
            <button key={r.nominee_id || r.rank} type="button" onClick={() => onOpen(idx)} className="flex flex-col items-center gap-1 shrink-0">
              {content}
            </button>
          ) : (
            <Link key={r.nominee_id || r.rank} to={`/profiles/${r.nominee_id}`} className="flex flex-col items-center gap-1 shrink-0">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
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

// Presentational story rail. Viewer/composer state is owned by useStoryExperience.
export default function StoriesBar({ user, accent, groups = [], onOpen, onAdd, loading }) {
  if (loading) {
    return (
      <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${B.border}` }}>
          <div className="h-3 w-20 rounded animate-pulse" style={{ background: `${B.navy}14` }} />
        </div>
        <div className="px-5 py-4 flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-14 h-14 rounded-full animate-pulse" style={{ background: `${B.navy}10` }} />
              <div className="h-2 w-10 rounded animate-pulse" style={{ background: `${B.navy}14` }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const myGroupIdx = groups.findIndex((g) => g.author.email === user?.email);
  const others = groups.filter((g) => g.author.email !== user?.email);

  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="px-5 py-3" style={{ borderBottom: `1px solid ${B.border}` }}>
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>Stories</h2>
      </div>
      <div className="px-5 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
        <button onClick={() => (myGroupIdx >= 0 ? onOpen(myGroupIdx) : onAdd())} className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative">
            {ring(avatar(user?.avatar_url, user?.full_name), myGroupIdx >= 0, accent)}
            {myGroupIdx < 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: B.navy, border: `2px solid ${B.cream}` }}>
                <Plus className="w-3 h-3" />
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium" style={{ color: B.navy }}>{myGroupIdx >= 0 ? 'Your story' : 'Add story'}</span>
        </button>

        {others.map((g) => {
          const realIdx = groups.indexOf(g);
          return (
            <button key={g.author.email} onClick={() => onOpen(realIdx)} className="flex flex-col items-center gap-1 shrink-0">
              {ring(avatar(g.author.avatar, g.author.name), true, accent)}
              <span className="text-[10px] font-medium max-w-[56px] truncate" style={{ color: B.navy }}>{g.author.name?.split(' ')[0] || 'Fellow'}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
import { B } from '@/components/fellow-home/fellowHomeConfig';

const initial = (s) => (s ? String(s).trim()[0].toUpperCase() : '?');

// Social "who's going" proof. Accepts either avatar objects ({ avatar_url,
// fellow_avatar_url, name, fellow_name, email }) or plain email strings.
// `tone="light"` for dark cover overlays; default "dark" for cream surfaces.
export default function WhosGoing({ items = [], count, hostName, accent = B.navy, max = 6, tone = 'dark', borderColor = '#fff' }) {
  const all = items || [];
  const list = all.slice(0, max);
  const total = count ?? all.length;
  const textColor = tone === 'light' ? '#fff' : B.navy;
  const fallbackBg = tone === 'light' ? '#fff' : B.sand;

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex -space-x-2">
        {list.map((a, idx) => {
          const url = typeof a === 'string' ? null : a.avatar_url || a.fellow_avatar_url;
          const label = typeof a === 'string' ? a : (a.name || a.fellow_name || a.email || '');
          return (
            <span
              key={idx}
              className="w-8 h-8 rounded-full border-2 overflow-hidden flex items-center justify-center text-[11px] font-bold"
              style={{ background: url ? 'transparent' : fallbackBg, color: B.navy, borderColor }}
            >
              {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <span>{initial(label)}</span>}
            </span>
          );
        })}
        {total > max && (
          <span
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
            style={{ background: B.navy, color: '#fff', borderColor }}
          >
            +{total - max}
          </span>
        )}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold" style={{ color: textColor }}>{total} going</span>
        {hostName && <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: accent }}>Hosted by {hostName}</span>}
      </div>
    </div>
  );
}
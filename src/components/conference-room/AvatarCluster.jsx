import { B } from '@/components/fellow-home/fellowHomeConfig';

// Overlapping avatar stack for attendance rosters. Display only — never
// measurement-bearing. Falls back to an initial chip when no avatar URL.
export default function AvatarCluster({ items = [], max = 4, size = 22, accent = B.navy }) {
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  if (shown.length === 0) return null;
  return (
    <div className="flex items-center">
      {shown.map((it, i) => (
        <span
          key={i}
          className="rounded-full overflow-hidden ring-2 ring-white shrink-0"
          style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -6, background: B.cream }}
        >
          {it.avatar_url || it.fellow_avatar_url ? (
            <img
              src={it.avatar_url || it.fellow_avatar_url}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-[9px] font-bold" style={{ background: B.cream, color: accent }}>
              {(it.name || it.fellow_name || it.email || it.fellow_email || '?')[0]}
            </span>
          )}
        </span>
      ))}
      {extra > 0 && (
        <span
          className="rounded-full flex items-center justify-center text-[9px] font-semibold ring-2 ring-white shrink-0"
          style={{ width: size, height: size, marginLeft: -6, background: B.sand, color: B.navy }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
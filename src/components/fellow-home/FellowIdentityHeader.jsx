import { BadgeCheck, MapPin, Pencil } from 'lucide-react';
import { B, coverUrl } from './fellowHomeConfig';

export default function FellowIdentityHeader({ user, nominee, accent, isOwner, onEditIdentity }) {
  const cover = coverUrl(user?.cover_key);
  const avatar = user?.avatar_url || nominee?.avatar_url;
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const verified = nominee?.verified_status && nominee.verified_status !== 'unverified';

  return (
    <header className="rounded-3xl overflow-hidden" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      {/* Cover — expressive, but structurally subordinate */}
      <div
        className="h-32 sm:h-44 relative"
        style={{
          background: cover ? `url(${cover}) center/cover` : `linear-gradient(120deg, ${B.navyDeep}, ${B.navy})`,
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(22,41,63,0.15), rgba(22,41,63,0.65))' }} />
        <div className="absolute left-0 right-0 bottom-0 h-[3px]" style={{ background: accent }} />
      </div>

      <div className="px-5 sm:px-8 pb-7">
        <div className="flex items-end gap-4 -mt-10 sm:-mt-12">
          <div
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: B.sand, border: `3px solid ${accent}`, boxShadow: '0 8px 26px rgba(22,41,63,0.18)' }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name.charAt(0)}
              </span>
            )}
          </div>

          {isOwner && (
            <button
              onClick={onEditIdentity}
              className="ml-auto mb-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-opacity hover:opacity-80"
              style={{ color: B.navy, border: `1px solid ${B.border}`, background: '#fff' }}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit identity
            </button>
          )}
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-3xl sm:text-5xl font-bold leading-none"
              style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {name}
            </h1>
            {verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: B.muted }}>
                <BadgeCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          {user?.six_word_story && (
            <p
              className="mt-4 max-w-2xl"
              style={{
                color: B.navy,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(17px, 3.4vw, 24px)',
                lineHeight: 1.45,
              }}
            >
              &ldquo;{user.six_word_story}&rdquo;
            </p>
          )}

          <div className="mt-4 flex items-center gap-4 flex-wrap text-xs" style={{ color: B.muted }}>
            {user?.one_word && (
              <span className="font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
                {user.one_word}
              </span>
            )}
            {user?.headline && <span>{user.headline}</span>}
            {user?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {user.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
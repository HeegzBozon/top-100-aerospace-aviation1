import { Sparkles, MapPin, BadgeCheck, Plus } from 'lucide-react';
import { B, coverUrl } from '@/components/fellow-home/fellowHomeConfig';

// Slide 1 — locked. Full-bleed cinematic identity: cover background, large
// avatar, name in Playfair Display, headline, one-word anchor. The portrait
// of the Fellow as an institutional artifact.
export default function IdentitySlide({ user, nominee, accent, coverKey, isOwner, onEdit, hasStory, onAvatarTap, publicPath }) {
  const cover = coverUrl(coverKey !== undefined ? coverKey : user?.cover_key);
  const avatar = user?.avatar_url || nominee?.avatar_url;
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const verified = nominee?.verified_status && nominee.verified_status !== 'unverified';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: B.navyDeep }}>
      {cover && (
        <>
          <div className="absolute inset-0" style={{ background: `url(${cover}) center/cover` }} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${B.navyDeep}AA, ${B.navyDeep}EE)` }} />
        </>
      )}

      <div className="relative z-10 text-center px-6 py-24 max-w-2xl">
        {/* Avatar */}
        {onAvatarTap ? (
          <button
            onClick={onAvatarTap}
            className="relative mx-auto block w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 mb-6"
            style={{
              background: hasStory ? `linear-gradient(135deg, ${accent}, ${B.gold})` : 'transparent',
              border: hasStory ? 'none' : `2px dashed ${accent}`,
            }}
            aria-label={hasStory ? 'View story' : 'Add story'}
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#fff' }}>
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {name.charAt(0)}
                </span>
              )}
            </div>
            {!hasStory && (
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: B.navy, border: `2px solid ${B.navyDeep}` }}>
                <Plus className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        ) : (
          <div
            className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-6 flex items-center justify-center"
            style={{ background: '#fff', border: `3px solid ${accent}` }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name.charAt(0)}
              </span>
            )}
          </div>
        )}

        {/* Name */}
        <h1
          className="text-4xl sm:text-6xl font-bold leading-none mb-3"
          style={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {name}
        </h1>

        {verified && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: B.gold }}>
            <BadgeCheck className="w-4 h-4" /> Verified
          </div>
        )}

        {/* Headline */}
        {user?.headline && (
          <p className="mt-5 text-base sm:text-lg max-w-xl mx-auto" style={{ color: `${B.cream}CC` }}>
            {user.headline}
          </p>
        )}

        {/* Location */}
        {user?.location && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm" style={{ color: `${B.cream}88` }}>
            <MapPin className="w-3.5 h-3.5" /> {user.location}
          </p>
        )}

        {/* One-word anchor */}
        {user?.one_word && (
          <p
            className="mt-8 text-2xl sm:text-3xl font-bold uppercase tracking-[0.3em]"
            style={{ color: accent, fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {user.one_word}
          </p>
        )}

        {/* Update button */}
        {isOwner && onEdit && (
          <button
            onClick={onEdit}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg"
            style={{ background: accent, color: B.navyDeep }}
          >
            <Sparkles className="w-4 h-4" /> Update profile
          </button>
        )}
      </div>
    </section>
  );
}
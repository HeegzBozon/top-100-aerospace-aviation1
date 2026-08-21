import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, ArrowRight, ListOrdered } from 'lucide-react';
import { B, coverUrl } from './fellowHomeConfig';
import FellowIdentityActions from './FellowIdentityActions';

export default function FellowIdentityHeader({ user, nominee, accent, isOwner, onEditIdentity, coverKey, sixWordStory, coverContent, publicPath }) {
  const cover = coverUrl(coverKey !== undefined ? coverKey : user?.cover_key);
  const story = sixWordStory || user?.six_word_story;
  const avatar = user?.avatar_url || nominee?.avatar_url;
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const verified = nominee?.verified_status && nominee.verified_status !== 'unverified';

  return (
    <header className="rounded-3xl overflow-hidden" style={{ background: B.sand, border: `1px solid ${B.border}` }}>
      {/* Season state — the head of the masthead. Sand flows straight into the identity body. */}
      {coverContent ? (
        coverContent
      ) : (
        <div
          className="h-32 sm:h-44 relative"
          style={{
            background: cover ? `url(${cover}) center/cover` : `linear-gradient(120deg, ${B.navyDeep}, ${B.navy})`,
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(22,41,63,0.15), rgba(22,41,63,0.65))' }} />
        </div>
      )}

      {/* Hairline — the only seam between season state and identity */}
      <div className="mx-5 sm:mx-8 h-px" style={{ background: `${B.navy}14` }} />

      <div className="px-5 sm:px-8 pb-5 pt-1.5">
        {/* Avatar + name inline — the portrait bridges the hairline, name sits beside it */}
        <div className="relative z-10 flex items-end gap-4 sm:gap-5 -mt-10 sm:-mt-12">
          <div
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: '#fff', border: `3px solid ${accent}`, boxShadow: '0 8px 26px rgba(22,41,63,0.18)' }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name.charAt(0)}
              </span>
            )}
          </div>

          <div className="pb-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-2xl sm:text-4xl font-bold leading-none"
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

            <div className="mt-2 flex items-center gap-4 flex-wrap text-xs" style={{ color: B.muted }}>
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

        {story && (
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
            &ldquo;{story}&rdquo;
          </p>
        )}

        {/* One unified toolbar: season participation left, identity management right */}
        {isOwner && (
          <div className="mt-5 pt-3 flex items-center justify-between gap-4 flex-wrap border-t" style={{ borderColor: `${B.navy}14` }}>
            <div className="flex items-center gap-5 flex-wrap">
              <Link
                to="/nominate"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
                style={{ color: B.navy }}
              >
                Enter a nomination <ArrowRight className="w-3.5 h-3.5" style={{ color: accent }} />
              </Link>
              <Link
                to="/nominate"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
                style={{ color: B.navy }}
              >
                Refine my ballot <ListOrdered className="w-3.5 h-3.5" style={{ color: accent }} />
              </Link>
            </div>
            <FellowIdentityActions
              user={user}
              publicPath={publicPath}
              accent={accent}
              onEdit={onEditIdentity}
            />
          </div>
        )}
      </div>
    </header>
  );
}
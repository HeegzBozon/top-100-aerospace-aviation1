import { BadgeCheck, MapPin, Plus } from 'lucide-react';
import { B, coverUrl } from './fellowHomeConfig';
import FellowIdentityActions from './FellowIdentityActions';

export default function FellowIdentityHeader({ user, nominee, accent, isOwner, onEditIdentity, coverKey, sixWordStory, coverContent, publicPath, hasStory, onAvatarTap, clusterContent, blurbsContent, statusKey, savingStatus, onStatusChange }) {
  const cover = coverUrl(coverKey !== undefined ? coverKey : user?.cover_key);
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
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6 -mt-10 sm:-mt-12">
          <div className="flex items-end gap-4 md:gap-6">
          {onAvatarTap ? (
            <button
              type="button"
              onClick={onAvatarTap}
              className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full p-[3px] shrink-0"
              style={{
                background: hasStory ? `linear-gradient(135deg, ${accent}, ${B.navy})` : 'transparent',
                border: hasStory ? 'none' : `3px dashed ${accent}`,
                boxShadow: '0 8px 26px rgba(22,41,63,0.18)',
              }}
              aria-label={hasStory ? 'View story' : 'Add story'}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#fff', border: '3px solid #fff' }}>
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {name.charAt(0)}
                  </span>
                )}
              </div>
              {!hasStory && (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: B.navy, border: `2px solid ${B.sand}` }}>
                  <Plus className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          ) : (
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
          )}

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
              {user?.headline && <span>{user.headline}</span>}
              {user?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.location}
                </span>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Action row — status + completeness (left) | editorial blurbs (center) | view + update (right) */}
        {(blurbsContent || isOwner) && (
          isOwner ? (
            <FellowIdentityActions
              user={user}
              publicPath={publicPath}
              accent={accent}
              onEdit={onEditIdentity}
              statusKey={statusKey}
              savingStatus={savingStatus}
              onStatusChange={onStatusChange}
              blurbs={blurbsContent}
            />
          ) : (
            <div className="mt-4 pt-4 border-t flex justify-center" style={{ borderColor: `${B.navy}14` }}>
              {blurbsContent}
            </div>
          )
        )}

        {/* Instrument cluster — stories and press live inside the masthead */}
        {clusterContent && (
          <div className="mt-5 pt-4 border-t" style={{ borderColor: `${B.navy}14` }}>
            {clusterContent}
          </div>
        )}
      </div>
    </header>
  );
}
import { useState } from 'react';
import { BadgeCheck, MapPin, Plus, Link2, Copy, Share2, Check, Sparkles, ExternalLink } from 'lucide-react';
import { B, coverUrl } from './fellowHomeConfig';
import PublicProfileCanvas from './PublicProfileCanvas';

export default function FellowIdentityHeader({ user, nominee, accent, isOwner, onEditIdentity, coverKey, sixWordStory, coverContent, publicPath, hasStory, onAvatarTap, clusterContent, statusKey, savingStatus, onStatusChange }) {
  const cover = coverUrl(coverKey !== undefined ? coverKey : user?.cover_key);
  const avatar = user?.avatar_url || nominee?.avatar_url;
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const verified = nominee?.verified_status && nominee.verified_status !== 'unverified';
  const publicUrl = publicPath ? `${window.location.origin}${publicPath}` : '';
  const [copied, setCopied] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const copyUrl = () => {
    navigator.clipboard?.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({ title: name, url: publicUrl }).catch(() => {});
    } else {
      copyUrl();
    }
  };

  const ownerMasthead = (
    <header className="rounded-3xl overflow-hidden h-full" style={{ background: B.sand, border: `1px solid ${B.border}` }}>
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

            {publicPath && (
              <div className="mt-1.5 flex items-center gap-2 max-w-full">
                <a
                  href={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium min-w-0 hover:opacity-70"
                  style={{ color: B.muted }}
                >
                  <Link2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{publicUrl}</span>
                </a>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full transition-opacity hover:opacity-70"
                  style={{ color: B.muted, background: `${B.navy}08` }}
                  aria-label="Copy profile link"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={shareUrl}
                  className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full transition-opacity hover:opacity-70"
                  style={{ color: B.muted, background: `${B.navy}08` }}
                  aria-label="Share profile"
                >
                  <Share2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* View public profile flips the masthead to the public canvas; Update opens the editor */}
          {isOwner && (
            <div className="md:ml-auto pb-1 flex items-center gap-3 shrink-0 flex-wrap">
              {publicPath && (
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ color: B.navy }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View public profile
                </button>
              )}
              <button
                onClick={onEditIdentity}
                className="group flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all hover:shadow-md"
                style={{ background: B.navy, color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = B.gold; e.currentTarget.style.color = B.navy; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = B.navy; e.currentTarget.style.color = '#fff'; }}
              >
                <Sparkles className="w-4 h-4" /> Update
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Instrument cluster — stories and press live inside the masthead */}
        {clusterContent && (
          <div className="mt-5 pt-4 border-t" style={{ borderColor: `${B.navy}14` }}>
            {clusterContent}
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div style={{ perspective: '1600px' }}>
      <div
        className="relative transition-transform duration-700 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — owner masthead. In flow to set the container height. */}
        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', pointerEvents: flipped ? 'none' : 'auto' }}>
          {ownerMasthead}
        </div>
        {/* Back — public canvas. Absolute over the front; pointer-dead when not flipped. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: flipped ? 'auto' : 'none',
          }}
        >
          <PublicProfileCanvas
            user={user}
            nominee={nominee}
            accent={accent}
            sixWordStory={sixWordStory}
            publicPath={publicPath}
            onBack={() => setFlipped(false)}
          />
        </div>
      </div>
    </div>
  );
}
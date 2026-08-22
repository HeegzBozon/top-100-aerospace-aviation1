import { ArrowLeft, BadgeCheck, MapPin, Copy, Share2, Check, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';
import { useState } from 'react';
import { B, coverUrl } from './fellowHomeConfig';

// Screen one of the public profile journey — a purpose-built editorial canvas,
// distinct from the owner masthead. Authority-first; no owner controls.
// Reached by flipping the masthead from the owner view.
export default function PublicProfileCanvas({ user, nominee, accent, sixWordStory, publicPath, onBack }) {
  const cover = coverUrl(user?.cover_key);
  const avatar = user?.avatar_url || nominee?.avatar_url;
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const verified = nominee?.verified_status && nominee.verified_status !== 'unverified';
  const story = sixWordStory || nominee?.six_word_story;

  const socials = [
    nominee?.linkedin_profile_url && { icon: Linkedin, url: nominee.linkedin_profile_url, label: 'LinkedIn' },
    nominee?.instagram_url && { icon: Instagram, url: nominee.instagram_url, label: 'Instagram' },
    nominee?.youtube_url && { icon: Youtube, url: nominee.youtube_url, label: 'YouTube' },
    nominee?.website_url && { icon: Globe, url: nominee.website_url, label: 'Website' },
  ].filter(Boolean);

  const publicUrl = publicPath ? `${window.location.origin}${publicPath}` : '';
  const [copied, setCopied] = useState(false);
  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard?.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  const shareUrl = () => {
    if (!publicUrl) return;
    if (navigator.share) navigator.share({ title: name, url: publicUrl }).catch(() => {});
    else copyUrl();
  };

  return (
    <div className="rounded-3xl overflow-hidden h-full" style={{ background: B.navyDeep, color: '#fff' }}>
      {/* Editorial cover band */}
      <div
        className="relative h-40 sm:h-52"
        style={{ background: cover ? `url(${cover}) center/cover` : `linear-gradient(120deg, ${B.navyDeep}, ${B.navy})` }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(22,41,63,0.25), rgba(22,41,63,0.88))' }} />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.gold }}>
            Public Profile
          </span>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}
            >
              <ArrowLeft className="w-3 h-3" /> Back to editor
            </button>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-8 pb-7 -mt-14 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ border: `3px solid ${accent}`, background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.35)' }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name}
              </h1>
              {verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: B.gold }}>
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 flex-wrap text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>
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
          <p className="mt-6 text-lg sm:text-2xl italic leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            “{story}”
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              aria-label={s.label}
            >
              <s.icon className="w-4 h-4" />
            </a>
          ))}
          {publicUrl && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={copyUrl}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                aria-label="Copy profile link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={shareUrl}
                className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                aria-label="Share profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
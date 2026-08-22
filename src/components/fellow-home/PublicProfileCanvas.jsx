import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, Copy, Share2, Check, Linkedin, Instagram, Youtube, Globe } from 'lucide-react';
import { B, coverUrl } from './fellowHomeConfig';

// Screen one of the public profile journey — the front of the business card.
// Editorial, authority-first; the deep-link CTA fades cinematically into the full page.
export default function PublicProfileCanvas({ user, nominee, accent, sixWordStory, publicPath, onBack }) {
  const navigate = useNavigate();
  const [departing, setDeparting] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const seeFullProfile = () => {
    if (!publicPath) return;
    setDeparting(true);
    setTimeout(() => navigate(publicPath), 620);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden h-full" style={{ background: B.navyDeep, color: '#fff' }}>
      {/* Cinematic cover band */}
      <div
        className="relative h-56 sm:h-64"
        style={{ background: cover ? `url(${cover}) center/cover` : `linear-gradient(125deg, ${B.navyDeep}, ${B.navy})` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(22,41,63,0.30) 0%, rgba(22,41,63,0.55) 45%, rgba(22,41,63,0.97) 100%)' }}
        />
        <div className="absolute inset-x-5 top-5 flex items-center justify-between z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: B.gold }}>
            Public Profile
          </span>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}
            >
              <ArrowLeft className="w-3 h-3" /> Back to editor
            </button>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-10 pb-9 -mt-16 sm:-mt-20 relative z-10">
        {/* Portrait + identity */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
            style={{ border: `3px solid ${accent}`, background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.45)' }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-5xl font-bold leading-[0.95]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {name}
              </h1>
              {verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.gold }}>
                  <BadgeCheck className="w-4 h-4" /> Verified
                </span>
              )}
            </div>
            <div className="mt-2.5 flex items-center gap-4 flex-wrap text-[13px]" style={{ color: 'rgba(255,255,255,0.74)' }}>
              {user?.headline && <span>{user.headline}</span>}
              {user?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Gold rule — the only seam before the pull-quote */}
        <div className="mt-8 h-px w-full" style={{ background: `linear-gradient(90deg, ${B.gold}, transparent 85%)` }} />

        {/* Hero pull-quote — the emotional center of the card */}
        {story && (
          <p
            className="mt-7 text-2xl sm:text-[2rem] italic leading-[1.2]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            “{story}”
          </p>
        )}

        {/* Deep-link CTA — the dive into the full journey */}
        <div className="mt-8 flex items-center gap-3 flex-wrap">
          {publicPath && (
            <button
              onClick={seeFullProfile}
              className="group inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg"
              style={{ background: accent, color: B.navy }}
            >
              See full profile
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          )}
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80"
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
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                aria-label="Copy profile link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={shareUrl}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                aria-label="Share profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cinematic departure — full-screen fade into the full profile page */}
      {departing && (
        <div className="ppc-fade fixed inset-0 z-[200] pointer-events-none" style={{ background: B.navyDeep }} />
      )}
    </div>
  );
}
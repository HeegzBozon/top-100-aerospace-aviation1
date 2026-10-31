import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, ArrowRight, Linkedin, Globe, Instagram, Youtube } from 'lucide-react';
import { coverUrl } from '@/components/fellow-home/fellowHomeConfig';
import { DISCIPLINE_LABELS } from '@/components/profile/intent/intentConfig';

const LINKS = [
  { field: 'linkedin_profile_url', label: 'LinkedIn', Icon: Linkedin },
  { field: 'website_url', label: 'Website', Icon: Globe },
  { field: 'instagram_url', label: 'Instagram', Icon: Instagram },
  { field: 'youtube_url', label: 'YouTube', Icon: Youtube },
];

// The masthead of the public record. Who this is, set as an institutional plate:
// the cover is the only image behind the type, the portrait is framed in copper,
// and the name is the one thing lit on the field. Nothing here is reorderable —
// the identity header holds position one on every profile.
export default function PublicProfileHero({ user, nominee, settings, accent, enquiryLabel, onEnquire }) {
  const name = user?.full_name || nominee?.name || 'Unnamed Fellow';
  const cover = coverUrl(settings?.cover_asset_id || user?.cover_key);
  const portrait = user?.avatar_url || nominee?.avatar_url || nominee?.photo_url || '';
  const standing = [
    user?.headline || nominee?.title || nominee?.professional_role,
    nominee?.company || nominee?.organization,
  ]
    .filter(Boolean)
    .join(' · ');
  const place = nominee?.location || nominee?.country || user?.location || '';
  const discipline = DISCIPLINE_LABELS[nominee?.discipline] || nominee?.industry || '';
  const oneWord = user?.one_word || '';
  const sixWord = settings?.six_word_story || user?.six_word_story || nominee?.six_word_story || '';
  const verified = nominee?.verified_status && nominee?.verified_status !== 'unverified';
  const links = LINKS.map((link) => ({ ...link, url: nominee?.[link.field] })).filter((link) => !!link.url);

  return (
    <header className="relative overflow-hidden bg-editorial-navy">
      {cover && (
        <img src={cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,58,90,0.60) 0%, rgba(22,41,63,0.92) 54%, #16293f 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 pb-16 pt-6 lg:px-14 lg:pb-24 lg:pt-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] text-editorial-cream/45"
        >
          <Link to="/" className="transition-colors hover:text-editorial-gold">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/Top100Women2025" className="transition-colors hover:text-editorial-gold">Directory</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-editorial-cream/70">{name}</span>
        </nav>

        <div className="pd-rise mt-12 flex flex-col gap-9 lg:mt-16 lg:flex-row lg:items-end lg:gap-16">
          <div
            className="h-[210px] w-[168px] shrink-0 overflow-hidden bg-editorial-cream sm:h-[260px] sm:w-[208px] lg:h-[320px] lg:w-[256px]"
            style={{ border: `2px solid ${accent}`, boxShadow: '0 30px 60px -24px rgba(4,9,18,0.85)' }}
          >
            {portrait ? (
              <img src={portrait} alt={`${name} portrait`} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-heading text-[64px] text-editorial-navy/60">
                {name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="h-[2px] w-24 bg-editorial-copper lg:w-40" />
            {discipline && (
              <p className="mt-5 font-body text-[10px] font-semibold uppercase tracking-[0.26em] text-editorial-gold/85">
                {discipline}
              </p>
            )}
            <h1 className="mt-3 font-heading text-[2.5rem] leading-[0.98] text-editorial-cream sm:text-[3.2rem] lg:text-[4.1rem]">
              {name}
            </h1>

            {standing && (
              <p className="mt-5 max-w-xl font-body text-[11.5px] uppercase leading-relaxed tracking-[0.18em] text-editorial-cream/70 lg:text-[12.5px]">
                {standing}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {place && (
                <span className="inline-flex items-center gap-1.5 font-body text-[11.5px] tracking-[0.08em] text-editorial-cream/50">
                  <MapPin className="h-3.5 w-3.5" /> {place}
                </span>
              )}
              {verified && (
                <span className="inline-flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-gold">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified record
                </span>
              )}
              {oneWord && (
                <span className="border border-editorial-gold/40 px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.3em] text-editorial-gold">
                  {oneWord}
                </span>
              )}
            </div>

            {sixWord && (
              <p className="mt-7 max-w-xl font-heading text-[19px] italic leading-snug text-editorial-cream/80 lg:text-[23px]">
                &ldquo;{sixWord}&rdquo;
              </p>
            )}

            {(onEnquire || links.length > 0) && (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {onEnquire && (
                  <button
                    type="button"
                    onClick={onEnquire}
                    className="inline-flex items-center gap-2 bg-editorial-copper px-6 py-3 font-body text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
                  >
                    {enquiryLabel} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
                {links.map(({ field, label, Icon, url }) => (
                  <a
                    key={field}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-editorial-cream/25 px-3 py-2.5 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-cream/65 transition-colors hover:border-editorial-gold hover:text-editorial-gold"
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
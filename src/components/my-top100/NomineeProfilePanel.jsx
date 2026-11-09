import {
  X, Check, Award, BadgeCheck, Globe, Linkedin, Instagram, Youtube,
  MapPin, Building2, Briefcase,
} from 'lucide-react';
import HonoreeChips from '@/components/voting/HonoreeChips';
import { candidateName } from '@/lib/candidateName';

// One record, opened over the roll.
//
// A popover inside the sheet rather than a screen of its own: the reading stays behind it
// and the sheet's own plate and foot stay where they are, so a reader who opens a name has
// not left the directory — the record is a card laid on top of it, and dismissing it puts
// the roll back exactly where it stood. That is the whole reason for the layer: on the
// glass a second full screen reads as a second place, and the way back has to be found
// again.
//
// Read as a printed card: the portrait plate, the name, what they do, the volumes they are
// on the record for, then the record itself in the order a reader asks for it. The action
// sits at the foot where a thumb reaches it.
export default function NomineeProfilePanel({ nominee, onBack, onNominate, isAdded }) {
  const avatar = nominee.avatar_url || nominee.photo_url;
  const verified = nominee.verified_status === 'fully_verified';
  const subtitle = nominee.title || nominee.professional_role || nominee.organization || '';
  const hasSocials =
    nominee.linkedin_profile_url || nominee.instagram_url || nominee.youtube_url || nominee.website_url;

  const socials = [
    { key: 'linkedin', url: nominee.linkedin_profile_url, label: 'LinkedIn', Icon: Linkedin },
    { key: 'instagram', url: nominee.instagram_url, label: 'Instagram', Icon: Instagram },
    { key: 'youtube', url: nominee.youtube_url, label: 'YouTube', Icon: Youtube },
    { key: 'website', url: nominee.website_url, label: 'Website', Icon: Globe },
  ].filter((entry) => entry.url);

  const sections = [
    { key: 'description', label: 'Summary', body: nominee.description },
    { key: 'bio', label: 'Biography', body: nominee.bio, pre: true },
    { key: 'impact', label: 'Impact', body: nominee.impact_summary },
  ].filter((section) => section.body);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={`${candidateName(nominee)} — record`}
      className="relative z-10 flex max-h-full w-full max-w-[430px] flex-col overflow-hidden border border-editorial-copper/50 bg-editorial-cream shadow-[0_24px_60px_-24px_rgba(3,8,15,0.75)] md:rounded-[10px]"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-editorial-navy/10 bg-editorial-cream px-4 py-2">
        <p className="pd-label min-w-0 flex-1 truncate text-[8px]">The record</p>
        {verified && (
          <span className="flex items-center gap-1 rounded-full border border-editorial-copper px-2 py-[3px] font-body text-[8px] font-bold uppercase tracking-[0.12em] text-editorial-label">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            Verified
          </span>
        )}
        <button
          type="button"
          onClick={onBack}
          aria-label="Close the record"
          className="flex h-7 w-7 shrink-0 items-center justify-center border border-editorial-navy/20 text-editorial-navy/60 transition-colors hover:bg-editorial-navy hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="h-16 w-16 shrink-0 overflow-hidden border border-editorial-copper/40 bg-editorial-navy">
            {avatar ? (
              <img src={avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-heading text-xl text-editorial-cream">
                {candidateName(nominee)?.[0]?.toUpperCase() || '·'}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[19px] leading-tight text-editorial-navy">{candidateName(nominee)}</h2>
            {subtitle && (
              <p className="mt-0.5 font-body text-[11px] leading-snug text-editorial-navy/60">{subtitle}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-body text-[9.5px] text-editorial-navy/50">
              {nominee.company && (
                <span className="flex items-center gap-1"><Building2 className="h-2.5 w-2.5" aria-hidden="true" />{nominee.company}</span>
              )}
              {nominee.country && (
                <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" aria-hidden="true" />{nominee.country}</span>
              )}
              {nominee.discipline && (
                <span className="flex items-center gap-1"><Briefcase className="h-2.5 w-2.5" aria-hidden="true" />{nominee.discipline.replace(/_/g, ' ')}</span>
              )}
            </div>
            <HonoreeChips nominee={nominee} size="lg" className="mt-1.5" />
          </div>
        </div>

        {sections.map((section) => (
          <div key={section.key} className="mt-4 border-t border-editorial-navy/10 pt-2.5">
            <h3 className="pd-label text-[8px]">{section.label}</h3>
            <p
              className={`mt-1 font-body text-[11.5px] leading-relaxed text-editorial-navy/75 ${
                section.pre ? 'whitespace-pre-line' : ''
              }`}
            >
              {section.body}
            </p>
          </div>
        ))}

        {nominee.skills?.length > 0 && (
          <div className="mt-4 border-t border-editorial-navy/10 pt-2.5">
            <h3 className="pd-label text-[8px]">Skills</h3>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {nominee.skills.slice(0, 12).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-editorial-navy/20 px-2 py-[3px] font-body text-[9.5px] font-semibold leading-none text-editorial-navy/70"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasSocials && (
          <div className="mt-4 border-t border-editorial-navy/10 pt-2.5">
            <h3 className="pd-label text-[8px]">Links</h3>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {socials.map(({ key, url, label, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full border border-editorial-navy/20 px-2 py-[3px] font-body text-[9.5px] font-semibold leading-none text-editorial-navy/70 transition-colors hover:border-editorial-copper hover:text-editorial-label focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
                >
                  <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="shrink-0 border-t border-editorial-navy/10 px-4 py-2.5">
        <button
          type="button"
          onClick={() => !isAdded && onNominate(nominee)}
          disabled={isAdded}
          className={`flex w-full items-center justify-center gap-1.5 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-navy ${
            isAdded
              ? 'cursor-default border border-editorial-copper/40 text-editorial-label'
              : 'border border-editorial-copper bg-editorial-copper text-editorial-cream hover:bg-editorial-label'
          }`}
        >
          {isAdded ? (
            <><Check className="h-3 w-3" aria-hidden="true" />Already on your Top 100</>
          ) : (
            <><Award className="h-3 w-3" aria-hidden="true" />Nominate</>
          )}
        </button>
      </footer>
    </section>
  );
}
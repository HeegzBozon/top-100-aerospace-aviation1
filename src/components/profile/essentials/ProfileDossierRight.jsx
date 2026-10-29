import { Globe, Instagram, Linkedin, Youtube } from 'lucide-react';
import DossierSection from './DossierSection';

// The right column: the plate image, then the shorter facts — competencies,
// affiliations, and the keys out to where the Fellow publishes.
const PLATE =
  'https://media.base44.com/images/public/68996845be6727838fdb822e/6611efc20_generated_78a71ceb.jpg';

const Empty = ({ children }) => (
  <p className="font-body text-sm italic text-editorial-navy/50">{children}</p>
);

export default function ProfileDossierRight({ nominee }) {
  const skills = Array.isArray(nominee?.skills) ? nominee.skills.filter(Boolean) : [];
  const affiliations = Array.isArray(nominee?.affiliations)
    ? nominee.affiliations.filter(Boolean)
    : [];

  const keys = [
    { href: nominee?.linkedin_profile_url, label: 'LinkedIn', Icon: Linkedin },
    { href: nominee?.website_url, label: 'Website', Icon: Globe },
    { href: nominee?.instagram_url, label: 'Instagram', Icon: Instagram },
    { href: nominee?.youtube_url, label: 'YouTube', Icon: Youtube },
  ].filter((key) => key.href);

  return (
    <div>
      <img
        src={nominee?.avatar_url || nominee?.photo_url || PLATE}
        alt=""
        aria-hidden="true"
        className="pd-pic mb-14 h-[240px] w-full object-cover lg:h-[340px]"
      />

      <DossierSection label="Competencies" delay={0.55}>
        {skills.length === 0 ? (
          <Empty>No competencies listed yet.</Empty>
        ) : (
          <div className="flex flex-wrap gap-3.5">
            {skills.map((skill) => (
              <span key={skill} className="pd-chip px-4 py-2">
                {skill}
              </span>
            ))}
          </div>
        )}
      </DossierSection>

      <DossierSection label="Affiliations" delay={0.7}>
        {affiliations.length === 0 ? (
          <Empty>No affiliations on record yet.</Empty>
        ) : (
          <ul className="space-y-3">
            {affiliations.map((item) => (
              <li
                key={item}
                className="font-body text-[14px] leading-relaxed text-editorial-navy/80"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </DossierSection>

      <DossierSection label="Links" delay={0.85}>
        {keys.length === 0 ? (
          <Empty>No links on record yet.</Empty>
        ) : (
          <div className="flex gap-[18px]">
            {keys.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
                className="pd-soc flex h-12 w-12 items-center justify-center rounded-full"
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </a>
            ))}
          </div>
        )}
      </DossierSection>
    </div>
  );
}
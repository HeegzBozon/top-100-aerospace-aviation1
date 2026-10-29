import { BadgeCheck } from 'lucide-react';

// The navy masthead: the portrait set in a copper frame, the name in the house
// serif, and the one line that places them. The field behind it is a deep navy
// scrim over the cover plate, so the type is the only thing lit.
const COVER =
  'https://media.base44.com/images/public/68996845be6727838fdb822e/74c140c8e_generated_6d1c73ba.jpg';
const PORTRAIT =
  'https://media.base44.com/images/public/68996845be6727838fdb822e/d8b9fe55f_generated_74346f1f.jpg';

export default function ProfileHero({ user, nominee, settings, verificationLabel }) {
  const name = nominee?.name || user?.full_name || 'Your record';
  const role = nominee?.title || nominee?.professional_role || '';
  const org = nominee?.company || nominee?.organization || '';
  const place = nominee?.country || nominee?.location || '';
  const portrait = nominee?.avatar_url || nominee?.photo_url || PORTRAIT;
  const sixWord = settings?.six_word_story || user?.six_word_story || '';

  const standing = [role, org].filter(Boolean).join(' · ');

  return (
    <header className="relative flex min-h-[560px] items-end overflow-hidden px-6 pb-20 lg:min-h-[900px] lg:px-40 lg:pb-[90px]">
      <img src={COVER} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(30,58,90,0.55) 0%, rgba(30,58,90,0.88) 100%)',
        }}
      />

      <div className="pd-rise relative flex w-full flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
        <img
          src={portrait}
          alt={nominee?.name ? `${nominee.name} portrait` : 'Your portrait'}
          className="h-[225px] w-[180px] object-cover shadow-[0_30px_60px_rgba(0,0,0,0.4)] sm:h-[300px] sm:w-[240px] lg:h-[375px] lg:w-[300px]"
          style={{ border: '3px solid #b87333' }}
        />

        <div className="flex flex-1 flex-col gap-5 lg:gap-[22px]">
          <div className="pd-rule w-[120px] lg:w-[220px]" />
          <h1 className="font-heading text-[2.4rem] leading-[1.05] text-editorial-cream sm:text-[3.2rem] lg:text-[4.4rem]">
            {name}
          </h1>
          {standing && (
            <p className="font-body text-[13px] uppercase tracking-[0.16em] text-editorial-cream/80 lg:text-[15px]">
              {standing}
            </p>
          )}
          {place && (
            <p className="font-body text-[12px] tracking-[0.12em] text-editorial-cream/55">
              {place}
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3.5">
            <BadgeCheck className="h-9 w-9 text-editorial-gold lg:h-11 lg:w-11" strokeWidth={1.8} />
            <span className="font-body text-[12px] uppercase tracking-[0.16em] text-editorial-cream/60">
              {verificationLabel}
            </span>
          </div>
          {sixWord && (
            <p className="font-heading text-lg italic text-editorial-cream/75 lg:text-xl">
              “{sixWord}”
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
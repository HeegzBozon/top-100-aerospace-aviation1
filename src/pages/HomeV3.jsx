import { useMemo, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import ExperienceHero from '@/components/events/ExperienceHero';
import PublicationBody from '@/components/publication/PublicationBody';
import PublicationSectionBoundary from '@/components/publication/PublicationSectionBoundary';
import PublicationLoading from '@/components/publication/PublicationLoading';
import HomeDock from '@/components/home-v3/HomeDock';
import PublicationUnavailable from '@/components/publication/PublicationUnavailable';
import useTop100WomenNominees, { resetEditionCache } from '@/components/publication/useTop100WomenNominees';

// Parallel iteration of the home page. Live route `/` still points to HomeV2.
// This page is mounted at `/home-v3` for review and refinement.
export default function HomeV3() {
  const { nominees, loading: pubLoading, error: pubError } = useTop100WomenNominees();

  const editionStats = useMemo(() => {
    if (nominees.length === 0) return null;
    const countries = new Set(nominees.map((nominee) => nominee.country).filter(Boolean));
    return { honorees: nominees.length, countries: countries.size };
  }, [nominees]);

  const reloadEdition = () => {
    resetEditionCache();
    window.location.reload();
  };

  // Sticky-hero parallax: hero pins, fades + scales as the publication rises over it.
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);

  return (
    <>
      {/* Announcement banner — thin, rotating, dismissible */}
      <AnnouncementBanner />

      {/* Advocacy strip — editorial news/policy ticker (the chamber advocacy layer) */}
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      {/* Sticky hero — pins and dissolves as the publication scrolls up over it */}
      <div ref={heroRef} className="relative bg-[#07111f]">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="sticky top-0 z-0 h-screen w-full overflow-hidden"
        >
          <ExperienceHero stats={editionStats} />
        </motion.div>
      </div>

      {/* Publication body — rises over the dissolved hero, full editorial issue */}
      <div className="relative z-10">
        {pubLoading ? (
          <PublicationLoading />
        ) : pubError || nominees.length === 0 ? (
          <PublicationUnavailable onRetry={reloadEdition} />
        ) : (
          <PublicationSectionBoundary name="edition" label="The Orbital Edition">
            <PublicationBody suppressFloatingActions />
          </PublicationSectionBoundary>
        )}
      </div>

      {/* Spacer so the sticky dock never covers the closing section */}
      <div className="h-24" />

      {/* Sticky bottom dock — consolidates menu, nominate, RSVP, newsletter, shop */}
      <HomeDock />
    </>
  );
}
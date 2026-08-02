import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, useScroll } from 'framer-motion';

// Editorial Components
import EditorialMasthead from '@/components/publication/EditorialMasthead';
import EditorialTableOfContents from '@/components/publication/EditorialTableOfContents';
import EditorialManifesto from '@/components/publication/EditorialManifesto';
import EditorialPortraits from '@/components/publication/EditorialPortraits';
import EditorialLedger from '@/components/publication/EditorialLedger';
import SignalReport from '@/components/publication/SignalReport';
import OrbitalIndexComingSoon from '@/components/publication/OrbitalIndexComingSoon';
import ArchiveExportSection from '@/components/publication/ArchiveExportSection';
import ArchiveVolumesSection from '@/components/publication/ArchiveVolumesSection';
import EditorialClosing from '@/components/publication/EditorialClosing';
import EnhancedProfilePanel from '@/components/publication/EnhancedProfilePanel';
import ShareableCard from '@/components/publication/ShareableCard';
import CountdownLanding from '@/components/publication/CountdownLanding';
import UnauthenticatedCTA from '@/components/public/UnauthenticatedCTA';
import RsvpFloatingButton from '@/components/public/RsvpFloatingButton';
import AuthenticatedIntelligenceHeader from '@/components/publication/AuthenticatedIntelligenceHeader';
import EditorialNav from '@/components/publication/EditorialNav';
import EditorialSection from '@/components/publication/EditorialSection';
import DiscoveryTracker from '@/components/publication/DiscoveryTracker';
import EditorialBreak from '@/components/publication/EditorialBreak';
import useTop100WomenNominees from '@/components/publication/useTop100WomenNominees';
import { publicationBrand as brandColors, top100Women2025Config } from '@/components/publication/publicationConfig';

// Shared, stateful publication body. Rendered by both the standalone
// /Top100Women2025 route and the HomeV3 composed front door so the two
// views never drift apart.
export default function PublicationBody() {
  const { nominees, loading } = useTop100WomenNominees();
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [shareNominee, setShareNominee] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [showCountdown, setShowCountdown] = useState(false);
  const [user, setUser] = useState(null);
  const [discoveredIds, setDiscoveredIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('t100w25_discovered') || '[]'));
    } catch {
      return new Set();
    }
  });
  const containerRef = useRef(null);

  // Track discovered honorees + sync profile deep-link to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedNominee) {
      setDiscoveredIds(prev => {
        if (prev.has(selectedNominee.id)) return prev;
        const next = new Set(prev);
        next.add(selectedNominee.id);
        localStorage.setItem('t100w25_discovered', JSON.stringify([...next]));
        return next;
      });
      url.searchParams.set('nominee', selectedNominee.id);
    } else {
      url.searchParams.delete('nominee');
    }
    window.history.replaceState({}, '', url);
  }, [selectedNominee]);

  // Open profile from ?nominee= deep link once data loads
  useEffect(() => {
    if (loading || nominees.length === 0) return;
    const nomineeId = new URLSearchParams(window.location.search).get('nominee');
    if (nomineeId) {
      const target = nominees.find(n => n.id === nomineeId);
      if (target) setSelectedNominee(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, nominees.length]);

  // Prefetch next/prev nominee images for instant transitions
  useEffect(() => {
    if (!selectedNominee) return;
    const idx = nominees.findIndex(n => n.id === selectedNominee.id);
    [nominees[idx + 1], nominees[idx - 1]].forEach(n => {
      const src = n?.avatar_url || n?.photo_url;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [selectedNominee, nominees]);

  const { scrollYProgress } = useScroll({ target: containerRef });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Track active section
  useEffect(() => {
    const sectionIds = top100Women2025Config.sections.map(section => section.id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Expose share function globally for ProfilePanel
  useEffect(() => {
    window.openShareCard = (nominee) => setShareNominee(nominee);
    return () => { window.openShareCard = null; };
  }, []);

  // Handle anchor scroll after data loads
  useEffect(() => {
    if (!loading && nominees.length > 0 && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading, nominees.length]);

  if (loading) return null;

  return (
    <div ref={containerRef} className="max-w-[100vw] overflow-x-hidden" style={{ background: brandColors.cream }}>
      {/* Unauthenticated User CTAs */}
      <UnauthenticatedCTA user={user} />

      {/* RSVP floating button — visible to all users */}
      <RsvpFloatingButton />

      {/* Countdown Landing */}
      {showCountdown && <CountdownLanding onReveal={() => setShowCountdown(false)} />}

      {/* Authenticated Intelligence Header - visible after countdown */}
      {!showCountdown && user && <AuthenticatedIntelligenceHeader nominees={nominees} onSelectNominee={setSelectedNominee} />}

      {/* Progress Bar - hidden during countdown */}
      {!showCountdown && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-px z-50 origin-left"
          style={{
            background: brandColors.goldPrestige,
            scaleX: scrollYProgress
          }}
        />
      )}

      {/* Navigation - hidden during countdown */}
      {!showCountdown && <EditorialNav activeSection={activeSection} />}

      {/* SECTION 1: Masthead */}
      <main id="hero">
        <EditorialMasthead />
      </main>

      {/* SECTION 2: Signal Report */}
      <EditorialSection id="signal-report">
        <section className="py-12 md:py-40 px-4 md:px-12 lg:px-24" style={{ background: 'white' }}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-16"
            >
              <p
                className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4"
                style={{ color: brandColors.skyBlue }}
              >
                Intelligence
              </p>
              <h2
                className="text-2xl md:text-5xl font-light tracking-tight"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: brandColors.ink
                }}
              >
                The Signal Report
              </h2>
              <p
                className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm leading-relaxed"
                style={{ color: `${brandColors.ink}60` }}
              >
                Data-driven intelligence from the selection process.
              </p>
            </motion.div>
            <SignalReport nominees={nominees} />
          </div>
        </section>
      </EditorialSection>

      {/* SECTION 3: Table of Contents */}
      <EditorialSection id="contents">
        <EditorialTableOfContents />
      </EditorialSection>

      {/* SECTION 4: Manifesto */}
      <EditorialSection id="manifesto">
        <EditorialManifesto />
      </EditorialSection>

      {/* SECTION 4: Featured Portraits */}
      <EditorialSection id="portraits">
        <EditorialPortraits
          nominees={nominees}
          onSelectNominee={setSelectedNominee}
        />
      </EditorialSection>

      {/* SECTION 4.5: Archive & Export (Mid-page) - Hidden on mobile */}
      <EditorialSection id="archive-mid">
        <ArchiveExportSection nominees={nominees} compact />
      </EditorialSection>

      {/* Editorial break */}
      <EditorialBreak text="One hundred names. Thousands of nominations. Every honoree validated by peers, measured by signal — not by status." />

      {/* SECTION 5: The Index */}
      <EditorialSection id="honorees">
        <EditorialLedger
          nominees={nominees}
          onSelectNominee={setSelectedNominee}
          discoveredIds={discoveredIds}
        />
      </EditorialSection>

      {/* SECTION 6: Orbital Index - Under Construction */}
      <EditorialSection id="orbital-index">
        <OrbitalIndexComingSoon />
      </EditorialSection>

      {/* Editorial break */}
      <EditorialBreak
        kicker="The Methodology"
        text="We don't rank. We measure. The verified reputation graph of aerospace & aviation."
      />

      {/* SECTION 7.5: Previous Volumes */}
      <EditorialSection id="volumes">
        <ArchiveVolumesSection />
      </EditorialSection>

      {/* SECTION 8: Archive */}
      <EditorialSection id="archive">
        <ArchiveExportSection nominees={nominees} />
      </EditorialSection>

      {/* SECTION 9: Closing */}
      <section id="closing">
        <EditorialClosing />
      </section>

      {/* Discovery progress tracker */}
      {!showCountdown && !selectedNominee && (
        <DiscoveryTracker discoveredCount={discoveredIds.size} total={nominees.length} />
      )}

      {/* Profile Panel */}
      {selectedNominee && (
        <EnhancedProfilePanel
          nominee={selectedNominee}
          rank={selectedNominee.finalRank || nominees.findIndex(n => n.id === selectedNominee.id) + 1}
          onClose={() => setSelectedNominee(null)}
          onShare={(nominee) => setShareNominee(nominee)}
          autoPlaying={autoPlaying}
          onAutoPlayChange={setAutoPlaying}
          onNextNominee={(keepPlaying) => {
            const idx = nominees.findIndex(n => n.id === selectedNominee.id);
            const next = nominees[idx + 1];
            if (next) {
              if (keepPlaying) setAutoPlaying(true);
              setSelectedNominee(next);
            }
          }}
          hasNextNominee={nominees.findIndex(n => n.id === selectedNominee.id) < nominees.length - 1}
          onPrevNominee={() => {
            const idx = nominees.findIndex(n => n.id === selectedNominee.id);
            const prev = nominees[idx - 1];
            if (prev) setSelectedNominee(prev);
          }}
          hasPrevNominee={nominees.findIndex(n => n.id === selectedNominee.id) > 0}
        />
      )}

      {/* Shareable Card Modal */}
      {shareNominee && (
        <ShareableCard
          nominee={shareNominee}
          rank={nominees.findIndex(n => n.id === shareNominee.id) + 1}
          onClose={() => setShareNominee(null)}
        />
      )}
    </div>
  );
}
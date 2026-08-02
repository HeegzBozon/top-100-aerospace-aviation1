import { useState, useEffect, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import GlobalNewsletterFooter from '@/components/shared/GlobalNewsletterFooter';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import ExperienceHero from '@/components/events/ExperienceHero';
import PublicationBody from '@/components/publication/PublicationBody';
import PublicationLoading from '@/components/publication/PublicationLoading';
import useTop100WomenNominees from '@/components/publication/useTop100WomenNominees';
import NominationCountdown from '@/components/home-v2/NominationCountdown';

const NAV_LINKS = [
  { label: 'Operation: Moon Joy', to: '/moon-joy' },
  { label: 'Nominate', to: '/nominate' },
  { label: 'Calendar', to: '/events' },
  { label: 'Local Legends', to: '/local-legends' },
  { label: 'Publication', to: '/Top100Women2025' },
  { label: '2030 Vision', to: '/2030-vision' },
  { label: 'Community Round', href: 'https://wefunder.com/top.100.aerospace.aviation' },
  { label: 'Mission Theatre', to: '/LaunchParty' },
];

// Parallel iteration of the home page. Live route `/` still points to HomeV2.
// This page is mounted at `/home-v3` for review and refinement.
export default function HomeV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { loading: pubLoading } = useTop100WomenNominees();

  // Sticky-hero parallax: hero pins, fades + scales as the publication rises over it.
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -40]);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setIsAdmin(u?.role === 'admin'))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Announcement banner — thin, rotating, dismissible */}
      <AnnouncementBanner />

      {/* Advocacy strip — editorial news/policy ticker (the chamber advocacy layer) */}
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      {/* Minimal floating nav — top center */}
      <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-6">
        <Link
          to="/2030-vision"
          className="text-xs font-semibold uppercase tracking-widest text-white/50 transition-colors hover:text-[#c9a87c] whitespace-nowrap"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
        >
          2030 Vision
        </Link>
        <div className="h-3 w-px bg-white/20" />
        <GlobalNewsletterFooter currentPageName="HomeV3" variant="header" />
        <div className="h-3 w-px bg-white/20" />
        <Link
          to="/about"
          className="text-xs font-semibold uppercase tracking-widest text-white/50 transition-colors hover:text-[#c9a87c]"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
        >
          About
        </Link>
      </div>

      {/* Menu toggle — fixed top-right */}
      <div className="fixed top-4 right-4 z-[100]">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-all"
          style={{ background: 'rgba(7,17,31,0.85)', border: '1px solid rgba(201,168,124,0.35)', backdropFilter: 'blur(12px)' }}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5 text-[#c9a87c]" /> : <Menu className="h-5 w-5 text-[#c9a87c]" />}
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: 'rgba(7,17,31,0.97)', border: '1px solid rgba(201,168,124,0.2)', backdropFilter: 'blur(20px)' }}
          >
            {NAV_LINKS.map(({ label, to, href }) =>
              href ? (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/5 px-5 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-[#c9a87c] last:border-0"
                >
                  {label} ↗
                </a>
              ) : (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-white/5 px-5 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-[#c9a87c] last:border-0"
                >
                  {label}
                </Link>
              ),
            )}
            {isAdmin && (
              <Link
                to="/Admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 border-t border-[#c9a87c]/20 px-5 py-3.5 text-sm font-semibold text-[#c9a87c] transition-all hover:bg-white/5"
              >
                <Shield className="h-4 w-4" />
                Admin Portal
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Sticky hero — pins and dissolves as the publication scrolls up over it */}
      <div ref={heroRef} className="relative bg-[#07111f]">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="sticky top-0 z-0 h-screen w-full overflow-hidden"
        >
          <ExperienceHero />
        </motion.div>
      </div>

      {/* Bridge band — nominations-close countdown carries over from the prior editorial hero */}
      <div className="relative z-10 flex justify-center bg-[#faf8f5] pt-10">
        <NominationCountdown />
      </div>

      {/* Publication body — rises over the dissolved hero, full editorial issue */}
      <div className="relative z-10">
        {pubLoading ? <PublicationLoading /> : <PublicationBody />}
      </div>
    </>
  );
}
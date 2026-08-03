import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import NominationCountdown from '@/components/home-v2/NominationCountdown';

export default function EditorialHero() {
  const stars = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        top: `${6 + ((i * 17) % 88)}%`,
        left: `${4 + ((i * 29) % 92)}%`,
        delay: `${(i % 7) * 0.4}s`,
        size: i % 5 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1',
      })),
    [],
  );

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07111f] px-4 py-16 text-center sm:px-8">
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <span
            key={s.id}
            className={`absolute rounded-full bg-white/80 ${s.size} animate-pulse`}
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(201,168,124,0.22),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(74,144,184,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-[#07111f]/40" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c9a87c]/35 bg-[#c9a87c]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c] backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Season 4 — 2026 · The Verified Reputation Graph
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="leading-[0.95] tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          <span className="block text-5xl font-bold text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Not a ranking.
           </span>
          <span className="mt-1 block text-5xl font-bold text-[#c9a87c] sm:text-6xl md:text-7xl lg:text-8xl">
            A record.
          </span>
        </motion.h1>

        {/* Kicker */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-relaxed text-white/90 sm:text-lg md:text-2xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Oh hey — you made it. Right on time.
        </motion.p>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22 }}
          className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base md:leading-8"
        >
          A measurement platform for aerospace and aviation — connecting the people, alumni, investors, and operators shaping the next chapter of flight. Wherever you're coming from, you belong here.
        </motion.p>

        {/* Countdown (reused) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-7 flex justify-center"
        >
          <NominationCountdown />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.36 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/nominate"
            className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-[#0a1526] shadow-[0_0_32px_rgba(201,168,124,0.35)] transition-all hover:scale-[1.03] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)' }}
          >
            Nominate a Leader
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            View the Publication
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Secondary utility links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-widest text-white/45"
        >
          <Link to="/local-legends" className="transition-colors hover:text-[#c9a87c]">Local Legends</Link>
          <span className="h-3 w-px bg-white/15" />
          <Link to="/moon-joy" className="transition-colors hover:text-[#c9a87c]">Moon Joy</Link>
          <span className="h-3 w-px bg-white/15" />
          <Link to="/top100-tv" className="transition-colors hover:text-[#c9a87c]">Mission Theatre</Link>
          <span className="h-3 w-px bg-white/15" />
          <Link to="/2030-vision" className="transition-colors hover:text-[#c9a87c]">2030 Vision</Link>
        </motion.div>
      </div>
    </section>
  );
}
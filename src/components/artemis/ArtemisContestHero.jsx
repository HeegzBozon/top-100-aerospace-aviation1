import { motion } from 'framer-motion';
import { Moon, Rocket, Satellite, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LunarSurface from '@/components/rooms/LunarSurface';

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 80,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export default function ArtemisContestHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020810] via-[#0a1526] to-[#12122a]" />

      {/* Earth glow */}
      <div className="absolute top-8 right-12 w-16 h-16 md:w-24 md:h-24 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,144,184,0.2) 0%, rgba(74,144,184,0.06) 40%, transparent 70%)',
          boxShadow: '0 0 50px 15px rgba(74,144,184,0.08)',
        }}
      >
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#4a90b8]/25 to-[#2d6a8a]/15 border border-[#4a90b8]/15" />
      </div>

      {/* Moon */}
      <div className="absolute top-16 right-[15%] pointer-events-none opacity-25">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-48 h-48 md:w-72 md:h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #e8e0d4 0%, #c4b8a8 30%, #8a7d6d 60%, #4a4035 100%)',
              boxShadow: '0 0 60px 15px rgba(201,168,124,0.08), inset -15px -15px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div className="absolute top-[20%] left-[25%] w-6 h-6 rounded-full bg-black/10" />
            <div className="absolute top-[45%] left-[55%] w-10 h-10 rounded-full bg-black/8" />
            <div className="absolute top-[30%] right-[20%] w-5 h-5 rounded-full bg-black/10" />
          </div>
        </motion.div>
      </div>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map(s => (
          <motion.div
            key={s.id}
            className="absolute bg-white rounded-full"
            style={{ left: s.x + '%', top: s.y + '%', width: s.size, height: s.size }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Orbital ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1100px] md:h-[1100px] pointer-events-none">
        <motion.div
          className="w-full h-full rounded-full border border-[#c9a87c]/[0.05]"
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Satellite className="w-4 h-4 text-[#c9a87c]/50" />
          </motion.div>
        </motion.div>
      </div>

      <LunarSurface />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 backdrop-blur-sm">
            <Moon className="w-3 h-3 text-[#c9a87c]" />
            <span className="text-[#c9a87c] text-[11px] font-bold uppercase tracking-[0.2em]">
              Moon Base Alpha · Live Mission Intelligence
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            ARTEMIS II
          </h1>
          <h2
            className="text-2xl md:text-4xl text-white/80 italic mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            × TOP 100 Women in Aerospace & Aviation
          </h2>
          <p className="text-[#c9a87c] text-lg md:text-xl font-bold tracking-wider mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            2025 · Season 4
          </p>

          {/* Subheadline */}
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            First humans to fly by the Moon in over 50 years. Tracked live from the lunar surface.
            100 verified Fellows. 49 countries. 8 domains. The trust infrastructure behind aerospace's next chapter.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 md:gap-10 mb-10">
            {[
              { val: '252,760', label: 'miles from Earth' },
              { val: '470', label: 'mi lunar approach' },
              { val: '~35', label: 'science targets' },
              { val: '100', label: 'Mbps optical link' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white font-bold text-xl md:text-2xl font-mono leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <a href="https://www.linkedin.com/company/top-100-in-aerospace-aviation/" target="_blank" rel="noopener noreferrer">
              <Button
                className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Nominate a Fellow
              </Button>
            </a>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full text-sm backdrop-blur-sm cursor-pointer"
              >
                Fund the mission
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
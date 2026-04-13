import { motion } from 'framer-motion';
import { Rocket, ExternalLink, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 80,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export default function VenusHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Photo background */}
      <div className="absolute inset-0">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/6ca50ea76_Screenshot2026-04-12at95403PM.png"
          alt="Artemis crew"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020810]/95 via-[#0a1526]/90 to-[#0a1526]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020810]" />
      </div>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map(s => (
          <motion.div
            key={s.id}
            className="absolute bg-white rounded-full"
            style={{ left: s.x + '%', top: s.y + '%', width: s.size, height: s.size }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Orbital ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none">
        <motion.div
          className="w-full h-full rounded-full border border-[#c9a87c]/[0.04]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 3, repeat: Infinity }}>
            <Satellite className="w-4 h-4 text-[#c9a87c]/40" />
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          {/* Phase badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-[#a78bfa]/30 bg-[#a78bfa]/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />
            <span className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-[0.2em]">Phase 1: Venus · The Narrative Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            The aerospace industry does not operate on blind luck.{' '}
            <span className="text-[#c9a87c]">It requires a routing protocol.</span>
          </h1>

          {/* Sub */}
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-4 max-w-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            The TOP 100 is not a media property. It is an <span className="text-white font-bold">operational data refinery</span> — the Global Stage for Excellence that bypasses the noise of traditional networks to connect capital directly with lunar capability.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-2xl">
            100 verified Fellows. 49 countries. 8 domains. Algorithmic routing that converts raw prestige into scalable, recurring B2B revenue. Not a networking app. A transformation system.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 md:gap-10 mb-10">
            {[
              { val: '$55.9M', label: 'raised & failed (Lunchclub)' },
              { val: '100%', label: 'proprietary architecture' },
              { val: '$10K–$150K', label: 'B2B contract range' },
              { val: '50+', label: 'curated Syncs per Residency' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white font-bold text-lg md:text-xl font-mono">{s.val}</div>
                <div className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</div>
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
                Request deployment
              </Button>
            </a>
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full text-sm backdrop-blur-sm cursor-pointer">
                Fund the colony
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
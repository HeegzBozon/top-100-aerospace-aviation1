import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, ExternalLink, Radio, Moon, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LunarSurface from './LunarSurface';

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 70,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export default function RoomsHero() {
  const [nextSession] = useState(() => {
    const now = new Date();
    const days = [2, 3, 4];
    for (let d = 0; d < 14; d++) {
      const check = new Date(now);
      check.setDate(now.getDate() + d);
      if (days.includes(check.getDay())) {
        check.setHours(10, 0, 0, 0);
        if (check > now) return check;
      }
    }
    return null;
  });

  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!nextSession) return;
    const tick = () => {
      const diff = nextSession - new Date();
      if (diff <= 0) { setCountdown('LIVE NOW'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d > 0 ? d + 'd ' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextSession]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Deep space → lunar gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020810] via-[#0a1526] to-[#12122a]" />

      {/* Earth glow in distance */}
      <div className="absolute top-12 right-16 w-20 h-20 md:w-32 md:h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(74,144,184,0.25) 0%, rgba(74,144,184,0.08) 40%, transparent 70%)',
          boxShadow: '0 0 60px 20px rgba(74,144,184,0.1)',
        }}
      >
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#4a90b8]/30 to-[#2d6a8a]/20 border border-[#4a90b8]/20" />
      </div>

      {/* Moon in upper portion */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-1/4 pointer-events-none opacity-20 md:opacity-30">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #e8e0d4 0%, #c4b8a8 30%, #8a7d6d 60%, #4a4035 100%)',
              boxShadow: '0 0 80px 20px rgba(201,168,124,0.1), inset -20px -20px 40px rgba(0,0,0,0.4)',
            }}
          >
            {/* Crater details */}
            <div className="absolute top-[20%] left-[25%] w-8 h-8 rounded-full bg-black/10" />
            <div className="absolute top-[45%] left-[55%] w-12 h-12 rounded-full bg-black/8" />
            <div className="absolute top-[30%] right-[20%] w-6 h-6 rounded-full bg-black/10" />
            <div className="absolute bottom-[25%] left-[35%] w-10 h-10 rounded-full bg-black/8" />
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

      {/* Orbital ring — satellite path */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] md:w-[1300px] md:h-[1300px] pointer-events-none">
        <motion.div
          className="w-full h-full rounded-full border border-[#c9a87c]/[0.06]"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Satellite className="w-4 h-4 text-[#c9a87c]/60" />
          </motion.div>
        </motion.div>
      </div>

      {/* Lunar surface at bottom */}
      <LunarSurface />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#c9a87c]/30 bg-[#c9a87c]/10 backdrop-blur-sm">
            <Moon className="w-3 h-3 text-[#c9a87c]" />
            <span className="text-[#c9a87c] text-[11px] font-bold uppercase tracking-[0.2em]">
              Lunar Command Center · Moon Base Alpha
            </span>
          </div>

          {/* H1 */}
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            We don't just build in public.{' '}
            <span className="text-[#c9a87c]">We build on the Moon.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Live habitat construction. Colony operations. Mission briefings. Crew rotations.
            Every Tuesday, Wednesday, and Thursday. 90-minute deployment windows. The whole crew, on station.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-8">
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
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-6 rounded-full text-sm backdrop-blur-sm cursor-pointer"
              >
                Fund the colony
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Next session */}
          {countdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 text-sm text-slate-400"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next EVA window: <span className="text-white font-mono font-bold">{countdown}</span></span>
              <span className="text-slate-600">·</span>
              <span>Watch live on LinkedIn</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
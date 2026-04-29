import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

const VIDEOS = [
  'https://videos.pexels.com/video-files/3209037/3209037-uhd_2560_1440_25fps.mp4',  // yoga class
  'https://videos.pexels.com/video-files/3209050/3209050-uhd_2560_1440_25fps.mp4',  // gym workout
  'https://videos.pexels.com/video-files/3209118/3209118-uhd_2560_1440_25fps.mp4',  // pilates/stretching
  'https://videos.pexels.com/video-files/4057411/4057411-uhd_2560_1440_25fps.mp4',  // spa/wellness
];

export default function LLHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % VIDEOS.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* All videos rendered simultaneously — opacity swap for crossfade */}
      {VIDEOS.map((src, i) => (
        <video
          key={src}
          autoPlay
          muted
          loop
          playsInline
          src={src}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30`, backdropFilter: 'blur(8px)' }}>
            A TOP 100 Aerospace & Aviation Initiative
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          The businesses that fuel the people building{' '}
          <span className="relative inline-block">
            <span style={{ color: brand.gold }}>the future of flight.</span>
            <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full opacity-40" style={{ background: `linear-gradient(90deg, ${brand.gold}, transparent)` }} />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Local Legends spotlights the studios, salons, kitchens, and clinics that make life work for the aerospace community — wherever the industry lives.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Button
            size="lg"
            className="rounded-full px-8 text-white font-semibold text-sm shadow-xl gap-2"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
            onClick={() => document.getElementById('ll-how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Apply for your spotlight <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ArrowDown className="w-5 h-5 text-white/30 animate-bounce" />
      </motion.div>
    </section>
  );
}
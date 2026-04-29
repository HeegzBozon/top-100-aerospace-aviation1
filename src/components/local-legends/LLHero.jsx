import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const VIDEOS = [
  'https://videos.pexels.com/video-files/3135924/3135924-hd_1920_1080_30fps.mp4',   // coffee shop full of customers
  'https://videos.pexels.com/video-files/3135925/3135925-hd_1920_1080_30fps.mp4',   // people inside coffee shop
  'https://videos.pexels.com/video-files/3135907/3135907-hd_1920_1080_30fps.mp4',   // mall food court shoppers
  'https://videos.pexels.com/video-files/1853441/1853441-hd_1920_1080_25fps.mp4',   // cozy coffee shop winter
];

const SLIDE_DURATION = 6000;

export default function LLHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % VIDEOS.length);
    }, SLIDE_DURATION);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background video slides */}
      <AnimatePresence mode="sync">
        <motion.video
          key={activeIndex}
          autoPlay
          muted
          loop
          playsInline
          src={VIDEOS[activeIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Slide indicator dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIndex(i); clearInterval(timerRef.current); timerRef.current = setInterval(() => setActiveIndex(prev => (prev + 1) % VIDEOS.length), SLIDE_DURATION); }}
            className="rounded-full transition-all duration-500 cursor-pointer"
            style={{
              background: i === activeIndex ? brand.gold : 'rgba(255,255,255,0.25)',
              width: i === activeIndex ? 18 : 6,
              height: 6,
            }}
          />
        ))}
      </div>

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
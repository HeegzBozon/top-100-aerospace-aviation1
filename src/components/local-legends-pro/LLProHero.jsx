import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const CITIES = [
  { name: 'Mountain View', img: 'https://images.unsplash.com/photo-1617957796155-75a9edf1dc42?w=1920&q=80' },
  { name: 'Los Angeles', img: 'https://images.unsplash.com/photo-1515896769750-31548aa180ed?w=1920&q=80' },
  { name: 'Houston', img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=1920&q=80' },
  { name: 'Seattle', img: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?w=1920&q=80' },
  { name: 'Washington, D.C.', img: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?w=1920&q=80' },
  { name: 'Cape Canaveral', img: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1920&q=80' },
  { name: 'Huntsville', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80' },
  { name: 'Denver', img: 'https://images.unsplash.com/photo-1619856699906-09e1f4ef578c?w=1920&q=80' },
  { name: 'Tucson', img: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=1920&q=80' },
  { name: 'San Diego', img: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=1920&q=80' },
];

export default function LLProHero() {
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCityIndex(prev => (prev + 1) % CITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const city = CITIES[cityIndex];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={cityIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={city.img}
            alt={city.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}25`, color: brand.gold, border: `1px solid ${brand.gold}35`, backdropFilter: 'blur(8px)' }}>
            <MapPin className="w-3.5 h-3.5" />
            Local Legends: For Aerospace Professionals
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          You just landed in{' '}
          <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: '5ch' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={cityIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="inline-block whitespace-nowrap"
                style={{ color: brand.gold }}
              >
                {city.name}.
              </motion.span>
            </AnimatePresence>
          </span>{' '}
          <span className="text-white/50">Now what?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-white/55 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Local Legends is the aerospace community's guide to the cities where the industry lives. Vetted businesses. Fellow-curated recommendations. Everything you need to feel at home fast.
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
            onClick={() => document.getElementById('llpro-whats-inside')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Find your city <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* City indicator dots */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        {CITIES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCityIndex(i)}
            className="w-1.5 h-1.5 rounded-full transition-all duration-500 cursor-pointer"
            style={{
              background: i === cityIndex ? brand.gold : 'rgba(255,255,255,0.25)',
              width: i === cityIndex ? 16 : 6,
            }}
          />
        ))}
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
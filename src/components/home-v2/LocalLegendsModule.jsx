import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

const CITIES = [
  { name: 'Mountain View', img: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=1920&q=80' },
  { name: 'Los Angeles', img: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1920&q=80' },
  { name: 'Houston', img: 'https://images.unsplash.com/photo-1609945307404-0a637c545eef?w=1920&q=80' },
  { name: 'Seattle', img: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?w=1920&q=80' },
  { name: 'Washington, D.C.', img: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=1920&q=80' },
  { name: 'Cape Canaveral', img: 'https://images.unsplash.com/photo-1457364559154-aa2644600ebb?w=1920&q=80' },
  { name: 'Huntsville', img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80' },
  { name: 'Denver', img: 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=1920&q=80' },
  { name: 'Tucson', img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80' },
  { name: 'San Diego', img: 'https://images.unsplash.com/photo-1538964173425-93e165de48d5?w=1920&q=80' },
];

export default function LocalLegendsModule() {
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCityIndex(prev => (prev + 1) % CITIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const city = CITIES[cityIndex];

  return (
    <section className="py-10 md:py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
          style={{ height: 420 }}
        >
          {/* City background images */}
          <AnimatePresence mode="sync">
            <motion.img
              key={cityIndex}
              src={city.img}
              alt={city.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-[0.2em] w-fit" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30`, backdropFilter: 'blur(8px)' }}>
              <MapPin className="w-3 h-3" />
              Local Legends
            </div>

            {/* Headline */}
            <h3
              className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              You just landed in{' '}
              <span className="relative inline-block overflow-hidden align-bottom" style={{ minWidth: '4ch' }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cityIndex}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block whitespace-nowrap"
                    style={{ color: brand.gold }}
                  >
                    {city.name}.
                  </motion.span>
                </AnimatePresence>
              </span>{' '}
              <span className="text-white/40">Now what?</span>
            </h3>

            <p className="text-white/50 text-sm max-w-lg leading-relaxed mb-6">
              The aerospace community's guide to the cities where the industry lives. Vetted businesses. Fellow-curated picks.
            </p>

            {/* CTAs + dots row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex gap-2">
                <Link to="/local-legends">
                  <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5 border-white/20 text-white/70 hover:text-white hover:bg-white/10">
                    For Businesses <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
                <Link to="/local-legends-pro">
                  <Button size="sm" className="rounded-full text-xs gap-1.5 text-white font-semibold" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}>
                    For Professionals <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* City dots */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                {CITIES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCityIndex(i)}
                    className="rounded-full transition-all duration-500 cursor-pointer"
                    style={{
                      background: i === cityIndex ? brand.gold : 'rgba(255,255,255,0.2)',
                      width: i === cityIndex ? 16 : 6,
                      height: 6,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
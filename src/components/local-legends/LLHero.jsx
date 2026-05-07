import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const brand = { navy: '#1e3a5a', gold: '#c9a87c' };

const FALLBACK_VIDEO = 'https://videos.pexels.com/video-files/3135924/3135924-hd_1920_1080_30fps.mp4';

export default function LLHero() {
  const [videos, setVideos] = useState([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    base44.entities.HeroVideo.filter({ is_active: true }, 'sort_order')
      .then(v => setVideos(v))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (videos.length <= 1) return;
    const id = setInterval(() => setActive(p => (p + 1) % videos.length), 6000);
    return () => clearInterval(id);
  }, [videos.length]);

  const srcs = videos.length > 0 ? videos.map(v => v.video_url) : [FALLBACK_VIDEO];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <Link to="/" className="absolute left-5 top-5 z-20 md:left-8 md:top-8">
        <Button variant="outline" className="rounded-full border-white/20 bg-black/25 text-white backdrop-blur-md hover:bg-white/10">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Home
        </Button>
      </Link>

      {srcs.map((src, i) => (
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
          <Link to="/local-legends/apply">
            <Button
              size="lg"
              className="rounded-full px-8 text-white font-semibold text-sm shadow-xl gap-2"
              style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
            >
              Apply for your spotlight <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
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
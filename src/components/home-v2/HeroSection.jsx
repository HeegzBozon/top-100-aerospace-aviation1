import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, ArrowRight, Users, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const stats = [
  { value: '300+', label: 'Verified Fellows', icon: Award },
  { value: '49', label: 'Countries', icon: Globe },
  { value: '1,000+', label: 'Nominators', icon: Users },
];

export default function HeroSection({ user }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden rounded-2xl mx-3 md:mx-0" style={{ minHeight: '420px' }}>
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          width={1400} height={700}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1526] via-[#0a1526]/90 to-[#0a1526]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1526] via-transparent to-[#0a1526]/30" />
      </div>

      {/* Starfield dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {mounted && [...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: (Math.random() * 3) + 's',
              animationDuration: (Math.random() * 3 + 2) + 's',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-6 md:px-16 py-12 md:py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-[#c9a87c]/40 bg-[#c9a87c]/10 text-[#c9a87c] text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a87c] animate-pulse" />
            Season 4 — 2026
          </div>

          <h1
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            The Perception<br />
            <span className="text-[#c9a87c]">Engine</span>
          </h1>

          <p
            className="text-slate-300 text-sm md:text-lg max-w-xl leading-relaxed mb-8 font-medium"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            A human-verified talent graph bridging recognition to sponsorship. 
            100 verified Fellows. 49 countries. 8 domains. 
            The trust infrastructure behind aerospace's next chapter.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/Nominations">
              <Button
                className="text-[#0a1526] font-bold px-6 py-6 rounded-full text-sm shadow-[0_0_20px_rgba(201,168,124,0.3)] hover:shadow-[0_0_30px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Nominate Now
              </Button>
            </Link>
            <Link to="/Top100Women2025">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-6 rounded-full text-sm backdrop-blur-sm cursor-pointer"
              >
                View Publication
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex gap-6 md:gap-10">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#c9a87c]" />
                <div>
                  <div className="text-white font-bold text-lg md:text-xl leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</div>
                  <div className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe, Plane, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';

// Brand Colors from Guidelines - Rose Gold palette
const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',    // Rose gold base
  goldLight: '#e8d4b8',       // Light rose gold
  roseAccent: '#d4a574',      // Warm rose accent
  cream: '#faf8f5',
};

// Category anchors for below the fold
const categories = [
  { id: 'builders', label: 'The Builders', icon: '🔧' },
  { id: 'operators', label: 'The Operators', icon: '✈️' },
  { id: 'visionaries', label: 'The Visionaries', icon: '🔭' },
  { id: 'communicators', label: 'The Communicators', icon: '📡' },
  { id: 'innovators', label: 'The Innovators', icon: '💡' },
];

export default function LandingHero() {
  const [pulse, setPulse] = useState(false);

  // Pulse the CTA every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background - Deep Navy */}
      <div 
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 50%, ${brandColors.navyDeep} 100%)` }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: `${brandColors.skyBlue}20` }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: `${brandColors.goldPrestige}15` }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Logo with enhanced styling */}
            <motion.div
              className="relative mx-auto lg:mx-0 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Soft glow behind logo */}
              <div 
                className="absolute inset-0 blur-2xl opacity-40 scale-110"
                style={{ background: `radial-gradient(circle, ${brandColors.goldPrestige}60, transparent 70%)` }}
              />
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/5ece7f59b_TOP100AerospaceAviationlogo.png"
                alt="TOP 100 Aerospace & Aviation"
                className="relative h-44 sm:h-52 md:h-60 w-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Microcopy under logo */}
            <p 
              className="text-xs sm:text-sm tracking-widest uppercase mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.5)' }}
            >
              Curated by Industry Experts · Celebrated Worldwide
            </p>

            {/* Headline - Refined with rhythm */}
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Recognizing Excellence.
              <span 
                className="text-transparent bg-clip-text block"
                style={{ backgroundImage: `linear-gradient(90deg, ${brandColors.roseAccent}, ${brandColors.goldLight}, ${brandColors.roseAccent})` }}
              >
                Elevating Influence.
              </span>
            </h1>

            <p 
              className="text-xl sm:text-2xl text-white/80 mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              The Top Talent Platform in Aerospace & Aviation.
            </p>

            {/* Trust Signal - Prominent */}
            <div 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 mb-6 text-sm"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.7)' }}
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" style={{ color: brandColors.goldLight }} />
                Global Reach
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <Plane className="w-4 h-4" style={{ color: brandColors.goldLight }} />
                30+ Countries
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: brandColors.goldLight }} />
                Est. 2021
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <motion.div
                animate={pulse ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={handleSignIn}
                  className="text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-all hover:shadow-xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})`,
                    fontFamily: "'Montserrat', sans-serif",
                    boxShadow: `0 0 30px ${brandColors.goldPrestige}40`
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSignUp}
                className="font-semibold text-lg px-8 py-6 rounded-full hover:scale-105 transition-all"
                style={{ 
                  borderColor: brandColors.goldPrestige,
                  borderWidth: '2px',
                  color: brandColors.goldLight,
                  background: 'rgba(184, 134, 11, 0.1)',
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Join
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Video */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
              style={{ 
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <video 
                className="absolute inset-0 w-full h-full object-cover"
                src="https://base44.app/api/apps/68996845be6727838fdb822e/files/public/68996845be6727838fdb822e/c0da5d961_TOP_100_Aerospace__Aviation.mp4"
                controls
                playsInline
                poster=""
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to cream */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: `linear-gradient(to top, ${brandColors.cream}, transparent)` }}
      />
      </section>

      {/* Category Anchors */}
      <section 
      className="py-8 -mt-16 relative z-20"
      style={{ background: brandColors.cream }}
      >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Link to={`${createPageUrl('Arena')}?category=${cat.id}`}>
                <div 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 hover:scale-105 transition-all cursor-pointer"
                  style={{ 
                    borderColor: brandColors.navyDeep,
                    background: 'white',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: brandColors.navyDeep }}
                  >
                    {cat.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
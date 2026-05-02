import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { brand } from './NominateConfig';

export default function NominationSplash() {
  return (
    <div
      className="min-h-screen flex items-center justify-center overflow-hidden px-6"
      style={{ background: `radial-gradient(circle at 50% 30%, ${brand.gold}22 0%, transparent 34%), linear-gradient(135deg, #081525 0%, ${brand.navy} 58%, #0b1623 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.04, y: -18 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          initial={{ rotate: -12, scale: 0.9 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto mb-6 h-16 w-16 rounded-full flex items-center justify-center border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(201,168,124,0.25)]"
        >
          <Sparkles className="h-7 w-7" style={{ color: brand.gold }} />
        </motion.div>

        <p className="text-[10px] font-bold uppercase tracking-[0.35em] mb-4" style={{ color: brand.gold }}>
          Top 100 Aerospace & Aviation
        </p>

        <h1
          className="text-4xl md:text-6xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Opening the<br />Nomination Hub
        </h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 180 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeInOut' }}
          className="h-px mx-auto mt-8"
          style={{ background: `linear-gradient(90deg, transparent, ${brand.gold}, transparent)` }}
        />
      </motion.div>
    </div>
  );
}
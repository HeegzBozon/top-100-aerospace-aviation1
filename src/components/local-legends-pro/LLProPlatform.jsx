import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLProPlatform() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 md:p-12 relative overflow-hidden text-center"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: brand.gold }} />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6" style={{ color: brand.gold }}>
              The Platform Connection
            </p>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Local Legends is part of TOP 100 Aerospace & Aviation.
            </h3>

            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-6">
              TOP 100 is the leading institutional recognition platform for accomplished women in aerospace, aviation, and space. 300+ Fellows. 40+ countries. 13,000+ community members. Five years of organic growth.
            </p>

            <p className="text-white/80 text-sm font-medium max-w-md mx-auto mb-3">
              Local Legends is the local layer of that global community.
            </p>

            <p className="text-white/40 text-sm italic max-w-md mx-auto mb-8">
              The Fellows are global. The community is local. The mission is the same.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: brand.gold }}
            >
              Learn about TOP 100 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
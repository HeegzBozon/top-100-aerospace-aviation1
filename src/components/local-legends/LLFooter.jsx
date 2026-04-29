import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLFooter() {
  return (
    <section className="py-20 md:py-28 px-6 text-center" style={{ background: `linear-gradient(160deg, ${brand.navy}, #0d2137)` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `${brand.gold}20` }}>
          <Star className="w-7 h-7" style={{ color: brand.gold }} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready to Get Featured?
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          It costs nothing and takes less than 20 minutes of your time. We'll tell your story, promote your business, and help your neighbors find you. What have you got to lose?
        </p>
        <Button
          size="lg"
          className="rounded-full px-10 text-white font-semibold shadow-xl"
          style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Claim Your Free Spotlight
        </Button>
        <p className="text-[11px] text-white/20 mt-12">
          &copy; {new Date().getFullYear()} Local Legends — Celebrating the Best Businesses in Your Community
        </p>
      </motion.div>
    </section>
  );
}
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLFooter() {
  return (
    <section className="py-20 md:py-28 px-6 text-center" style={{ background: `linear-gradient(160deg, ${brand.navy}, #0d2137)` }}>
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Think Global. Act Local.{' '}
          <span style={{ color: brand.gold }}>Ad Astra.</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link to="/local-legends/apply">
            <Button
              size="lg"
              className="rounded-full px-8 text-white font-semibold shadow-xl gap-2"
              style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
            >
              Apply for your free spotlight <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-white/50 hover:text-white/80 transition-colors flex items-center gap-1.5"
          >
            Learn about TOP 100 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-[11px] text-white/15 mt-16">
          &copy; {new Date().getFullYear()} Local Legends — A TOP 100 Aerospace & Aviation Initiative
        </p>
      </motion.div>
    </section>
  );
}
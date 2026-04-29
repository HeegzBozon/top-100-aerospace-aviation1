import { motion } from 'framer-motion';
import { Rocket, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(160deg, ${brand.navy} 0%, #0d2137 60%, #162d4a 100%)` }}>
      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: brand.gold }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl pointer-events-none" style={{ background: brand.gold }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ background: `${brand.gold}20`, color: brand.gold, border: `1px solid ${brand.gold}30` }}>
            <Rocket className="w-3.5 h-3.5" />
            Strategic Framework for Agency Growth
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          The{' '}
          <span className="relative inline-block">
            <span style={{ color: brand.gold }}>Local Legends</span>
            <span className="absolute -bottom-1 left-0 w-full h-[3px] rounded-full opacity-40" style={{ background: `linear-gradient(90deg, ${brand.gold}, transparent)` }} />
          </span>{' '}
          Model
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          A community-centric lead generation system that transforms web designers into indispensable marketing partners — achieving <strong className="text-white/90">20% response rates</strong> and a path to <strong className="text-white/90">$100K ARR</strong> in 10 months.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="rounded-full px-8 text-white font-semibold text-sm shadow-xl"
            style={{ background: `linear-gradient(135deg, ${brand.gold}, #b08d5b)` }}
            onClick={() => document.getElementById('ll-framework')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore the Framework
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 text-sm font-semibold border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => document.getElementById('ll-metrics')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See the Numbers
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ArrowDown className="w-5 h-5 text-white/30 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
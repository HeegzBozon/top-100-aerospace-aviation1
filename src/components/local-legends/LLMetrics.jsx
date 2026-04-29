import { motion } from 'framer-motion';
import { Eye, Users, TrendingUp, Award } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const METRICS = [
  { icon: Eye, value: '1000s', unit: 'of local eyes', desc: 'Your business featured to your entire community' },
  { icon: Users, value: '20%', unit: 'engagement rate', desc: 'People who see your spotlight take action' },
  { icon: Award, value: 'Free', unit: 'to get started', desc: 'No cost, no commitment — just visibility' },
  { icon: TrendingUp, value: '3×', unit: 'more customers', desc: 'Businesses we feature see measurable growth' },
];

export default function LLMetrics() {
  return (
    <section id="ll-metrics" className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Why Businesses Love Us</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Real Results for Real Businesses
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-slate-100 bg-white p-5 md:p-6 text-center overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }} />
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                </div>
                <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{m.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{m.unit}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
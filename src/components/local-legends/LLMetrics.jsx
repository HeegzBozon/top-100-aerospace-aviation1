import { motion } from 'framer-motion';
import { Mail, Phone, TrendingUp, DollarSign } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const METRICS = [
  { icon: Mail, value: '5', unit: 'emails/day', desc: 'Less than 1 hour of daily effort' },
  { icon: TrendingUp, value: '20%', unit: 'response rate', desc: 'vs. 1% for traditional audits' },
  { icon: Phone, value: '3–5', unit: 'calls/week', desc: 'Qualified discovery conversations' },
  { icon: DollarSign, value: '$100K', unit: 'ARR in 10 months', desc: 'Closing 1 client every 2 weeks' },
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
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Outreach Metrics</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            The Numbers That Matter
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
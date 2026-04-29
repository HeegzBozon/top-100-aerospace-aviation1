import { motion } from 'framer-motion';
import { TrendingUp, Shield, Users, Heart, Quote } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const REASONS = [
  { icon: Users, title: 'We\'re Local — Like You', desc: 'We live here, we shop here, and we genuinely care about seeing local businesses thrive. This isn\'t some faceless agency from across the country.' },
  { icon: Heart, title: 'We Earn It, Not Sell It', desc: 'We start by giving you free exposure with no strings attached. If you love the results, we\'re here to do more. No pressure, ever.' },
  { icon: Shield, title: 'We Stay With You', desc: 'We don\'t just build something and disappear. We monitor, optimize, and grow your online presence month after month as your partner.' },
];

const TESTIMONIALS = [
  { quote: 'I didn\'t even know my website was holding me back until they showed me. Within a month, my phone was ringing more than ever.', name: 'Local Restaurant Owner' },
  { quote: 'The free feature alone brought in 12 new customers. When I signed up for the full plan, it completely changed my business.', name: 'HVAC Contractor' },
  { quote: 'They actually care about my business. It\'s not just "here\'s your website, good luck." They\'re always checking in.', name: 'Hair Salon Owner' },
];

export default function LLScaling() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: `linear-gradient(180deg, white, ${brand.cream})` }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Why Local Legends</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Why Businesses Trust Us
          </h2>
        </motion.div>

        {/* Reasons */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {REASONS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                </div>
                <h4 className="text-sm font-bold mb-1.5" style={{ color: brand.navy }}>{p.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            What Business Owners Say
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 relative"
                style={{ background: brand.cream, border: `1px solid ${brand.gold}20` }}
              >
                <Quote className="w-6 h-6 mb-3 opacity-20" style={{ color: brand.gold }} />
                <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <p className="text-[11px] font-semibold" style={{ color: brand.navy }}>— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
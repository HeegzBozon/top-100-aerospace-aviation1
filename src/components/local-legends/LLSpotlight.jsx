import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Newspaper, TrendingUp } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const STEPS = [
  { num: '01', icon: Sparkles, title: 'We Reach Out to You', desc: 'If we think your business is doing great things for the community, we\'ll invite you to be featured — no strings attached.' },
  { num: '02', icon: MessageSquare, title: 'Quick Chat About Your Story', desc: 'We hop on a friendly 20-minute call to learn about your business, what makes you special, and your goals.' },
  { num: '03', icon: Newspaper, title: 'We Publish Your Feature', desc: 'Your business gets a professionally written spotlight on our community site — shared with your neighbors and potential customers.' },
  { num: '04', icon: TrendingUp, title: 'Watch New Customers Walk In', desc: 'People discover your business through the feature. If you want even more growth, we\'re here to help with that too.' },
];

export default function LLSpotlight() {
  return (
    <section id="ll-how-it-works" className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Four Simple Steps to Getting Featured
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            No paperwork, no contracts, no cost. Just a conversation and a great feature for your business.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl bg-white border border-slate-100 p-6 hover:shadow-md transition-shadow overflow-hidden"
              >
                <span className="absolute top-4 right-5 text-5xl font-bold opacity-[0.04] pointer-events-none" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{s.num}</span>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.gold}12` }}>
                    <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: brand.navy }}>{s.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
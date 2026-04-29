import { motion } from 'framer-motion';
import { PenLine, MessageSquare, Newspaper } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const STEPS = [
  { num: '01', icon: PenLine, title: 'Apply', desc: 'Tell us about your business. Takes 3 minutes.' },
  { num: '02', icon: MessageSquare, title: 'We reach out', desc: 'A short conversation. 20 minutes. We do the writing.' },
  { num: '03', icon: Newspaper, title: 'You get featured', desc: 'Published on Local Legends. Shared to our community. Yours to keep.' },
];

export default function LLHowItWorks() {
  return (
    <section id="ll-how-it-works" className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Three steps. That's it.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative rounded-2xl bg-white border border-slate-100 p-6 md:p-8 text-center hover:shadow-md transition-shadow overflow-hidden"
              >
                <span className="absolute top-3 right-4 text-6xl font-bold opacity-[0.04] pointer-events-none" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{s.num}</span>
                <div className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-6 h-6" style={{ color: brand.gold }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
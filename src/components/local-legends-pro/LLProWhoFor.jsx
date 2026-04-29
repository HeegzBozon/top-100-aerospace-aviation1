import { motion } from 'framer-motion';
import { Briefcase, Clock, Share2 } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const PERSONAS = [
  { icon: Briefcase, scenario: 'You just accepted a role at NASA Ames. You have six weeks and zero local contacts.' },
  { icon: Clock, scenario: 'You\'re on site for three months. You need a gym, a good haircut, and food that isn\'t sad.' },
  { icon: Share2, scenario: 'You\'ve been here for years. You know exactly where to go. And you want to share it.' },
];

export default function LLProWhoFor() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Who This Is For</p>
        </motion.div>

        <div className="space-y-4">
          {PERSONAS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                </div>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed pt-1.5">{p.scenario}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-base font-bold"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}
        >
          Local Legends was built for all three of you.
        </motion.p>
      </div>
    </section>
  );
}
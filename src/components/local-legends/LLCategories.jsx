import { motion } from 'framer-motion';
import { Dumbbell, Sparkles, Scissors, Apple, Baby, Heart } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const CATEGORIES = [
  { icon: Dumbbell, title: 'Fitness & Wellness', desc: 'Boutique studios, yoga, CrossFit, Pilates, cryotherapy.' },
  { icon: Sparkles, title: 'Med Spas', desc: 'The places where professionals restore and reset.' },
  { icon: Scissors, title: 'Hair Salons & Barbers', desc: 'The neighborhood anchors everyone trusts.' },
  { icon: Apple, title: 'Meal Prep & Nutrition', desc: 'Fueling people who can\'t afford to run on empty.' },
  { icon: Baby, title: 'Childcare & Family Services', desc: 'Making careers possible for working parents.' },
  { icon: Heart, title: 'Mental Health & Coaching', desc: 'Because the work is hard and recovery matters.' },
];

export default function LLCategories() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>Who We Spotlight</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            The businesses that keep the community running.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                </div>
                <h3 className="text-sm font-bold mb-1.5" style={{ color: brand.navy }}>{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
import { motion } from 'framer-motion';
import { BookOpen, Compass, Star, Calendar } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const FEATURES = [
  {
    icon: BookOpen,
    title: 'The Directory',
    desc: 'Boutique fitness. Med spas. Salons and barbers. Meal prep. Childcare. Mental health and coaching. Every business has been spotlighted by us and used by the community. No random Yelp results. No guesswork.',
  },
  {
    icon: Compass,
    title: 'The Relocation Guide',
    desc: 'New to the city? This is your starting point. Curated by aerospace professionals who\'ve been here long enough to know the difference. Updated every season.',
  },
  {
    icon: Star,
    title: 'Fellow Picks',
    desc: 'TOP 100 Fellows who live and work in this hub have flagged their personal favorites. When a woman who\'s spent 15 years at JPL tells you where to go, you go.',
  },
  {
    icon: Calendar,
    title: 'Community Events',
    desc: 'What\'s happening locally in the aerospace community. Meetups. Site visits. Panels. The things that don\'t make it onto the big conference calendar.',
  },
];

export default function LLProWhatsInside() {
  return (
    <section id="llpro-whats-inside" className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>What's Inside</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Everything you need, in one place.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-slate-100 p-6 md:p-8 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${brand.gold}12` }}>
                  <Icon className="w-5 h-5" style={{ color: brand.gold }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
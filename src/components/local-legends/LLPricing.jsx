import { motion } from 'framer-motion';
import { Zap, Star, Crown } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const TIERS = [
  {
    icon: Zap,
    name: 'Good',
    tagline: 'Highest priority essentials',
    speed: 'Slow rollout',
    price: '$5,000',
    period: '/year',
    monthly: '$500 setup + $375/mo',
    daily: '~$12.50/day',
    highlight: false,
  },
  {
    icon: Star,
    name: 'Better',
    tagline: 'The sweet spot',
    speed: 'Medium rollout',
    price: '$10–15K',
    period: '/year',
    monthly: 'Variable',
    daily: null,
    highlight: true,
  },
  {
    icon: Crown,
    name: 'Best',
    tagline: 'Full solution immediately',
    speed: 'Fast rollout',
    price: '$20,000',
    period: '/year',
    monthly: 'Variable',
    daily: null,
    highlight: false,
  },
];

export default function LLPricing() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>III. Monetization</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Good, Better, Best
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            One comprehensive solution with three implementation timelines. All clients eventually receive the same full-service outcome — price determines <strong className="text-slate-700">speed</strong>, not features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {TIERS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 md:p-8 border overflow-hidden transition-shadow hover:shadow-lg ${
                  t.highlight
                    ? 'border-2 shadow-md'
                    : 'border-slate-100'
                }`}
                style={t.highlight ? { borderColor: brand.gold, background: `linear-gradient(180deg, ${brand.cream}, white)` } : {}}
              >
                {t.highlight && (
                  <div className="absolute top-0 left-0 w-full text-center py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: brand.gold }}>
                    Most Popular
                  </div>
                )}
                <div className={t.highlight ? 'pt-4' : ''}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: t.highlight ? `${brand.gold}20` : `${brand.navy}08` }}>
                    <Icon className="w-5 h-5" style={{ color: t.highlight ? brand.gold : brand.navy }} />
                  </div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>{t.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{t.tagline}</p>

                  <p className="text-3xl font-bold mb-0.5" style={{ color: brand.navy }}>{t.price}<span className="text-sm font-normal text-slate-400">{t.period}</span></p>
                  <p className="text-[11px] text-slate-400 mb-4">{t.monthly}</p>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: `${brand.navy}08`, color: brand.navy }}>
                      ⚡ {t.speed}
                    </span>
                    {t.daily && <p className="text-[11px] mt-3 text-slate-400">That's just <strong className="text-slate-600">{t.daily}</strong> — less than lunch.</p>}
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
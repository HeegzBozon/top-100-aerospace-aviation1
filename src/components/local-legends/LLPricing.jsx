import { motion } from 'framer-motion';
import { Zap, Star, Crown, Check } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const TIERS = [
  {
    icon: Zap,
    name: 'Get Started',
    tagline: 'Perfect for businesses just getting online',
    speed: 'Essentials first, more over time',
    price: '$12.50',
    period: '/day',
    subprice: 'That\'s less than a lunch combo.',
    features: ['Professional business spotlight', 'Google-ready website', 'Mobile-friendly design', 'Basic SEO setup'],
    highlight: false,
  },
  {
    icon: Star,
    name: 'Grow Faster',
    tagline: 'For businesses ready to level up',
    speed: 'Everything you need, sooner',
    price: '$25–40',
    period: '/day',
    subprice: 'The investment most of our clients choose.',
    features: ['Everything in Get Started', 'Automated review requests', 'Lead follow-up system', 'Monthly strategy calls'],
    highlight: true,
  },
  {
    icon: Crown,
    name: 'Dominate',
    tagline: 'For ambitious businesses that want it all, now',
    speed: 'Full solution, deployed fast',
    price: '$55',
    period: '/day',
    subprice: 'The cost of one missed customer.',
    features: ['Everything in Grow Faster', 'AI-powered lead nurturing', 'Multi-location SEO', 'Dedicated marketing partner'],
    highlight: false,
  },
];

export default function LLPricing() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: brand.gold }}>When You're Ready for More</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            Simple Plans That Grow With You
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
            The spotlight is free. But when you see results and want to accelerate, we have plans that fit <strong className="text-slate-700">any budget</strong>. Every plan includes the same full solution — you just choose your speed.
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
                  t.highlight ? 'border-2 shadow-md' : 'border-slate-100'
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
                  <p className="text-[11px] text-slate-400 mb-5">{t.subprice}</p>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    {t.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: brand.gold }} />
                        <span className="text-xs text-slate-600">{f}</span>
                      </div>
                    ))}
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
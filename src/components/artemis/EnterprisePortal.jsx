import { motion } from 'framer-motion';
import { Building2, ArrowRight, Zap, Lock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIERS = [
  {
    tier: 'The Retainer',
    price: '$10K – $25K',
    avatar: 'Boutique Consulting · Specialized Recruiters',
    features: ['Macro-level voting data trends', 'Limited, supervised alumni introductions', 'Quarterly industry intelligence briefings'],
    color: '#4a90b8',
    syncs: '5–10',
  },
  {
    tier: 'The Accelerator',
    price: '$50K – $75K',
    avatar: 'Venture Capital · Space & Defense Tech',
    features: ['Algorithmic routing prioritization', 'Early access to rising innovators', 'Pre-PR cycle cap-table placement', 'Monthly deal-flow reports'],
    color: '#c9a87c',
    syncs: '20–30',
    featured: true,
  },
  {
    tier: 'The Residency',
    price: '$150K+',
    avatar: 'Prime Aerospace Contractors',
    features: ['Embedded algorithm access', '50+ curated double-opt-in Syncs', 'Exact supply chain parameter matching', 'Dedicated innovation scout integration', 'Custom taxonomy filters'],
    color: '#e88d67',
    syncs: '50+',
  },
];

const SYNC_FLOW = [
  { step: 'Algorithmic Proposal', desc: 'Engine identifies high-probability synergy between sponsor and Fellow.' },
  { step: 'Asynchronous Ping', desc: 'Both parties receive curated brief. Identities obscured until mutual acceptance.' },
  { step: 'Mutual Acceptance', desc: 'Double opt-in triggers calendar API. Secure video conference generated.' },
  { step: 'Feedback Webhook', desc: '48h post-meeting micro-survey updates heuristic weights for future matches.' },
];

export default function EnterprisePortal() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#0a1220' }}>
      {/* Full Earth bg */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/52ed5a0d3_Screenshot2026-04-12at95313PM.png"
          alt="Full Earth"
          className="w-full h-full object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1220] via-[#0a1220]/90 to-[#0a1220]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Enterprise Partner Portal · The Residency</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Corporate scouts. <span className="text-[#c9a87c]">Inside the algorithm.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Lunchclub failed to monetize a massive free user base. We engineered the opposite — artificially restricted supply of elite talent, routed exclusively through the TOP 100 infrastructure. Demand is monetized through tiered access.
          </p>
        </motion.div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {TIERS.map((t, i) => (
            <motion.div
              key={t.tier}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl border bg-white/[0.02] transition-all ${
                t.featured ? 'border-[#c9a87c]/30 ring-1 ring-[#c9a87c]/10' : 'border-white/[0.06]'
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#c9a87c] text-[#0a1526] text-[8px] font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="h-1 w-12 rounded-full mb-4" style={{ background: t.color }} />
              <div className="text-2xl md:text-3xl font-bold font-mono mb-1" style={{ color: t.color }}>{t.price}</div>
              <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{t.tier}</h3>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">{t.avatar}</div>

              {/* Syncs badge */}
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#112240] border border-white/5 mb-4">
                <Zap className="w-3 h-3" style={{ color: t.color }} />
                <span className="text-white text-[10px] font-bold">{t.syncs} Syncs / quarter</span>
              </div>

              <ul className="space-y-2">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-slate-400 text-xs">
                    <Target className="w-3 h-3 shrink-0 mt-0.5" style={{ color: `${t.color}80` }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Double opt-in flow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-8 rounded-2xl border border-white/[0.06] bg-[#0d1b2a]/60 backdrop-blur-sm mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-[#c9a87c]/50" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Double Opt-In Protocol · SWE.4 Verified</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {SYNC_FLOW.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="text-[#c9a87c]/30 text-3xl font-bold font-mono mb-2">{String(i + 1).padStart(2, '0')}</div>
                <h4 className="text-white font-bold text-xs mb-1">{s.step}</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">{s.desc}</p>
                {i < SYNC_FLOW.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
            <Button
              className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
            >
              Invest in the Kinetic Sync Engine
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
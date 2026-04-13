import { motion } from 'framer-motion';
import { Zap, Shield, Network, Users, Target, Radio, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OFFER_TIERS = [
  {
    tier: 'The Retainer',
    price: '$10K – $25K',
    avatar: 'Boutique Firms & Recruiters',
    access: 'Macro-level voting data trends. Limited, supervised introductions to alumni networks.',
    color: '#4a90b8',
  },
  {
    tier: 'The Accelerator',
    price: '$50K – $75K',
    avatar: 'VC Firms (Space / Defense Tech)',
    access: 'Algorithmic routing prioritization. Early introductions to rising innovators before they hit the PR cycle.',
    color: '#c9a87c',
  },
  {
    tier: 'The Residency',
    price: '$150K+',
    avatar: 'Prime Aerospace Contractors',
    access: '"Embedded" access. 50+ curated, double-opt-in Syncs with engineers matching exact supply chain parameters.',
    color: '#e88d67',
  },
];

const ARCHITECTURE = [
  { icon: Target, title: 'Intake Node', desc: 'Proprietary profile integrated into nominee acceptance workflow. Aerospace-specific taxonomy — domain, clearance, strategic vectors.' },
  { icon: Network, title: 'Routing Heuristic', desc: 'Bipartite graph matching weighted by strategic relevance. Supply of talent matched against demand from sponsors and capital scouts.' },
  { icon: Radio, title: 'Validation Loop', desc: 'Post-Sync feedback via automated webhooks. Tracks capital deployed, contracts signed, talent recruited — quantifying institutional impact.' },
  { icon: Users, title: 'HypeSquad Integration', desc: 'First protocol: Calibration Sync with a designated ambassador. White-glove onboarding before Tier 1 routing begins.' },
];

const REVEAL_PHASES = [
  { phase: 'Venus', label: 'The Tease', desc: 'The aerospace industry does not need another digital mixer. It requires a routing protocol. The Top 100 is the industry\'s first operational data refinery.', color: '#a78bfa' },
  { phase: 'Mercury', label: 'The Mechanism', desc: 'Reveal the Kinetic Sync terminology. Highlight exclusivity and rigorous data taxonomy. An unfair advantage, engineered exclusively for the elite.', color: '#c9a87c' },
  { phase: 'Sun', label: 'The Launch', desc: 'Capital is flowing. The future of flight is being engineered in the Sync. Announce activation of Residencies by major defense contractors.', color: '#e88d67' },
];

export default function KineticSyncSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,124,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,124,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Strategic Architecture · Classified</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Kinetic Sync Engine.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mb-4">
            Proprietary algorithmic routing that converts raw prestige into scalable, recurring B2B revenue. Not a networking app. A <span className="text-white font-bold">transformation system</span>.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
            Lunchclub raised $55.9M and collapsed. Both founders left. The algorithm degraded. The lesson: open-market onboarding without gating, taxonomy, or monetization architecture produces a zombie platform. We engineered the opposite.
          </p>
        </motion.div>

        {/* Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {ARCHITECTURE.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#c9a87c]/10 flex items-center justify-center shrink-0 border border-[#c9a87c]/20">
                <a.icon className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">{a.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Firewall callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 rounded-xl border border-[#c9a87c]/20 bg-[#c9a87c]/5 mb-16 flex items-start gap-4"
        >
          <Lock className="w-5 h-5 text-[#c9a87c] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-bold text-sm mb-1">Voting Integrity Firewall</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              The pairwise voting mechanism that determines the Top 100 ranking is cryptographically isolated from the networking algorithm. Sponsorship dollars cannot influence the meritocratic selection of the unseen engineers and founders. Prestige is never compromised by commercial interests.
            </p>
          </div>
        </motion.div>

        {/* B2B Offer Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 w-8 rounded-full bg-[#c9a87c]" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">B2B Offer Stack</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OFFER_TIERS.map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all group relative overflow-hidden"
              >
                {/* Top accent */}
                <div className="h-1 w-12 rounded-full mb-4" style={{ background: t.color }} />
                <div className="text-2xl font-bold font-mono mb-1" style={{ color: t.color }}>{t.price}</div>
                <h4 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{t.tier}</h4>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">{t.avatar}</div>
                <p className="text-slate-400 text-xs leading-relaxed">{t.access}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reveal Sequence */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-[#c9a87c]/60" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Deployment Sequence</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {REVEAL_PHASES.map((p, i) => (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${p.color}20`, color: p.color }}>
                    {p.phase}
                  </span>
                  <span className="text-white font-bold text-sm">{p.label}</span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed italic">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
              <Button
                className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
              >
                Fund the Kinetic Sync Engine
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
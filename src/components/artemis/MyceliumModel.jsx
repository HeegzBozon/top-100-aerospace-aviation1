import { motion } from 'framer-motion';
import { Network, Gem, Briefcase, Rocket, Lock, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PILLARS = [
  {
    num: '01',
    icon: Gem,
    title: '"Competency Porn" SaaS',
    subtitle: 'The Foundation',
    color: '#c9a87c',
    desc: 'In a world of fluff, competency is the ultimate luxury. This isn\'t a public feed — it\'s a high-fidelity data environment. A peer-vetted network of those actually solving the three crises.',
    pricing: [
      { tier: 'Individual Seat', price: '$5,000/yr' },
      { tier: 'Institutional Node', price: '$50,000/yr' },
    ],
    moat: 'Ultra-premium aerospace data + the "Chamber" model.',
  },
  {
    num: '02',
    icon: Briefcase,
    title: '"Marketplace of Solutions"',
    subtitle: 'The Agency',
    color: '#4a90b8',
    desc: 'Not matching people to talk — matching Problems to Solutions. When an aerospace firm has a "Carbon Zero" problem or a modular housing project needs aerospace-grade composites, they plug into the Mycelium.',
    pricing: [
      { tier: 'Transaction Fee', price: '8–15%' },
      { tier: 'Agency Retainer', price: '$25K–$150K' },
    ],
    moat: 'High-margin consultancy on contracts signed through the network.',
  },
  {
    num: '03',
    icon: Rocket,
    title: '"Incubator & Venture"',
    subtitle: 'The Growth Engine',
    color: '#7ecda0',
    desc: 'When the network identifies a gap — say, a specific shortage in sustainable propulsion — the TOP 100 incubates the solution. S-Class data de-risks startups before capital is deployed.',
    pricing: [
      { tier: 'GP Capital', price: '$5M Seed' },
      { tier: 'Equity Stakes', price: 'Per venture' },
    ],
    moat: '"Rapid Response" projects funded by proprietary intelligence.',
  },
];

const SEED_TABLE = [
  { pillar: 'Capital', focus: '$5M Seed', justification: 'Identity & Security vault + Ultra-premium UI/UX (The Aesthetic).' },
  { pillar: 'Moat', focus: 'Aerospace Data', justification: 'Proprietary insights on workforce gap + climate-tech benchmarks.' },
  { pillar: 'Urgency', focus: 'Tri-Crisis', justification: 'Housing / Climate / Workforce nexus solved via Aerospace engineering.' },
  { pillar: 'Brand', focus: 'Moon Joy', justification: 'Replacing "boring corporate aviation" with high-energy Competency Porn.' },
];

const TRI_CRISIS = [
  { crisis: 'Workforce', desc: 'The demand crisis. 2.1M unfilled aerospace roles by 2030.', color: '#c9a87c' },
  { crisis: 'Housing', desc: 'Aerospace-grade composites and modular manufacturing applied to shelter.', color: '#4a90b8' },
  { crisis: 'Climate', desc: 'Advanced materials, logistics, and engineering rigor — the master key.', color: '#7ecda0' },
];

export default function MyceliumModel() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,124,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Network className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">The Mycelium Model · Industry Infrastructure</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Not a platform. <span className="text-[#c9a87c]">An Economic Organism.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-3xl mb-4">
            Ticketmaster owns the seat. Eventbrite owns the event. <span className="text-white font-bold">TOP 100 owns the expertise.</span> By integrating a Chamber of Commerce (Trust), an Agency (Action), and Venture Capital (Growth), we create a self-sustaining cycle that captures the highest-margin data in the $1.4T aerospace sector.
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
            A decentralized but hyper-connected system that feeds the industry while recycling its waste. Aerospace is the only industry with the advanced materials, logistics, and engineering rigor required to solve all three crises simultaneously.
          </p>
        </motion.div>

        {/* Tri-Crisis Nexus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {TRI_CRISIS.map((c, i) => (
            <motion.div
              key={c.crisis}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center"
            >
              <div className="text-3xl font-bold font-mono mb-1" style={{ color: `${c.color}40` }}>{String(i + 1).padStart(2, '0')}</div>
              <h4 className="text-white font-bold text-sm mb-1">{c.crisis} Crisis</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Three Pillars */}
        <div className="space-y-4 mb-16">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 md:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* Left — identity */}
                <div className="md:w-1/3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                      <p.icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <div>
                      <div className="text-[9px] font-mono font-bold tracking-wider" style={{ color: `${p.color}80` }}>PILLAR {p.num}</div>
                      <h3 className="text-white font-bold text-sm">{p.title}</h3>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${p.color}15`, color: p.color }}>
                    {p.subtitle}
                  </span>
                </div>

                {/* Middle — description */}
                <div className="md:w-1/3">
                  <p className="text-slate-400 text-xs leading-relaxed mb-2">{p.desc}</p>
                  <p className="text-slate-600 text-[10px] italic">{p.moat}</p>
                </div>

                {/* Right — pricing */}
                <div className="md:w-1/3 flex flex-col gap-2">
                  {p.pricing.map(pr => (
                    <div key={pr.tier} className="flex items-center justify-between p-2.5 rounded-lg bg-[#112240]/50 border border-white/5">
                      <span className="text-slate-400 text-[10px]">{pr.tier}</span>
                      <span className="text-white font-bold text-sm font-mono" style={{ color: p.color }}>{pr.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* $5M Seed Case */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-8 rounded-2xl border border-[#c9a87c]/15 bg-[#0d1b2a]/60 backdrop-blur-sm mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-[#c9a87c]/50" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">The $5M Seed Case — "The Institutional Lighthouse"</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {SEED_TABLE.map((s, i) => (
              <motion.div
                key={s.pillar}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-[#112240]/50 border border-white/5"
              >
                <div className="text-[#c9a87c] font-bold text-xs uppercase tracking-wider mb-1">{s.pillar}</div>
                <div className="text-white font-bold text-sm mb-2">{s.focus}</div>
                <p className="text-slate-500 text-[10px] leading-relaxed">{s.justification}</p>
              </motion.div>
            ))}
          </div>

          {/* Gating model */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-[#a78bfa]/20 bg-[#a78bfa]/5">
            <Lock className="w-5 h-5 text-[#a78bfa] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-bold text-xs mb-1">Competency-Gated · Not Invitation-Only</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                To maintain the "S-Class" / "Ultra Premium" aesthetic, the TOP 100 is <span className="text-white font-bold">competency-gated</span>: you must prove your skill to enter. This builds the strongest "Competency Porn" brand — legitimacy earned, not gifted.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Financial narrative quote + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <blockquote className="text-white/80 text-lg md:text-xl italic leading-relaxed mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            "We are not building a platform; we are building an Economic Organism. By integrating Trust, Action, and Growth, we create a self-sustaining cycle that solves the three greatest crises of our time while capturing the highest-margin data in the $1.4T aerospace sector."
          </blockquote>

          <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
            <Button
              className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
            >
              Invest in the Mycelium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
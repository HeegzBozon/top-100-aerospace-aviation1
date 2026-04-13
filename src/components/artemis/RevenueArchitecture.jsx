import { motion } from 'framer-motion';
import { Layers, Brain, MapPin, GraduationCap, Crown, DollarSign, ArrowRight, ShieldCheck, Globe, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ELEMENTS = [
  {
    name: 'The "Pulse"',
    model: 'Lunchclub',
    icon: Brain,
    purpose: 'AI-driven 1-on-1 matches for S-Class peers. Matching a Materials Scientist with a Housing Developer. Serendipity, engineered.',
    revenue: 'SaaS Subscription — "Pro" tiers for unlimited high-value intros.',
    color: '#c9a87c',
  },
  {
    name: 'The "Roots"',
    model: 'Meetup',
    icon: MapPin,
    purpose: 'Local, secure "Chambers" for regional aerospace hubs — Seattle, Toulouse, Bangalore, São José dos Campos.',
    revenue: 'Node Fees — Local organizers pay for the Institutional Toolkit.',
    color: '#4a90b8',
  },
  {
    name: 'The "Bloom"',
    model: 'Eventbrite',
    icon: GraduationCap,
    purpose: 'Self-service technical workshops and "Competency Porn" seminars. Knowledge transfer at scale.',
    revenue: 'Ticketing Fees — 2–5% per seat for professional training events.',
    color: '#7ecda0',
  },
  {
    name: 'The "Crown"',
    model: 'Ticketmaster',
    icon: Crown,
    purpose: 'High-security, exclusive access to major airshows and global "Moon Joy" summits. The premium layer.',
    revenue: 'Exclusive Rights — High-end service fees on $1,000+ badges.',
    color: '#e88d67',
  },
];

const SPEND = [
  { amount: '$1.5M', label: 'AI Matching Engine', desc: 'The "Lunchclub" intelligence, purpose-built for Aerospace.', color: '#c9a87c', pct: 30 },
  { amount: '$1.0M', label: 'Security & ITAR Vault', desc: 'The S-Class barrier to entry. FAA/EASA verification.', color: '#4a90b8', pct: 20 },
  { amount: '$1.5M', label: '"Moon Joy" Global Launch', desc: 'Domination of Paris / Farnborough Airshow cycle.', color: '#e88d67', pct: 30 },
  { amount: '$1.0M', label: 'Mycelium Liquidity', desc: 'Operating incubator/agency until consultancy fees kick in.', color: '#7ecda0', pct: 20 },
];

export default function RevenueArchitecture() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#0a1220' }}>
      {/* Moon photo bg */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/f5ca8421b_Screenshot2026-04-12at95354PM.png"
          alt="Moon with Earth"
          className="w-full h-full object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1220] via-[#0a1220]/90 to-[#0a1220]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Full-Stack Vertical Play · Revenue Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            A digital sovereign state <span className="text-[#c9a87c]">for Aerospace.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-3xl">
            Lunchclub's serendipity. Meetup's community infrastructure. Eventbrite's discovery engine. Ticketmaster's transaction power. Integrated into one vertically-aligned organism. Not feature creep — <span className="text-white font-bold">vertical integration</span>.
          </p>
        </motion.div>

        {/* Four Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {ELEMENTS.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${e.color}15`, border: `1px solid ${e.color}25` }}>
                  <e.icon className="w-4 h-4" style={{ color: e.color }} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{e.name}</h4>
                  <span className="text-[8px] font-mono font-bold tracking-wider" style={{ color: `${e.color}80` }}>← {e.model}</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{e.purpose}</p>
              <div className="p-2.5 rounded-lg bg-[#112240]/50 border border-white/5">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3" style={{ color: `${e.color}80` }} />
                  <span className="text-white text-[11px] font-bold">{e.revenue}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Moat Arguments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <ShieldCheck className="w-5 h-5 text-[#c9a87c] mb-3" />
            <h4 className="text-white font-bold text-sm mb-2">Competency-Gated Moat</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-2">
              Unlike LinkedIn, where anyone can claim to be an engineer, TOP 100 validates FAA/EASA certifications and security clearances.
            </p>
            <p className="text-[#c9a87c] text-[11px] italic">
              "The first platform where an S-Class engineer can network without the noise. We are the Signal in a world of Noise."
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Globe className="w-5 h-5 text-[#4a90b8] mb-3" />
            <h4 className="text-white font-bold text-sm mb-2">Tri-Crisis Data Engine</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-2">
              Track where the world's best talent is moving. The Consultancy arm uses this data to help governments deploy Rapid Response teams to housing and climate disasters.
            </p>
            <p className="text-[#4a90b8] text-[11px] italic">
              "We know exactly which engineers are working on hydrogen propulsion."
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <Cpu className="w-5 h-5 text-[#7ecda0] mb-3" />
            <h4 className="text-white font-bold text-sm mb-2">Institutional Lighthouse</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-2">
              VCs are obsessed with "High-Resolution Networks." Reduce time-to-hire for one Senior Engineer at Boeing — currently ~$100K in headhunter fees.
            </p>
            <p className="text-[#7ecda0] text-[11px] italic">
              "The network pays for itself in 50 matches."
            </p>
          </motion.div>
        </div>

        {/* $5M Spend Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-8 rounded-2xl border border-[#c9a87c]/15 bg-[#0d1b2a]/60 backdrop-blur-sm mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-4 h-4 text-[#c9a87c]/50" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Strategic $5M Allocation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {SPEND.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                {/* Percentage ring */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={s.color} strokeWidth="2.5"
                      strokeDasharray={`${s.pct} ${100 - s.pct}`} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs font-mono">{s.pct}%</span>
                  </div>
                </div>
                <div className="text-lg font-bold font-mono mb-1" style={{ color: s.color }}>{s.amount}</div>
                <h4 className="text-white font-bold text-xs mb-1">{s.label}</h4>
                <p className="text-slate-500 text-[10px] leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Context note */}
          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-slate-600 text-[10px] font-mono">
              2026 Median Seed: $3.1M · TOP 100 premium justified by Verification Layer for entire industry
            </p>
          </div>
        </motion.div>

        {/* Closing argument */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <blockquote className="text-white/80 text-lg md:text-xl italic leading-relaxed mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            "Ticketmaster owns the venue. Eventbrite owns the ticket. Lunchclub owns the meeting.{' '}
            <span className="text-[#c9a87c] font-bold not-italic">TOP 100 owns the Progress.</span>{' '}
            We are the infrastructure that turns the aerospace workforce into a rapid-response force for Earth's survival."
          </blockquote>

          <a href="https://wefunder.com/top.100.aerospace.aviation" target="_blank" rel="noopener noreferrer">
            <Button
              className="text-[#0a1526] font-bold px-8 py-6 rounded-full text-sm shadow-[0_0_30px_rgba(201,168,124,0.3)] hover:shadow-[0_0_50px_rgba(201,168,124,0.5)] transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4a574)' }}
            >
              Fund the sovereign state
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
import { motion } from 'framer-motion';
import { Calendar, Mic, Clock, Shield, BarChart3, Users } from 'lucide-react';

const CRM_PRINCIPLES = [
  { icon: Users, title: 'Shared Mental Model', desc: 'Every deployed team operates from identical mission parameters. No ambiguity. No information asymmetry.', color: '#4a90b8' },
  { icon: Mic, title: 'Structured Decision-Making', desc: 'Standardized briefing protocols. Crew Resource Management doctrine enforced at every assembly.', color: '#c9a87c' },
  { icon: Shield, title: 'Clear Comms Under Pressure', desc: 'Aviation-grade communication standards. No "vibes." Operational clarity when stakes are measured in billions.', color: '#7ecda0' },
];

const TUCKMAN_STAGES = [
  { stage: 'Forming', desc: 'AI-curated match. Initial Kinetic Sync. Introductions executed.', color: '#4a90b8', pct: 25 },
  { stage: 'Storming', desc: 'Structured meeting agendas deployed. Misalignments overcome.', color: '#c9a87c', pct: 50 },
  { stage: 'Norming', desc: 'Async knowledge sharing. Shared objectives crystallized.', color: '#7ecda0', pct: 75 },
  { stage: 'Performing', desc: 'Economic velocity tracked. Capital deployed. Contracts signed.', color: '#a78bfa', pct: 100 },
];

export default function RendezvousProtocol() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Craters bg */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/01ea63a2b_Screenshot2026-04-12at95331PM.png"
          alt="Lunar craters"
          className="w-full h-full object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d1a] via-[#060d1a]/90 to-[#060d1a]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">The Rendezvous Protocol · Operations</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Digital matches. <span className="text-[#c9a87c]">Physical assemblies.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Solving virtual fatigue by fusing algorithmic matching with premium, gated physical events. The Rendezvous Protocol transitions the product from an open digital mixer into a ticketed marketplace — validating the B2B monetization strategy.
          </p>
        </motion.div>

        {/* CRM Dashboard mock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {CRM_PRINCIPLES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${c.color}15`, border: `1px solid ${c.color}25` }}>
                <c.icon className="w-5 h-5" style={{ color: c.color }} />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{c.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tuckman stages — Scrum Master dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-8 rounded-2xl border border-white/[0.06] bg-[#0d1b2a]/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-[#c9a87c]/60" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Automated Scrum Master — Team Lifecycle</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TUCKMAN_STAGES.map((t, i) => (
              <div key={t.stage} className="text-center">
                {/* Progress ring */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                    <circle
                      cx="18" cy="18" r="16" fill="none"
                      stroke={t.color}
                      strokeWidth="2"
                      strokeDasharray={`${t.pct} ${100 - t.pct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs font-mono">{t.pct}%</span>
                  </div>
                </div>
                <h4 className="text-white font-bold text-xs mb-1">{t.stage}</h4>
                <p className="text-slate-500 text-[9px] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Dunbar's + Master Mind */}
          <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[9px] text-slate-600 font-mono uppercase tracking-wider justify-center">
            <span>Dunbar's Number: ~150 stable relationships</span>
            <span>·</span>
            <span>Napoleon Hill's Master Mind Principle</span>
            <span>·</span>
            <span>Aviation CRM Doctrine</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
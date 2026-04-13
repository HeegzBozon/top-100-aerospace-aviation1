import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2, ArrowRight, Shield, Users, Fingerprint } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Nomination & Vetting',
    desc: 'Nominee submitted via the community or institutional pipeline. Background verified against aerospace-specific ontology.',
    icon: UserPlus,
    color: '#4a90b8',
    status: 'COMPLETE',
  },
  {
    step: '02',
    title: 'Taxonomy Mapping',
    desc: 'Proprietary profile created during induction. Domain expertise, clearance level, ASPICE lifecycle stage, and strategic vectors hard-coded.',
    icon: Fingerprint,
    color: '#c9a87c',
    status: 'IN PROGRESS',
  },
  {
    step: '03',
    title: 'Calibration Sync',
    desc: 'First protocol: paired with a designated HypeSquad operational liaison. White-glove onboarding verifies taxonomy data before Tier 1 routing.',
    icon: Users,
    color: '#7ecda0',
    status: 'QUEUED',
  },
  {
    step: '04',
    title: 'Colony Deployment',
    desc: 'Cleared for algorithmic routing. Fellow enters the Kinetic Sync Engine and is matched against sponsor demand and capital scouts.',
    icon: Shield,
    color: '#a78bfa',
    status: 'PENDING',
  },
];

export default function ColonyRecruitment() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#0a1220' }}>
      {/* Earthrise bg */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/68996845be6727838fdb822e/4dfbdda33_Screenshot2026-04-12at95337PM.png"
          alt="Earthrise"
          className="w-full h-full object-cover opacity-[0.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1220] via-[#0a1220]/90 to-[#0a1220]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <UserPlus className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Colony Recruitment · The Intake Node</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            How engineers are inducted. <span className="text-[#c9a87c]">Not onboarded.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Unlike open-market platforms that let anyone in and degrade the algorithm, every Fellow passes through a four-stage intake protocol. The Calibration Sync with a HypeSquad liaison ensures taxonomy accuracy before any routing begins.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              {/* Step number */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold font-mono" style={{ color: `${s.color}30` }}>{s.step}</span>
                <span className={`text-[8px] font-bold font-mono tracking-wider px-1.5 py-0.5 rounded-full ${
                  s.status === 'COMPLETE' ? 'bg-emerald-500/15 text-emerald-400' :
                  s.status === 'IN PROGRESS' ? 'bg-[#c9a87c]/15 text-[#c9a87c]' :
                  'bg-slate-500/10 text-slate-500'
                }`}>{s.status}</span>
              </div>

              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>

              <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>

              {/* Arrow connector (not on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-white/10" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Calibration Sync callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-6 rounded-xl border border-[#7ecda0]/20 bg-[#7ecda0]/5 flex items-start gap-4"
        >
          <CheckCircle2 className="w-6 h-6 text-[#7ecda0] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-bold text-sm mb-1">The Calibration Sync</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              The HypeSquad is not a passive promotional street team. They are elite operational liaisons who verify every Fellow's taxonomy data, integrate them into the community gravity, and ensure white-glove onboarding before algorithmic routing begins. This transforms ambassadors into mission-critical infrastructure.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
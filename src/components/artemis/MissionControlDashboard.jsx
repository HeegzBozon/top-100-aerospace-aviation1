import { motion } from 'framer-motion';
import { Monitor, Shield, Zap, Globe, Lock, ChevronRight } from 'lucide-react';

const SAMPLE_PROFILES = [
  {
    user_id: 'AERO-100-2026-036',
    name: 'J. Noel',
    tier: 'Innovator',
    domains: ['Propulsion Systems', 'Human Landing System'],
    clearance: 'DoD Secret / ITAR Compliant',
    stage: 'SYS.3 — Architecture Design',
    objectives: ['HLS Integration', 'Lunar Descent Validation'],
    cadence: 'Bi-weekly',
    routing: 'Async API Scheduling',
    status: 'ACTIVE',
  },
  {
    user_id: 'AERO-100-2026-094',
    name: 'H. Pascal',
    tier: 'Operator',
    domains: ['SCaN Communications', 'Deep Space Network'],
    clearance: 'NASA Headquarters Cleared',
    stage: 'SWE.4 — Verification',
    objectives: ['Optical Comms Upgrade', 'Relay Architecture'],
    cadence: 'Weekly',
    routing: 'Direct Calendar Sync',
    status: 'ACTIVE',
  },
  {
    user_id: 'AERO-100-2026-091',
    name: 'M. Yashar',
    tier: 'Architect',
    domains: ['Space Architecture', 'Human-Machine Interaction'],
    clearance: 'Unclassified — Academic',
    stage: 'SYS.2 — Architectural Design',
    objectives: ['Habitat Psychology', 'Crew Ergonomics'],
    cadence: 'Monthly',
    routing: 'Async API Scheduling',
    status: 'STANDBY',
  },
];

const TAG_COLORS = {
  'Innovator': '#c9a87c',
  'Operator': '#4a90b8',
  'Architect': '#7ecda0',
};

function ProfilePanel({ profile, delay }) {
  const tierColor = TAG_COLORS[profile.tier] || '#c9a87c';
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-4 md:p-5 rounded-xl border border-white/[0.08] bg-[#0d1b2a]/80 backdrop-blur-sm font-mono text-xs hover:border-white/[0.15] transition-all"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#c9a87c]/60 text-[9px]">{profile.user_id}</span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider" style={{ background: `${tierColor}20`, color: tierColor }}>
            {profile.tier}
          </span>
        </div>
        <span className={`text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
          profile.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'
        }`}>{profile.status}</span>
      </div>

      {/* Name + clearance */}
      <div className="text-white font-bold text-sm mb-1 font-sans">{profile.name}</div>
      <div className="flex items-center gap-1 mb-3">
        <Lock className="w-2.5 h-2.5 text-[#c9a87c]/50" />
        <span className="text-[#c9a87c]/60 text-[9px]">{profile.clearance}</span>
      </div>

      {/* Domain tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {profile.domains.map(d => (
          <span key={d} className="px-2 py-0.5 rounded-full bg-[#112240] border border-white/5 text-white/70 text-[9px]">{d}</span>
        ))}
      </div>

      {/* ASPICE stage */}
      <div className="text-slate-500 text-[9px] mb-2">{profile.stage}</div>

      {/* Objectives */}
      <div className="border-t border-white/5 pt-2 mt-2">
        <div className="text-slate-600 text-[8px] uppercase tracking-wider mb-1">Strategic Vectors</div>
        {profile.objectives.map(o => (
          <div key={o} className="flex items-center gap-1">
            <ChevronRight className="w-2.5 h-2.5 text-[#4a90b8]/50" />
            <span className="text-white/50 text-[9px]">{o}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[8px] text-slate-600">
        <span>{profile.cadence}</span>
        <span>{profile.routing}</span>
      </div>
    </motion.div>
  );
}

export default function MissionControlDashboard() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,124,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,124,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Mission Control · Kinetic Sync Engine</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            The routing protocol. <span className="text-[#c9a87c]">Live.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Aerospace-specific taxonomy. Clearance-gated profiles. ASPICE lifecycle stages. Every Fellow mapped by domain, strategic vector, and routing preference. Not generic interests — operational parameters.
          </p>
        </motion.div>

        {/* JSON Schema Preview */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 p-4 md:p-6 rounded-xl border border-[#c9a87c]/15 bg-[#0a1526]/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-[#c9a87c]/50" />
            <span className="text-[9px] font-mono font-bold tracking-wider text-[#c9a87c]/50 uppercase">kinetic_sync_profile.schema.json</span>
          </div>
          <pre className="text-[10px] md:text-xs font-mono text-slate-400 leading-relaxed overflow-x-auto">
{`{
  "user_id": "AERO-100-2026-045",
  "classification_tier": "Innovator",
  "domain_expertise": ["Propulsion Systems", "Orbital Logistics"],
  "aspice_lifecycle_stage": "SYS.3 — Architecture Design",
  "clearance_status": "DoD Secret / ITAR Compliant",
  "strategic_objectives": ["Series A Capital", "Supply Chain Integration"],
  "availability_cadence": "Bi-weekly",
  "routing_preference": "Asynchronous API Scheduling"
}`}
          </pre>
        </motion.div>

        {/* Profile panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {SAMPLE_PROFILES.map((p, i) => (
            <ProfilePanel key={p.user_id} profile={p} delay={i * 0.1} />
          ))}
        </div>

        {/* Status bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 text-[9px] font-mono text-slate-600 uppercase tracking-wider"
        >
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 3 Fellows Active</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#c9a87c]/40" /> Routing Engine Online</span>
          <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-[#4a90b8]/40" /> 49 Countries Mapped</span>
        </motion.div>
      </div>
    </section>
  );
}
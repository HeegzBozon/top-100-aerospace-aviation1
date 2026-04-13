import { motion } from 'framer-motion';
import { Wrench, Zap, BarChart3, Mic, Clock, Moon } from 'lucide-react';

const PHASES = [
  {
    day: 'Tuesday',
    label: 'Construct & Deploy',
    icon: Wrench,
    desc: 'Habitat assembly. Module integration. Live builds on the regolith. The week opens with what\'s going up.',
    color: '#4a90b8',
    mission: 'PHASE 1 · CONSTRUCTION',
  },
  {
    day: 'Wednesday',
    label: 'Swarm Ops',
    icon: Zap,
    desc: 'Multi-crew challenges. System hackathons. AMAs from the field. The middle of the week is where the colony solves hard problems together.',
    color: '#c9a87c',
    mission: 'PHASE 2 · OPERATIONS',
  },
  {
    day: 'Thursday',
    label: 'Debrief & Log',
    icon: BarChart3,
    desc: 'Mission debrief. Pitch practice. Demo day. Time Capsule review. The week closes with what was learned and what ships.',
    color: '#7ecda0',
    mission: 'PHASE 3 · DEBRIEF',
  },
];

export default function CadenceSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#080e1a' }}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,168,124,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,124,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Moon className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Lunar Operations Cadence</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Three weeks. Nine sorties. <span className="text-[#c9a87c]">One lunar sprint.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Moon Base Alpha runs on the same cadence as the platform being built inside it. Three-week sprints. Form, storm, norm, perform. Every session is a ceremony. Every ceremony is on the record.
          </p>
        </motion.div>

        {/* 3-column mission phases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PHASES.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-500">
                {/* Mission phase label */}
                <div className="text-[9px] font-mono font-bold tracking-[0.2em] mb-4" style={{ color: `${d.color}80` }}>
                  {d.mission}
                </div>

                {/* Top accent line */}
                <div className="h-1 w-12 rounded-full mb-6" style={{ background: d.color }} />

                <div className="flex items-center gap-3 mb-4">
                  <d.icon className="w-5 h-5" style={{ color: d.color }} />
                  <span className="text-white/50 text-xs font-bold uppercase tracking-[0.15em]">{d.day}</span>
                </div>

                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {d.label}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">{d.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily scrum + Why Tue-Thu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Mic className="w-4 h-4 text-[#c9a87c]" />
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">The daily comms check</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fifteen minutes at the top of every session. Five-minute async video posted each morning for anyone who can't be live on station. The pulse of the sprint, transmitted from the surface.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-4 h-4 text-[#4a90b8]" />
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Why Tuesday through Thursday</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mondays are for pre-flight checks. Fridays are for data downlink and rest. The middle three days are the global crew rotation window. We built the cadence around when the colony is fully staffed.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
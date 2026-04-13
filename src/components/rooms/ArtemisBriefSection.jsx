import { motion } from 'framer-motion';
import { Rocket, Target, Camera, Radio, FlaskConical, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MILESTONES = [
  { value: '252,760', unit: 'miles', label: 'Farthest from Earth', sub: '~7:07 PM ET · Record-setting distance', color: '#c9a87c' },
  { value: '470', unit: 'miles', label: 'Closest lunar approach', sub: 'Record-setting flyby altitude', color: '#4a90b8' },
  { value: '100', unit: 'Mbps', label: 'Optical comms bandwidth', sub: 'Laser link via White Sands, NM', color: '#7ecda0' },
  { value: '~35', unit: 'targets', label: 'Lunar science observations', sub: '5-hour continuous flyby window', color: '#a78bfa' },
];

const SCIENCE = [
  { icon: Camera, title: 'Color & Albedo Mapping', desc: 'Human eyes uniquely distinguish color provinces — the #1 priority science objective for the flyby.' },
  { icon: Target, title: 'Landing Site Survey', desc: 'Apollo 12 & 14 sites documented from orbit. Future Artemis surface mission planning validated.' },
  { icon: FlaskConical, title: 'Reiner Gamma Anomaly', desc: 'Magnetic swirl feature observed under rare illumination. Drives future CLPS lander targeting.' },
  { icon: Navigation, title: 'South Polar Region', desc: 'South Pole-Aitken Basin observed under conditions never before seen by human eyes.' },
];

const TIMELINE = [
  { time: 'Apr 2', event: 'Launch — Kennedy Space Center', color: '#4a90b8', active: false },
  { time: 'Apr 5', event: 'Lunar sphere of influence entry', color: '#4a90b8', active: false },
  { time: 'Apr 6 ~2 PM', event: 'Apollo 13 distance record broken — 248,655 mi', color: '#c9a87c', active: true },
  { time: 'Apr 6', event: '5-hour flyby observation window · 35 science targets', color: '#c9a87c', active: true },
  { time: 'Apr 6 7:07 PM', event: 'Maximum distance: 252,760 miles from Earth', color: '#e88d67', active: true },
  { time: 'Post-flyby', event: 'Data retrieval sprint — imagery released to public pipeline', color: '#7ecda0', active: false },
];

const SYSTEMS = [
  { status: 'NOMINAL', label: 'Optical comms', desc: '100 Mbps via White Sands', ok: true },
  { status: 'NOMINAL', label: 'Trajectory', desc: 'TLI precise; minimal corrections', ok: true },
  { status: 'NOMINAL', label: 'Orion control laws', desc: 'Stops rapidly on command', ok: true },
  { status: 'MONITOR', label: 'Mystery smell', desc: 'Source unidentified; monitored', ok: false },
];

export default function ArtemisBriefSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#060d1a' }}>
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none">
        <div className="w-full h-full bg-[#c9a87c]/[0.03] blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase">Live Mission Intelligence</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Artemis II. <span className="text-[#c9a87c]">Tracked from the surface.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            The first crewed lunar flyby since Apollo 17 in 1972. Moon Base Alpha tracks every phase — trajectory corrections, science observations, and crew activities — in real time. Every honoree in our community contributed to the ecosystem that made this mission possible.
          </p>
        </motion.div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {MILESTONES.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl md:text-3xl font-bold font-mono" style={{ color: m.color }}>{m.value}</span>
                <span className="text-xs font-mono text-white/30">{m.unit}</span>
              </div>
              <div className="text-white text-sm font-bold mb-1">{m.label}</div>
              <div className="text-slate-500 text-[11px]">{m.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Two-column: Science + Systems */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Science Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 rounded-full bg-[#4a90b8]" />
              <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Flyby Science Objectives</h3>
            </div>
            <div className="space-y-3">
              {SCIENCE.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#4a90b8]/10 flex items-center justify-center shrink-0">
                    <s.icon className="w-4 h-4 text-[#4a90b8]" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{s.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Systems Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 rounded-full bg-[#c9a87c]" />
              <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Systems Status — Day 4</h3>
            </div>
            <div className="space-y-3 mb-6">
              {SYSTEMS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <span className={`text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full ${
                    s.ok ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#c9a87c]/15 text-[#c9a87c]'
                  }`}>
                    {s.status}
                  </span>
                  <div>
                    <span className="text-white font-bold text-sm">{s.label}</span>
                    <span className="text-slate-500 text-xs ml-2">{s.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Apollo 13 callout */}
            <div className="p-5 rounded-xl border border-[#c9a87c]/20 bg-[#c9a87c]/5">
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#c9a87c]/60 uppercase mb-2">Record Alert</div>
              <p className="text-white text-sm font-bold mb-1">Apollo 13 distance record broken</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Artemis II surpasses 248,655 statute miles — the deepest human spaceflight in history. First humans to see the lunar far side with their own eyes.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Radio className="w-4 h-4 text-[#c9a87c]/60" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Mission Timeline</h3>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-5 top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-4">
              {TIMELINE.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-4 items-start pl-1"
                >
                  {/* Dot */}
                  <div className="relative z-10 mt-1.5">
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        borderColor: t.color,
                        background: t.active ? t.color : 'transparent',
                        boxShadow: t.active ? `0 0 10px ${t.color}40` : 'none',
                      }}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider" style={{ color: t.color }}>{t.time}</span>
                    <p className="text-white/80 text-sm">{t.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA to full brief */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4"
        >
          <Link to="/artemis-mission-brief">
            <Button
              variant="outline"
              className="border-[#c9a87c]/30 text-[#c9a87c] hover:bg-[#c9a87c]/10 rounded-full text-xs px-6 cursor-pointer"
            >
              View full mission brief deck →
            </Button>
          </Link>
          <Link to="/artemis-2">
            <Button
              variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/10 rounded-full text-xs px-6 cursor-pointer"
            >
              Read the Artemis II editorial
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
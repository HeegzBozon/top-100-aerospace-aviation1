import { motion } from 'framer-motion';

const RINGS = [
  {
    label: 'Core Crew',
    size: '~50',
    desc: 'Weekly operators. The people on station when the airlocks open. Fellows, founders, builders, mission specialists. The ones in the habitat when the camera turns on.',
    color: '#c9a87c',
    ringSize: 'w-48 h-48 md:w-56 md:h-56',
  },
  {
    label: 'Extended Rotation',
    size: '~150',
    desc: 'Async contributors. Mission log readers. Occasional live crew. The specialists who rotate in when the session hits their area of expertise.',
    color: '#4a90b8',
    ringSize: 'w-64 h-64 md:w-80 md:h-80',
  },
  {
    label: 'Ground Control',
    size: 'Unlimited',
    desc: 'LinkedIn Live observers. Newsletter subscribers. Podcast listeners. Wefunder backers. Anyone on Earth who wants to watch the crew work from lunar orbit.',
    color: '#3a5a7a',
    ringSize: 'w-80 h-80 md:w-[420px] md:h-[420px]',
  },
];

export default function TribeSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#0a1220' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Three rings. <span className="text-[#c9a87c]">One colony.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Moon Base Alpha is sized deliberately. Not everyone who watches from Earth is a crew member. Not every crew member is in the core rotation. The rings are how the colony stays tight without shutting anyone out.
            </p>

            {/* Ring descriptions */}
            <div className="space-y-6">
              {RINGS.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-1 rounded-full shrink-0" style={{ background: r.color }} />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold">{r.label}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: `${r.color}20`, color: r.color }}>
                        {r.size}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Promise */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10 p-5 rounded-xl border border-[#c9a87c]/20 bg-[#c9a87c]/5"
            >
              <p className="text-sm text-[#c9a87c]/80 leading-relaxed italic">
                "You don't need a flight rating to observe from ground control. You don't need to be famous to join the crew. You need to show up, contribute, and respect the habitat. That's the whole bar for deployment."
              </p>
            </motion.div>
          </motion.div>

          {/* Visual: Concentric Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]"
          >
            {RINGS.slice().reverse().map((r, i) => (
              <motion.div
                key={r.label}
                className={`absolute rounded-full border-2 flex items-center justify-center ${r.ringSize}`}
                style={{ borderColor: `${r.color}40` }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 80 + i * 30, repeat: Infinity, ease: 'linear' }}
              >
                {/* Dot on ring */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                  style={{ background: r.color, boxShadow: `0 0 12px ${r.color}60` }}
                />
              </motion.div>
            ))}

            {/* Center label */}
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 rounded-full bg-[#c9a87c]/20 flex items-center justify-center mx-auto mb-2 border border-[#c9a87c]/30">
                <span className="text-[#c9a87c] font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>50</span>
              </div>
              <span className="text-white/40 text-[10px] uppercase tracking-widest">Core crew</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
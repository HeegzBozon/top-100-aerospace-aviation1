import { motion } from 'framer-motion';
import { Compass, Telescope, Diamond, Target, ArrowRight, Flame, Heart, Shield } from 'lucide-react';

const VALUES = [
  {
    name: 'Eagle Oath',
    icon: Shield,
    def: 'Strength & Honor.',
    action: 'Admitting mistakes early and often. Integrity under pressure. The code of conduct that governs every decision.',
    color: '#4a90b8',
  },
  {
    name: 'Mamba Mentality',
    icon: Flame,
    def: 'Drive. Ambition. Devotion. Moving with intent.',
    action: 'Shipping the "good" version today instead of the "perfect" one next month. Velocity over vanity. Just works.',
    color: '#c9a87c',
  },
  {
    name: 'Aloha',
    icon: Heart,
    def: 'Heart. Love. Human-centricity. Empathy.',
    action: 'Warmth. Welcoming. Cherished. Magic. Delightful. Designing for the user\'s feelings, not just their tasks.',
    color: '#e88d67',
  },
];

const TIMELINE = [
  { horizon: '60 Days', target: 'Close $500K', color: '#e88d67' },
  { horizon: '6 Months', target: '$50K Revenue · 2,000 users', color: '#c9a87c' },
  { horizon: '1 Year', target: '$1M Revenue · 100,000 users', color: '#c9a87c' },
  { horizon: '3 Years', target: '$10M Revenue · 1,000,000 users', color: '#4a90b8' },
  { horizon: '5 Years', target: '$25M Revenue · 5,000,000 users', color: '#4a90b8' },
  { horizon: '10 Years', target: '$50M Revenue · 10,000,000 users', color: '#7ecda0' },
  { horizon: '30 Years', target: '$1B Revenue · 100,000,000 users', color: '#a78bfa' },
  { horizon: '100 Years', target: 'Type 1 Civilization', color: '#a78bfa' },
];

export default function MissionVisionValues() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#080e1a' }}>
      {/* Subtle starfield */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: Math.random() * 2 + 0.5, height: Math.random() * 2 + 0.5 }}
            animate={{ opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: Math.random() * 3 + 2, delay: Math.random() * 4, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        {/* North Star epigraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <Compass className="w-4 h-4 text-[#c9a87c]/60" />
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#c9a87c]/60 uppercase">Strategic Identity</span>
          </div>
          <p className="text-white/60 text-lg md:text-2xl italic max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
            "To find them all. To bring them all and in excelsior bind them."
          </p>
        </motion.div>

        {/* Mission + Vision — two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#c9a87c]/10 border border-[#c9a87c]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Mission</h3>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">The What & The How</span>
              </div>
            </div>
            <p className="text-white text-base md:text-lg italic mb-4 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Respect the Outdoor Code. Break glass ceilings. Bridge the gap."
            </p>
            <div className="space-y-2 pt-4 border-t border-white/5">
              {[
                'Build the platform that solves aerospace\'s workforce crisis.',
                'Be the bridge between untapped talent and institutional capital.',
                'Operate with the rigor of a flight system, the warmth of a crew.'
              ].map((o, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-[#c9a87c]/50 shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-xs leading-relaxed">{o}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 md:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#4a90b8]/10 border border-[#4a90b8]/20 flex items-center justify-center">
                <Telescope className="w-5 h-5 text-[#4a90b8]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Vision</h3>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">The Where</span>
              </div>
            </div>
            <p className="text-white text-base md:text-lg font-bold mb-2">
              An S-Class Network. Ultra-Premium Aerospace Data. First Class Solutions.
            </p>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Cinematic, high-definition global spatial intelligence. The infrastructure that makes aerospace's next century possible.
            </p>

            {/* Vision timeline */}
            <div className="space-y-1.5 pt-4 border-t border-white/5">
              {TIMELINE.map((t, i) => (
                <motion.div
                  key={t.horizon}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[10px] font-mono font-bold w-16 text-right shrink-0" style={{ color: t.color }}>{t.horizon}</span>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />
                  <span className="text-slate-400 text-[11px]">{t.target}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <Diamond className="w-4 h-4 text-[#c9a87c]/60" />
            <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em]">Core Values — The Guardrails</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: `${v.color}15`, border: `1px solid ${v.color}25` }}>
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <h4 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{v.name}</h4>
                <p className="text-sm mb-2" style={{ color: v.color }}>{v.def}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{v.action}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Decision Filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 md:p-6 rounded-xl border border-[#c9a87c]/15 bg-[#c9a87c]/5 max-w-2xl mx-auto text-center"
        >
          <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">The Decision Filter</h4>
          <p className="text-slate-400 text-xs mb-3 italic">When faced with a hard choice, ask:</p>
          <div className="space-y-2">
            {[
              'Does this move us closer to our Vision?',
              'Does this violate any of our Values?',
              'Is this a core part of our Mission?',
            ].map((q, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <span className="text-[#c9a87c] font-bold font-mono text-xs">{i + 1}.</span>
                <span className="text-white text-sm">{q}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
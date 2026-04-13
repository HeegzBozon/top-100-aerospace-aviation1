import { motion } from 'framer-motion';
import { Monitor, Globe, Presentation, Podcast, BookOpen, Blocks } from 'lucide-react';

const STREAMS = [
  {
    icon: Monitor,
    title: 'Habitat Systems (The TOP 100 Platform)',
    desc: 'The primary life-support system of the colony. Built on Base44. Dogfooded live. Shipped to Fellows, reviewed by the crew, refined on station.',
  },
  {
    icon: Globe,
    title: 'Global Aerospace Intelligence Dashboard',
    desc: 'Launches. Live ADS-B flight tracking. OSINT layers. Signal data from the field. Four sensor arrays, one dashboard, wired live from the lunar surface.',
  },
  {
    icon: Presentation,
    title: 'Pitch Deck Reviews',
    desc: 'Reviewed in the command module. Founders bring their decks. The crew tears them apart and rebuilds them under mission-critical standards.',
  },
  {
    icon: Podcast,
    title: 'Mission Audio Logs',
    desc: 'Every session ships as an audio log. Three episodes a week. Zero guest booking overhead. Transmitted from the Moon.',
  },
  {
    icon: BookOpen,
    title: 'Time Capsules & Authority Pieces',
    desc: 'Every sprint retro produces a published artifact. Long-form editorial. Institutional memory. Proof of work, sealed and sent back to Earth.',
  },
  {
    icon: Blocks,
    title: 'Base44 Module Fabrication',
    desc: 'Showcase apps built live on Base44. Technique, architecture, shipped URL. New modules for the colony, fabricated in one session.',
  },
];

export default function BuildStreamsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: '#080e1a' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-2xl"
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            The colony is built here. <span className="text-[#c9a87c]">On the surface.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Moon Base Alpha isn't a side project. It's where the TOP 100 platform itself gets constructed, deployed, stress-tested, and documented. Every session produces a deliverable. Every sprint produces a Time Capsule.
          </p>
        </motion.div>

        {/* Stream list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STREAMS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#c9a87c]/10 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-[#c9a87c]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1.5">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
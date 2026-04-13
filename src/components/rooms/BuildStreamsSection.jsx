import { motion } from 'framer-motion';
import { Monitor, Globe, Presentation, Podcast, BookOpen, Blocks } from 'lucide-react';

const STREAMS = [
  {
    icon: Monitor,
    title: 'The TOP 100 platform',
    desc: 'Dogfooded live. Built on Base44. Shipped to Fellows, reviewed by the tribe, refined in the room.',
  },
  {
    icon: Globe,
    title: 'Global Aerospace Intelligence Dashboard',
    desc: 'Launches. Live ADS-B flight tracking. OSINT layers. Fellow signal data. Four feeds, one dashboard, wired live.',
  },
  {
    icon: Presentation,
    title: 'Pitch decks',
    desc: 'Reviewed live. Founders bring their decks. The room tears them apart and rebuilds them.',
  },
  {
    icon: Podcast,
    title: 'Podcast episodes',
    desc: 'Every session ships as audio. Three episodes a week. Zero guest booking overhead.',
  },
  {
    icon: BookOpen,
    title: 'Authority Pieces and Time Capsules',
    desc: 'Every sprint retro produces a published artifact. Long-form editorial. Institutional memory. Proof of work.',
  },
  {
    icon: Blocks,
    title: 'Base44 cross-promo builds',
    desc: 'Showcase apps built live on Base44. Technique, architecture, shipped URL, all in one session.',
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
            The platform is built here. <span className="text-[#c9a87c]">In the open.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Mission Rooms aren't a side project. They're where the TOP 100 platform itself gets built, shipped, refined, and documented. Every session produces an artifact. Every sprint produces a Time Capsule.
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
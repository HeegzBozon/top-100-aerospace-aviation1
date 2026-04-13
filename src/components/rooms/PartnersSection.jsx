import { motion } from 'framer-motion';

const PARTNERS = [
  {
    name: 'Base44',
    desc: 'Build partner. The platform is built on Base44. Every session is a live proof of what the stack can do.',
    logoText: 'BASE44',
  },
  {
    name: 'Wingbits',
    desc: 'Live ADS-B flight data. The aviation signal layer inside the Global Intelligence Dashboard.',
    logoText: 'WINGBITS',
  },
  {
    name: 'Wefunder',
    desc: 'Community round partner. Every room is a live update on what the capital is being used for.',
    logoText: 'WEFUNDER',
  },
];

export default function PartnersSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden" style={{ background: '#080e1a' }}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Built with.
          </h2>
          <p className="text-slate-400 text-base">
            Mission Rooms run on tools, platforms, and partners that earn their place in the room.
          </p>
        </motion.div>

        {/* Partner cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARTNERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
            >
              {/* Logo placeholder */}
              <div className="h-12 flex items-center mb-4">
                <span className="text-white/30 group-hover:text-white/60 transition-colors font-bold text-lg tracking-[0.15em] uppercase">
                  {p.logoText}
                </span>
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{p.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Extra slots placeholder */}
        <div className="mt-6 flex gap-4 justify-center">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-24 h-10 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
              <span className="text-white/15 text-[10px]">Partner {PARTNERS.length + i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
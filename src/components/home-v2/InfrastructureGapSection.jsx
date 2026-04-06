import { motion } from 'framer-motion';
import { ShieldCheck, Network, Layers } from 'lucide-react';

const cards = [
  {
    icon: ShieldCheck,
    title: 'Human-in-the-Loop',
    description: '1,000+ nominators who have personally observed and vouched for candidates. Not algorithms — people.',
    accent: '#c9a87c',
  },
  {
    icon: Layers,
    title: 'Tiered Endorsement',
    description: '300+ alumni and Fellows across 5 seasons endorse and validate through a tiered system. The Governing Council stewards the standard.',
    accent: '#4a90b8',
  },
  {
    icon: Network,
    title: 'The Trust Moat',
    description: 'A competitor can copy the code. They cannot copy the trust graph. Built over 5 years, one relationship at a time.',
    accent: '#c9a87c',
  },
];

export default function InfrastructureGapSection() {
  return (
    <section className="py-10 md:py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-[#4a90b8] text-xs font-bold uppercase tracking-widest mb-3">The Architecture</p>
          <h2
            className="text-2xl md:text-4xl font-bold text-[#1e3a5a] leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Humans Verify. Algorithms Amplify.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <card.icon className="w-8 h-8 mb-4" style={{ color: card.accent }} />
              <h3
                className="text-lg font-bold text-[#1e3a5a] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Industry gap stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 bg-[#1e3a5a] rounded-2xl p-6 md:p-10 text-white"
        >
          <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-4">The Gap</p>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
            Women make up <span className="text-white font-bold">47% of the U.S. workforce</span> — but only <span className="text-[#c9a87c] font-bold">13% in aerospace</span>. Only 6% of commercial pilots. Only 15% of senior leadership. The talent exists. The programs exist. What doesn't exist is the infrastructure to connect all of it.
          </p>
          <div className="grid grid-cols-4 gap-4 mt-8">
            {[
              { v: '47%', l: 'U.S. Workforce' },
              { v: '13%', l: 'Aerospace' },
              { v: '6%', l: 'Comml. Pilots' },
              { v: '15%', l: 'Leadership' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl md:text-3xl font-bold text-[#c9a87c]" style={{ fontFamily: "'Playfair Display', serif" }}>{s.v}</div>
                <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
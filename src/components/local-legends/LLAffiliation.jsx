import { motion } from 'framer-motion';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLAffiliation() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: 'white' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 md:p-12 relative overflow-hidden text-center"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0d2137)` }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: brand.gold }} />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-6" style={{ color: brand.gold }}>
              A Local Legends × TOP 100 Initiative
            </p>

            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-6">
              Local Legends is part of the{' '}
              <strong className="text-white">TOP 100 Aerospace & Aviation</strong>{' '}
              ecosystem. TOP 100 is the leading institutional recognition platform for accomplished women in aerospace, aviation, and space.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-6">
              {[
                { value: '300+', label: 'Fellows' },
                { value: '40+', label: 'Countries' },
                { value: '13,000+', label: 'Community' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="text-white/50 text-sm max-w-md mx-auto">
              When you get featured on Local Legends, you're reaching that audience.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
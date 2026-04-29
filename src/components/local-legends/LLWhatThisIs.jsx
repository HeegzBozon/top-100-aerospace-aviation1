import { motion } from 'framer-motion';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

export default function LLWhatThisIs() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ background: brand.cream }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
            A spotlight. Free. No strings.
          </h2>

          <div className="space-y-5 text-sm md:text-base text-slate-600 leading-relaxed text-left md:text-center">
            <p>
              We're not selling anything. We're building a directory of the best local businesses serving one of the most remarkable professional communities on earth.
            </p>
            <p>
              <strong style={{ color: brand.navy }}>NASA Ames is in your backyard.</strong> The engineers, scientists, and mission planners who work there live in your neighborhood. They're your clients. We want to celebrate the businesses that support them.
            </p>
            <p className="text-slate-500">
              A 20-minute conversation. A published feature. Shared across{' '}
              <strong className="text-slate-700">13,000+</strong> in the global aerospace and aviation community.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
import { motion } from 'framer-motion';
import StarfieldCanvas from './StarfieldCanvas';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function EditorialClosing() {
  return (
    <section
      id="closing"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: brandColors.ink }}
    >
      {/* Subtle Starfield */}
      <div className="absolute inset-0 opacity-40">
        <StarfieldCanvas />
      </div>
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: `radial-gradient(ellipse at center, transparent 0%, ${brandColors.ink} 70%)`
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-32 text-center">
        {/* Section Tag */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] tracking-[0.5em] uppercase mb-16"
          style={{ color: brandColors.goldPrestige }}
        >
          The Back Pages — Closing
        </motion.p>

        {/* Main Statement */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-12"
          style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: 'white' 
          }}
        >
          Recognition is the{' '}
          <em style={{ color: brandColors.goldPrestige }}>beginning</em>.
        </motion.h2>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-16"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          To be indexed here is not an ending. It is an invitation—to connect, 
          to collaborate, and to continue pushing the boundaries of what aerospace can achieve.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="/MissionControl"
            className="px-10 py-4 text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:tracking-[0.3em]"
            style={{ 
              background: brandColors.goldPrestige, 
              color: brandColors.ink 
            }}
          >
            Enter the Community
          </a>
          <a
            href="/Arena"
            className="px-10 py-4 text-sm tracking-[0.2em] uppercase border transition-all duration-300 hover:bg-white hover:text-black"
            style={{ 
              borderColor: 'rgba(255,255,255,0.3)', 
              color: 'white' 
            }}
          >
            Nominate for 2026
          </a>
        </motion.div>

        {/* Edition Mark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-32 pt-12 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <p 
            className="text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            The 2025 Orbital Edition
          </p>
          <p 
            className="mt-2 text-[10px]"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            © TOP 100 Aerospace & Aviation. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
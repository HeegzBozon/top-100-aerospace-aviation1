import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function EditorialMasthead() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-center px-4 md:px-12 lg:px-24 py-16 md:py-20"
      style={{ background: brandColors.cream }}
    >
      {/* Subtle Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${brandColors.ink} 1px, transparent 1px), linear-gradient(90deg, ${brandColors.ink} 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-6xl mx-auto w-full relative">
        {/* Top Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-12 md:mb-32"
        >
          <p
            className="text-[9px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase"
            style={{ color: brandColors.skyBlue }}
          >
            Official Publication
          </p>
          <p
            className="text-[9px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase"
            style={{ color: `${brandColors.ink}50` }}
          >
            Vol I — 2025
          </p>
        </motion.div>

        {/* Main Title — Editorial confidence */}
        <div className="mb-12 md:mb-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs md:text-base tracking-[0.15em] md:tracking-[0.2em] uppercase mb-4 md:mb-8"
            style={{ color: brandColors.goldPrestige }}
          >
            The Definitive Index
          </motion.p>

          {/* Large typographic statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <h1
              className="text-[3.5rem] sm:text-[4.5rem] md:text-8xl lg:text-[10rem] xl:text-[12rem] font-light leading-[0.85] tracking-tight"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: brandColors.ink
              }}
            >
              <span className="block text-base md:text-xl tracking-[0.25em] md:tracking-[0.3em] font-normal mb-1 md:mb-2" style={{ color: brandColors.navyDeep }}>
                TOP
              </span>
              <span className="block italic">100</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 md:mt-12"
          >
            <p
              className="text-lg md:text-2xl lg:text-3xl font-light tracking-wide leading-snug"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: brandColors.navyDeep
              }}
            >
              Women in Aerospace<br className="md:hidden" /> & Aviation
            </p>
            <p
              className="mt-3 md:mt-4 text-xs md:text-base max-w-md leading-relaxed"
              style={{ color: `${brandColors.ink}60` }}
            >
              Community-nominated. Peer-evaluated. A living index of aerospace excellence.
            </p>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8"
        >
          <div>
            <p
              className="text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase mb-1 md:mb-2"
              style={{ color: `${brandColors.ink}40` }}
            >
              The Orbital Edition
            </p>
            <p
              className="text-xs md:text-sm"
              style={{ color: brandColors.ink }}
            >
              100 leaders defining the future of flight
            </p>
          </div>

          <div className="flex items-center gap-5 md:gap-8">
            <div className="text-right">
              <p className="text-2xl md:text-5xl font-light" style={{ color: brandColors.navyDeep }}>30+</p>
              <p className="text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase" style={{ color: `${brandColors.ink}50` }}>Countries</p>
            </div>
            <div className="w-px h-10 md:h-12" style={{ background: `${brandColors.ink}20` }} />
            <div className="text-right">
              <p className="text-2xl md:text-5xl font-light" style={{ color: brandColors.navyDeep }}>∞</p>
              <p className="text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase" style={{ color: `${brandColors.ink}50` }}>Impact</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-16"
            style={{ background: `linear-gradient(to bottom, ${brandColors.goldPrestige}, transparent)` }}
          />
        </motion.div>
      </div>
    </section>
  );
}
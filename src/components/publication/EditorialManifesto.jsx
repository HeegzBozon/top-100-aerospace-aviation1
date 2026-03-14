import React from 'react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function EditorialManifesto() {
  return (
    <section 
      id="manifesto" 
      className="py-32 md:py-48 px-6 md:px-12 lg:px-24"
      style={{ background: 'white' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <p 
            className="text-[10px] tracking-[0.5em] uppercase"
            style={{ color: brandColors.skyBlue }}
          >
            The Record — Editorial
          </p>
        </motion.div>

        {/* Lead Paragraph with Drop Cap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-16"
          style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: brandColors.ink 
          }}
        >
          <span 
            className="float-left text-7xl md:text-8xl lg:text-9xl font-normal mr-4 md:mr-6 -mt-2 md:-mt-3"
            style={{ 
              color: brandColors.navyDeep,
              lineHeight: 0.75,
            }}
          >
            T
          </span>
          he aerospace industry has long been defined by those who dare to look up and reach further. 
          These 100 women represent the <em>vanguard</em> of that tradition.
        </motion.div>

        {/* Body Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="columns-1 md:columns-2 gap-12 text-base leading-relaxed"
          style={{ color: `${brandColors.ink}80` }}
        >
          <p className="mb-6">
            Engineers, executives, entrepreneurs, and visionaries reshaping what's possible in the sky and beyond. 
            This publication is not a celebration of accomplishment past—it is a record of capability present, 
            and potential realized.
          </p>
          <p className="mb-6">
            Recognition, properly understood, is not a reward. It is a responsibility. 
            To be named here is to accept a role in a larger narrative—one that will be read 
            by the next generation of leaders deciding whether to enter this industry at all.
          </p>
          <p>
            We do not rank. We index. We do not applaud. We document. 
            The distinction matters.
          </p>
        </motion.div>

        {/* Pull Quote — breaks the grid, commands attention */}
        <motion.blockquote
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 md:mt-32 py-16 md:py-20 relative -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24"
          style={{ background: brandColors.cream }}
        >
          {/* Decorative marks */}
          <span 
            className="absolute top-8 left-6 md:left-12 lg:left-24 text-6xl md:text-8xl font-serif leading-none select-none"
            style={{ color: `${brandColors.goldPrestige}25` }}
          >
            "
          </span>
          <span 
            className="absolute bottom-8 right-6 md:right-12 lg:right-24 text-6xl md:text-8xl font-serif leading-none select-none rotate-180"
            style={{ color: `${brandColors.goldPrestige}25` }}
          >
            "
          </span>
          
          <p 
            className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-center max-w-3xl mx-auto relative z-10"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: brandColors.navyDeep,
              letterSpacing: '0.01em',
            }}
          >
            A community-driven index of aerospace excellence — nominated by peers, validated by the industry, documented for history.
          </p>
          
          <div className="mt-10 flex justify-center">
            <div className="w-16 h-px" style={{ background: brandColors.goldPrestige }} />
          </div>
        </motion.blockquote>

        {/* Closing Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-sm text-center"
          style={{ color: `${brandColors.ink}50` }}
        >
          — The Editors
        </motion.p>
      </div>
    </section>
  );
}
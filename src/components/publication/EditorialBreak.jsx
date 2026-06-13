import { motion } from 'framer-motion';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function EditorialBreak({ kicker = 'From the Selection Process', text }) {
  return (
    <div className="py-16 md:py-28 px-6" style={{ background: brandColors.cream }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12" style={{ background: `${brandColors.goldPrestige}60` }} />
          <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: brandColors.goldPrestige }}>
            {kicker}
          </p>
          <div className="h-px w-12" style={{ background: `${brandColors.goldPrestige}60` }} />
        </div>
        <p
          className="text-xl md:text-3xl font-light leading-relaxed italic"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}
        >
          {text}
        </p>
      </motion.div>
    </div>
  );
}
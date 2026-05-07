import { motion } from 'framer-motion';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function PublicationLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: brandColors.cream }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] md:text-xs md:tracking-[0.5em]" style={{ color: brandColors.ink }}>
          Loading
        </p>
      </motion.div>
    </div>
  );
}
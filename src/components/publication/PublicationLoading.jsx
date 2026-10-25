import { motion } from 'framer-motion';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

// Designed stand-in for the issue while the edition assembles. It holds the
// masthead and the layout rhythm, so the publication is visibly taking shape
// instead of showing a bare word.
const SKELETON_COLUMNS = [0, 1, 2, 3];

export default function PublicationLoading() {
  return (
    <div className="min-h-[100svh] px-4 py-16 md:px-12 lg:px-24" style={{ background: brandColors.cream }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p
            className="text-[9px] uppercase tracking-[0.4em] md:text-[10px] md:tracking-[0.5em]"
            style={{ color: brandColors.skyBlue }}
          >
            TOP 100 Aerospace &amp; Aviation
          </p>
          <h2
            className="mt-4 text-3xl font-light tracking-tight md:text-5xl"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}
          >
            The Orbital Edition
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-xs leading-relaxed md:text-sm"
            style={{ color: `${brandColors.ink}70` }}
          >
            Assembling the verified record — positioning the honorees of the 2025 edition.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:mt-16 md:grid-cols-4 md:gap-6">
          {SKELETON_COLUMNS.map((column) => (
            <div key={column} className="space-y-3">
              <motion.div
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2, repeat: Infinity, delay: column * 0.15 }}
                className="aspect-[3/4] w-full rounded-sm"
                style={{ background: `${brandColors.navyDeep}12` }}
              />
              <div className="h-3 w-3/4 rounded" style={{ background: `${brandColors.navyDeep}10` }} />
              <div className="h-2 w-1/2 rounded" style={{ background: `${brandColors.navyDeep}0d` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
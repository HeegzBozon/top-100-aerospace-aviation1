import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCw } from 'lucide-react';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

// Designed state for an edition that could not be assembled this visit. It keeps
// the publication's surface and offers the two actions that still work, rather
// than leaving a visitor on a stalled screen.
export default function PublicationUnavailable({ onRetry }) {
  return (
    <div className="min-h-[80svh] px-4 py-20 md:px-12" style={{ background: brandColors.cream }}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl text-center"
      >
        <p
          className="text-[9px] uppercase tracking-[0.4em] md:text-[10px] md:tracking-[0.5em]"
          style={{ color: brandColors.skyBlue }}
        >
          The Orbital Edition
        </p>
        <h2
          className="mt-4 text-2xl font-light tracking-tight md:text-4xl"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}
        >
          This edition is not available right now.
        </h2>
        <p
          className="mx-auto mt-3 max-w-md text-xs leading-relaxed md:text-sm"
          style={{ color: `${brandColors.ink}70` }}
        >
          The verified record could not be assembled just now. Reload to try again — nominations
          and the published profiles are unaffected.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all hover:brightness-105"
            style={{ background: brandColors.goldPrestige, color: brandColors.ink }}
          >
            <RotateCw className="h-4 w-4" /> Reload the edition
          </button>
          <Link
            to="/nominate"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-all hover:bg-black/5"
            style={{ borderColor: `${brandColors.navyDeep}25`, color: brandColors.ink }}
          >
            Nominate a leader <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
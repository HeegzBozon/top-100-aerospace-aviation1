import { motion } from 'framer-motion';
import ArchiveExport from '@/components/publication/ArchiveExport';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function ArchiveExportSection({ nominees, compact = false }) {
  return (
    <section className={`${compact ? 'hidden md:block py-24 md:py-40' : 'py-12 md:py-40'} px-4 md:px-12 lg:px-24`} style={{ background: brandColors.cream }}>
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className={compact ? 'mb-16' : 'mb-6 md:mb-16'}>
          <p className={`${compact ? 'text-[10px] tracking-[0.5em] mb-4' : 'text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] mb-2 md:mb-4'} uppercase`} style={{ color: brandColors.skyBlue }}>
            Continuity
          </p>
          <h2 className={`${compact ? 'text-4xl md:text-5xl' : 'text-2xl md:text-5xl'} font-light tracking-tight`} style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}>
            Archive & Export
          </h2>
          <p className={`${compact ? 'mt-4 text-sm' : 'mt-2 md:mt-4 text-xs md:text-sm'} max-w-xl leading-relaxed`} style={{ color: `${brandColors.ink}60` }}>
            Download the complete directory for your records.
          </p>
        </motion.div>
        <ArchiveExport nominees={nominees} />
      </div>
    </section>
  );
}
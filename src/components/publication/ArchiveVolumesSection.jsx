import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

import { ARCHIVE_VOLUMES as VOLUMES } from '@/components/archive/archiveVolumes';

export default function ArchiveVolumesSection() {
  return (
    <section className="py-14 md:py-32 px-4 md:px-12 lg:px-24" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 md:mb-14"
        >
          <p className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2 md:mb-4" style={{ color: brandColors.skyBlue }}>
            The Archive
          </p>
          <h2
            className="text-2xl md:text-5xl font-light tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}
          >
            Previous Volumes
          </h2>
          <p className="mt-2 md:mt-4 max-w-xl text-xs md:text-sm leading-relaxed" style={{ color: `${brandColors.ink}60` }}>
            Every honoree ever measured, preserved in the permanent record.
          </p>
        </motion.div>

        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VOLUMES.map((v) => (
            <Link
              key={v.path}
              to={v.path}
              className="group block p-5 md:p-6 border transition-all hover:-translate-y-0.5"
              style={{ borderColor: `${brandColors.ink}18`, background: 'white' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase mb-2" style={{ color: brandColors.goldPrestige }}>
                    {v.volume} · {v.year}
                  </p>
                  <h3
                    className="text-base md:text-lg font-light leading-snug"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: brandColors.ink }}
                  >
                    {v.title}
                  </h3>
                  <p className="mt-1 text-[11px]" style={{ color: `${brandColors.ink}55` }}>
                    {v.note} · 100 honorees
                  </p>
                </div>
                <ArrowUpRight
                  className="w-4 h-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
                  style={{ color: brandColors.skyBlue }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
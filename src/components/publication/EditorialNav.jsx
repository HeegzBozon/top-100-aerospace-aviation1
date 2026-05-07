import { motion } from 'framer-motion';
import { publicationBrand as brandColors, top100Women2025Config } from '@/components/publication/publicationConfig';

export default function EditorialNav({ activeSection }) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
      aria-label="Publication sections"
    >
      {top100Women2025Config.sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-label={`Jump to ${section.name}`}
          className="group flex items-center justify-end gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a87c] focus-visible:ring-offset-4"
        >
          <span className="text-[10px] tabular-nums opacity-0 transition-opacity group-hover:opacity-100" style={{ color: brandColors.ink }}>
            {section.label}
          </span>
          <div
            className="h-1.5 w-1.5 rounded-full transition-all duration-300"
            style={{
              background: activeSection === section.id ? brandColors.goldPrestige : `${brandColors.ink}20`,
              transform: activeSection === section.id ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        </a>
      ))}
    </motion.nav>
  );
}
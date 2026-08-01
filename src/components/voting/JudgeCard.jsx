import { motion } from 'framer-motion';
import { ArrowUp, Info } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { disciplineLabel, orgScaleLabel, regionLabel } from '@/components/voting/anonymize';

// Anonymized "judge" card: no name, no photo, no employer name, no socials.
// Surfaces role/seniority, discipline, org scale, region, and an impact
// snippet directly on the card so a Fellow can judge without opening detail.
export default function JudgeCard({ nominee, token, isTop, selectable, onInfo, onSelect }) {
  const role = nominee.professional_role || nominee.title || 'Aerospace professional';
  const discipline = disciplineLabel(nominee);
  const scale = orgScaleLabel(nominee);
  const region = regionLabel(nominee);
  const impact = nominee.impact_summary || nominee.description || '';

  return (
    <motion.div
      layout
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={() => selectable && onSelect()}
      role="button"
      tabIndex={selectable ? 0 : -1}
      className="relative rounded-2xl p-3 flex flex-col gap-2 transition-all border"
      style={{
        background: isTop ? `${brand.gold}12` : 'white',
        borderColor: isTop ? brand.gold : `${brand.navy}10`,
        opacity: isTop ? 0.65 : 1,
        cursor: selectable ? 'pointer' : 'default',
      }}
    >
      {/* Token + anchor badge + evidence button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
          >
            {token}
          </div>
          {isTop && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: brand.gold, color: 'white' }}>
              <ArrowUp className="w-3 h-3" /> First
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onInfo(); }}
          className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
          style={{ background: `${brand.navy}06` }}
          aria-label="Evidence"
        >
          <Info className="w-3.5 h-3.5" style={{ color: `${brand.navy}60` }} />
        </button>
      </div>

      {/* Role / seniority (kept) */}
      <p className="text-sm font-bold leading-snug" style={{ color: brand.navy }}>{role}</p>

      {/* Evidence chips: discipline · org scale · region */}
      {(discipline || scale || region) && (
        <div className="flex flex-wrap gap-1.5">
          {discipline && <Chip>{discipline}</Chip>}
          {scale && <Chip>{scale}</Chip>}
          {region && <Chip>{region}</Chip>}
        </div>
      )}

      {/* Contribution evidence snippet */}
      {impact && (
        <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: `${brand.navy}70` }}>
          {impact}
        </p>
      )}
    </motion.div>
  );
}

function Chip({ children }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${brand.navy}08`, color: `${brand.navy}80` }}>
      {children}
    </span>
  );
}
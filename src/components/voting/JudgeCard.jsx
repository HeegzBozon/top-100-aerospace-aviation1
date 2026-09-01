import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { DISCIPLINE_LABELS } from '@/components/voting/anonymize';

// Career-stage broad bands — never a job title. The institution measures;
// the card surfaces a band, not a role.
const CAREER_STAGE_BAND = {
  early: 'Early Career',
  mid: 'Mid-Career',
  senior: 'Senior',
  executive: 'Executive',
};

function initials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
  return (a + b).toUpperCase();
}

export default function JudgeCard({ nominee, token, isTop, isBottom, selectable, onInfo, onSelect }) {
  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || nominee.description || nominee.impact_summary || '';
  const discipline = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || nominee.professional_role || '';
  const stageBand = CAREER_STAGE_BAND[nominee.trajectory_metrics?.career_stage] || '';
  const anchored = isTop || isBottom;

  return (
    <motion.div
      layout
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={() => selectable && onSelect()}
      role="button"
      tabIndex={selectable ? 0 : -1}
      className="relative rounded-2xl p-4 h-full flex flex-col gap-2.5 transition-all border"
      style={{
        background: isTop ? `${brand.gold}12` : isBottom ? `${brand.navy}06` : 'white',
        borderColor: isTop ? brand.gold : isBottom ? `${brand.navy}30` : `${brand.navy}10`,
        opacity: anchored ? 0.7 : 1,
        cursor: selectable ? 'pointer' : 'default',
      }}
    >
      {/* Identity: photo, name, discipline · career-stage band */}
      <div className="flex items-start gap-3">
        <div
          className="h-14 w-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-base font-bold"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
        >
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            initials(name) || token
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm lg:text-base font-bold leading-snug truncate" style={{ color: brand.navy }}>
            {name}
          </p>
          {(discipline || stageBand) && (
            <p className="text-[11px] lg:text-xs font-semibold leading-tight mt-1" style={{ color: `${brand.navy}60` }}>
              {[discipline, stageBand].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Anchor badges + evidence */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isTop && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: brand.gold, color: 'white' }}>
              <ArrowUp className="w-3 h-3" /> First
            </span>
          )}
          {isBottom && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: brand.navy, color: 'white' }}>
              <ArrowDown className="w-3 h-3" /> Last
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onInfo(); }}
            className="h-7 w-7 rounded-full flex items-center justify-center"
            style={{ background: `${brand.navy}06` }}
            aria-label="Evidence"
          >
            <Info className="w-3.5 h-3.5" style={{ color: `${brand.navy}60` }} />
          </button>
        </div>
      </div>

      {/* Six word story — the nominee's own hook */}
      {story ? (
        <p className="text-sm lg:text-base font-semibold italic leading-snug line-clamp-2" style={{ color: brand.navy }}>
          <span style={{ color: brand.gold }}>"</span>{story}<span style={{ color: brand.gold }}>"</span>
        </p>
      ) : (
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}40` }}>No story on file</p>
      )}

      {/* Biography snippet */}
      {bio && (
        <p className="text-xs lg:text-sm leading-relaxed line-clamp-2 lg:line-clamp-3" style={{ color: `${brand.navy}70` }}>{bio}</p>
      )}
    </motion.div>
  );
}
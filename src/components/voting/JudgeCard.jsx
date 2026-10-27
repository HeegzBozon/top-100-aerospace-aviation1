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

// One face, one door. The card carries the identity and the six word story and
// nothing else: everything the institution holds on the candidate is read in the
// card's own information panel. On the glass that door is a labelled key at the foot
// of the card, where a thumb finds it — a corner circle is neither found nor read as
// "information" — and on the desk it is the circle in the corner it always was.
//
// The card fills the box it is given. On the glass that box is measured for it (see
// GlassVoteSurface), so the four candidates stand in a 2x2 with nothing to scroll;
// on the desk the grid rows already have a height of their own.
export default function JudgeCard({ nominee, token, isTop, isBottom, selectable, onInfo, onSelect }) {

  const name = nominee.name || 'Unnamed nominee';
  const photo = nominee.avatar_url || nominee.photo_url || '';
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || '';
  const discipline = DISCIPLINE_LABELS[nominee.discipline] || nominee.industry || nominee.professional_role || '';
  const stageBand = CAREER_STAGE_BAND[nominee.trajectory_metrics?.career_stage] || '';
  const anchored = isTop || isBottom;

  return (
    <div className="relative h-full min-h-0">
      <motion.div
        whileTap={selectable ? { scale: 0.98 } : undefined}
        onClick={() => selectable && onSelect()}
        role="button"
        tabIndex={selectable ? 0 : -1}
        className="flex h-full flex-col gap-2 overflow-hidden rounded-2xl p-2.5 md:gap-2.5 md:p-4"
        style={{
          background: isTop ? `${brand.gold}12` : isBottom ? `${brand.navy}06` : 'white',
          border: `1px solid ${isTop ? brand.gold : isBottom ? `${brand.navy}30` : `${brand.navy}10`}`,
          opacity: anchored ? 0.72 : 1,
          cursor: selectable ? 'pointer' : 'default',
        }}
      >
        {/* Identity row */}
        <div className="flex items-start gap-2 md:gap-3">
          <div
            className="h-10 w-10 shrink-0 overflow-hidden rounded-xl flex items-center justify-center text-[13px] font-bold md:h-14 md:w-14 md:text-base"
            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
          >
            {photo ? (
              <img src={photo} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials(name) || token
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12.5px] font-bold leading-snug md:text-sm lg:text-base" style={{ color: brand.navy }}>{name}</p>
            {(discipline || stageBand) && (
              <p className="mt-0.5 truncate text-[10px] font-semibold leading-tight md:mt-1 md:text-[11px] lg:text-xs" style={{ color: `${brand.navy}60` }}>
                {[discipline, stageBand].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isTop && (
              <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold md:px-2 md:text-[10px]" style={{ background: brand.gold, color: 'white' }}>
                <ArrowUp className="w-3 h-3" /> First
              </span>
            )}
            {isBottom && (
              <span className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold md:px-2 md:text-[10px]" style={{ background: brand.navy, color: 'white' }}>
                <ArrowDown className="w-3 h-3" /> Last
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onInfo(); }}
              className="hidden h-7 w-7 items-center justify-center rounded-full md:flex"
              style={{ background: `${brand.navy}06` }}
              aria-label={`Information about ${name}`}
            >
              <Info className="w-3.5 h-3.5" style={{ color: `${brand.navy}60` }} />
            </button>
          </div>
        </div>

        {/* Six word story */}
        {story ? (
          <p className="line-clamp-2 text-[12px] font-semibold italic leading-snug md:text-sm lg:text-base" style={{ color: brand.navy }}>
            <span style={{ color: brand.gold }}>&ldquo;</span>{story}<span style={{ color: brand.gold }}>&rdquo;</span>
          </p>
        ) : (
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}40` }}>No story on file</p>
        )}

        {/* Biography snippet — the desk has room for it on the face of the card. */}
        {bio && (
          <p className="hidden text-xs leading-relaxed line-clamp-2 md:block lg:text-sm lg:line-clamp-3" style={{ color: `${brand.navy}70` }}>{bio}</p>
        )}

        {/* The one door. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onInfo(); }}
          aria-label={`Information about ${name}`}
          className="mt-auto flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.12em] transition-[filter] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110 md:hidden"
          style={{ background: brand.navy, color: 'white' }}
        >
          <Info className="h-3.5 w-3.5" /> Info
        </button>
      </motion.div>
    </div>
  );
}
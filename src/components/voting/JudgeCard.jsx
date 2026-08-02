import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// Blind "judge" card — rolls over last year's pairwise evidence set:
// six word story + biography snippet. Identity withheld.
export default function JudgeCard({ nominee, token, isTop, isBottom, selectable, onInfo, onSelect }) {
  const story = nominee.six_word_story || '';
  const bio = nominee.bio || nominee.description || nominee.impact_summary || '';
  const anchored = isTop || isBottom;

  return (
    <motion.div
      layout
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={() => selectable && onSelect()}
      role="button"
      tabIndex={selectable ? 0 : -1}
      className="relative rounded-2xl p-3 flex flex-col gap-2 transition-all border"
      style={{
        background: isTop ? `${brand.gold}12` : isBottom ? `${brand.navy}06` : 'white',
        borderColor: isTop ? brand.gold : isBottom ? `${brand.navy}30` : `${brand.navy}10`,
        opacity: anchored ? 0.7 : 1,
        cursor: selectable ? 'pointer' : 'default',
      }}
    >
      {/* Token + anchor badges + evidence button */}
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
          {isBottom && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: brand.navy, color: 'white' }}>
              <ArrowDown className="w-3 h-3" /> Last
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

      {/* Six word story (last year's hook) */}
      {story ? (
        <p className="text-sm font-semibold italic leading-snug line-clamp-2" style={{ color: brand.navy }}>
          <span style={{ color: brand.gold }}>"</span>{story}<span style={{ color: brand.gold }}>"</span>
        </p>
      ) : (
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${brand.navy}40` }}>No story on file</p>
      )}

      {/* Biography snippet (last year's body) */}
      {bio && (
        <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: `${brand.navy}70` }}>{bio}</p>
      )}
    </motion.div>
  );
}
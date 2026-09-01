import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Check, UserCheck, Sparkles } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

const HUB_CATEGORIES = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const CATEGORY_STYLE = {
  women: { bg: '#b87a8e22', text: '#9c5a78' },
  men: { bg: '#1e3a5a22', text: brand.navy },
  angels: { bg: '#c9a87c33', text: '#9a7a4a' },
};

function Badge({ category }) {
  const s = CATEGORY_STYLE[category] || CATEGORY_STYLE.men;
  return (
    <span
      className="shrink-0 text-[9px] lg:text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {category}
    </span>
  );
}

// Shared rendering of a Fellow's submitted hub nominations across Women / Men /
// Angels, with a designed empty state. Used by both the desktop intake panel
// and the mobile Nominate view so the two surfaces never diverge.
export default function SubmittedNominationsList({
  submittedNominations,
  onRemoveNomination,
  addedIds,
  compact = false,
}) {
  const allEntries = [];
  HUB_CATEGORIES.forEach(({ key: cat }) => {
    (submittedNominations[cat] || []).forEach((n, idx) => {
      allEntries.push({ ...n, _cat: cat, _idx: idx });
    });
  });

  const displayName = (n) => n.name || n.nominee?.name || 'Untitled nominee';
  const displaySub = (n) => (n.existing ? 'Added to your Top 100 list' : n.role_org || '');

  if (allEntries.length === 0) {
    return (
      <div className={`text-center ${compact ? 'py-10' : 'py-12'}`}>
        <div
          className="h-11 w-11 rounded-2xl mx-auto flex items-center justify-center mb-3"
          style={{ background: `${brand.gold}12` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: brand.navy }}>
          No nominations yet
        </p>
        <p
          className="text-[12px] leading-relaxed max-w-[15rem] mx-auto"
          style={{ color: `${brand.navy}55` }}
        >
          Tap{' '}
          <span className="font-semibold" style={{ color: brand.navy }}>
            Nominate someone
          </span>{' '}
          below to put a name forward for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence>
        {allEntries.map((n) => (
          <motion.div
            key={`${n._cat}-${n._idx}`}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: n.existing ? `${brand.navy}05` : 'white',
              border: `1px solid ${brand.navy}10`,
            }}
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: n.existing ? brand.navy : `${brand.gold}18` }}
            >
              {n.existing ? (
                <UserCheck className="w-4 h-4 text-white" />
              ) : (
                <Check className="w-4 h-4" style={{ color: brand.gold }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm lg:text-base font-bold truncate" style={{ color: brand.navy }}>
                  {displayName(n)}
                </p>
                <Badge category={n._cat} />
                {n.also_angels && n._cat !== 'angels' && <Badge category="angels" />}
              </div>
              {displaySub(n) && (
                <p className="text-[11px] lg:text-sm truncate" style={{ color: `${brand.navy}50` }}>
                  {displaySub(n)}
                </p>
              )}
              <p
                className="text-[9px] lg:text-[11px] font-bold uppercase tracking-wide mt-0.5"
                style={{ color: '#2d8a4f' }}
              >
                {n.existing ? 'On your Top 100 list' : 'Submitted for review'}
              </p>
            </div>
            <button
              onClick={() => onRemoveNomination(n._cat, n._idx)}
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{ background: `${brand.navy}05` }}
              aria-label="Remove nomination"
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: '#c0392b' }} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
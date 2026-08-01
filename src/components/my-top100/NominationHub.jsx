import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Trash2, Check, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import HubEnergyTracker from '@/components/my-top100/HubEnergyTracker';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';

export const HUB_CATEGORIES = [
  { key: 'women', label: 'Women', heading: 'TOP 100 Women' },
  { key: 'men', label: 'Men', heading: 'TOP 100 Men' },
  { key: 'angels', label: 'Angels', heading: 'TOP 100 Angels' },
];

const CATEGORY_STYLE = {
  women: { bg: '#b87a8e22', text: '#9c5a78' },
  men: { bg: '#1e3a5a22', text: brand.navy },
  angels: { bg: '#c9a87c33', text: '#9a7a4a' },
};

function Badge({ category }) {
  const s = CATEGORY_STYLE[category] || CATEGORY_STYLE.men;
  return (
    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {category}
    </span>
  );
}

export default function NominationHub({ submittedNominations, onAddNomination, onRemoveNomination, onAddExisting, nominator }) {
  const [showPopover, setShowPopover] = useState(false);
  const [nominees, setNominees] = useState([]);

  useEffect(() => {
    let mounted = true;
    base44.entities.Nominee.list('-updated_date', 200)
      .then((res) => { if (mounted) setNominees(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Flatten all nominations across women/men/angels into a single list with category + index
  const allEntries = [];
  ['women', 'men', 'angels'].forEach((cat) => {
    (submittedNominations[cat] || []).forEach((n, idx) => {
      allEntries.push({ ...n, _cat: cat, _idx: idx });
    });
  });
  const totalCount = allEntries.length;

  const handleSubmitted = (result) => {
    if (result.existing) {
      onAddExisting(result.nominee, { category: result.category, also_angels: result.also_angels });
      return;
    }
    onAddNomination(result.category, result.summary);
    setShowPopover(false);
  };

  const displayName = (n) => n.name || n.nominee?.name || 'Untitled nominee';
  const displaySub = (n) => (n.existing ? 'Added to your Top 100 list' : n.role_org || '');

  return (
    <div>
      {/* Hero */}
      <div className="px-4 pt-5 pb-3 text-center">
        <div className="h-12 w-12 rounded-2xl mx-auto flex items-center justify-center mb-3" style={{ background: `${brand.gold}18` }}>
          <Sparkles className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: `${brand.navy}50` }}>
          Nominate
        </p>
        <h1
          className="text-xl sm:text-2xl font-bold leading-tight mb-2 max-w-xl mx-auto"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Who deserves to be in the Top 100?
        </h1>
        <p className="text-xs leading-relaxed max-w-lg mx-auto" style={{ color: `${brand.navy}60` }}>
          Nominate the women, men, and angel investors shaping aerospace &amp; aviation. Choose a category in the form — and check the box to also nominate someone as an angel.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
        <div className="mx-3 h-2 w-2 rounded-full" style={{ background: brand.gold }} />
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
      </div>

      <div className="px-4 pb-4">
        <HubEnergyTracker count={totalCount} />
      </div>

      {/* Combined nomination list */}
      <div className="px-4 pb-4 space-y-2.5">
        <AnimatePresence>
          {allEntries.map((n) => (
            <motion.div
              key={`${n._cat}-${n._idx}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: n.existing ? `${brand.navy}05` : 'white', border: `1px solid ${brand.navy}10` }}
            >
              <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: n.existing ? brand.navy : `${brand.gold}18` }}>
                {n.existing ? <UserCheck className="w-4 h-4 text-white" /> : <Check className="w-4 h-4" style={{ color: brand.gold }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-bold truncate" style={{ color: brand.navy }}>{displayName(n)}</p>
                  <Badge category={n._cat} />
                  {n.also_angels && n._cat !== 'angels' && <Badge category="angels" />}
                </div>
                {displaySub(n) && (
                  <p className="text-[11px] truncate" style={{ color: `${brand.navy}50` }}>{displaySub(n)}</p>
                )}
                <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#2d8a4f' }}>
                  {n.existing ? 'On your Top 100 list' : 'Submitted for review'}
                </p>
              </div>
              <button
                onClick={() => onRemoveNomination(n._cat, n._idx)}
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ background: `${brand.navy}05` }}
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: '#c0392b' }} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={() => setShowPopover(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
        >
          <Plus className="w-4 h-4" />
          {totalCount > 0 ? 'Add another nomination' : 'Add a nomination'}
        </button>
      </div>

      {/* Popover form */}
      <AnimatePresence>
        {showPopover && (
          <HubNominationPopover
            nominees={nominees}
            nominator={nominator}
            onClose={() => setShowPopover(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
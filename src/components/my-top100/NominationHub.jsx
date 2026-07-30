import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Trash2, Check, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import HubEnergyTracker from '@/components/my-top100/HubEnergyTracker';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';

export const HUB_CATEGORIES = [
  {
    key: 'women',
    label: 'Women',
    number: 1,
    heading: 'TOP 100 Women',
    question: 'Do you know a woman in aerospace, aviation, or space who deserves to be recognized?',
    body: 'TOP 100 Women in Aerospace & Aviation spotlights accomplished women across every discipline. Engineering. Operations. Policy. Research. Entrepreneurship. Flight. Space. If she\u2019s building the future of this industry, she belongs in the conversation.',
    pronoun: 'her',
    type: 'person',
  },
  {
    key: 'men',
    label: 'Men',
    number: 2,
    heading: 'TOP 100 Men',
    question: 'Do you know a man in aerospace, aviation, or space who deserves to be recognized?',
    body: 'TOP 100 Men in Aerospace & Aviation celebrates the men shaping the future of flight \u2014 from engineers and test pilots to executives and founders. If he\u2019s pushing the boundaries of what\u2019s possible, he belongs in the conversation.',
    pronoun: 'his',
    type: 'person',
  },
  {
    key: 'angels',
    label: 'Angels',
    number: 3,
    heading: 'TOP 100 Angels',
    question: 'Know an angel investor backing aerospace and aviation startups?',
    body: 'TOP 100 Angels recognizes the investors fueling the next era of flight \u2014 from seed-stage space startups to advanced air mobility. If they\u2019re writing the checks that launch the future, they belong in the conversation.',
    pronoun: 'their',
    type: 'angel',
  },
  {
    key: 'local_legends',
    label: 'Local Legends',
    number: 4,
    heading: 'Local Legends',
    question: 'Know a local business that powers your aerospace community?',
    body: 'Local Legends spotlights the boutique gyms, wellness studios, salons, and neighborhood spots that keep the aerospace workforce thriving. If they make your corner of the industry feel like home, nominate them.',
    pronoun: 'their',
    type: 'local_legend',
  },
];

export default function NominationHub({ activeCategory, onCategoryChange, submittedNominations, onAddNomination, onRemoveNomination, onAddExisting, nominator }) {
  const [showPopover, setShowPopover] = useState(false);
  const [nominees, setNominees] = useState([]);

  useEffect(() => {
    let mounted = true;
    base44.entities.Nominee.list('-updated_date', 200)
      .then((res) => { if (mounted) setNominees(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const category = HUB_CATEGORIES.find((c) => c.key === activeCategory);
  const categoryNominations = (submittedNominations[activeCategory] || []).filter((n) => !n.existing);
  const existingAdded = (submittedNominations[activeCategory] || []).filter((n) => n.existing);
  const totalCount = Object.values(submittedNominations).reduce((sum, arr) => sum + arr.length, 0);

  const handleSubmitted = (result) => {
    if (result.existing) {
      onAddExisting(result.nominee);
      return;
    }
    onAddNomination(activeCategory, result.summary);
    setShowPopover(false);
  };

  const displaySummary = (n) => {
    if (category.type === 'local_legend') return n.business_name || 'Untitled business';
    return n.name || 'Untitled nominee';
  };

  const displaySub = (n) => {
    if (category.type === 'local_legend') return [n.business_type, n.city].filter(Boolean).join(' · ');
    if (category.type === 'angel') return [n.firm, n.investing_in].filter(Boolean).join(' · ') || 'Angel investor';
    return n.role_org || '';
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="px-4 pt-4">
        <p className="text-center text-xs leading-relaxed mb-3" style={{ color: `${brand.navy}60` }}>
          Nominate across <span className="font-bold" style={{ color: brand.navy }}>all four categories</span> — jump to any anytime
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {HUB_CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => onCategoryChange(c.key)}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all"
              style={{
                background: activeCategory === c.key ? brand.gold : 'white',
                color: activeCategory === c.key ? 'white' : `${brand.navy}70`,
                border: `1px solid ${activeCategory === c.key ? brand.gold : `${brand.navy}15`}`,
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <div className="px-4 pt-5 pb-4 text-center">
        <div
          className="h-12 w-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
          style={{ background: `${brand.gold}18` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: `${brand.navy}50` }}>
          Category {category.number} of 4
        </p>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: brand.gold }}>
          {category.heading}
        </h2>
        <h1
          className="text-xl sm:text-2xl font-bold leading-tight mb-3 max-w-xl mx-auto"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {category.question}
        </h1>
        <p className="text-xs leading-relaxed max-w-lg mx-auto" style={{ color: `${brand.navy}60` }}>
          {category.body}
        </p>
      </div>

      {/* Visual divider */}
      <div className="flex items-center justify-center px-4 py-3">
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
        <div className="mx-3 h-2 w-2 rounded-full" style={{ background: brand.gold }} />
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
      </div>

      {/* Energy tracker */}
      <div className="px-4 pb-4">
        <HubEnergyTracker count={totalCount} />
      </div>

      {/* Submitted nomination summaries */}
      <div className="px-4 pb-4 space-y-2.5">
        <AnimatePresence>
          {categoryNominations.map((n, idx) => (
            <motion.div
              key={`${activeCategory}-${idx}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: 'white', border: `1px solid ${brand.navy}10` }}
            >
              <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${brand.gold}18` }}>
                <Check className="w-4 h-4" style={{ color: brand.gold }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: brand.navy }}>
                  {displaySummary(n)}
                </p>
                {displaySub(n) && (
                  <p className="text-[11px] truncate" style={{ color: `${brand.navy}50` }}>{displaySub(n)}</p>
                )}
                <p className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#2d8a4f' }}>
                  Submitted for review
                </p>
              </div>
              <button
                onClick={() => onRemoveNomination(activeCategory, idx)}
                className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ background: `${brand.navy}05` }}
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: '#c0392b' }} />
              </button>
            </motion.div>
          ))}

          {/* Existing nominees added directly to list */}
          {existingAdded.map((n, idx) => (
            <motion.div
              key={`existing-${idx}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ background: `${brand.navy}05`, border: `1px solid ${brand.navy}10` }}
            >
              <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: brand.navy }}>
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: brand.navy }}>{n.nominee?.name}</p>
                <p className="text-[11px]" style={{ color: `${brand.navy}50` }}>Added to your Top 100 list</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add nomination button */}
        <button
          onClick={() => setShowPopover(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
          style={{
            background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
            color: 'white',
          }}
        >
          <Plus className="w-4 h-4" />
          {categoryNominations.length > 0 ? 'Add another nomination' : 'Add a nomination'}
        </button>
      </div>

      {/* Popover form */}
      <AnimatePresence>
        {showPopover && (
          <HubNominationPopover
            category={category}
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
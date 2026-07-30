import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand, emptyPersonNomination, emptyAngelNomination, emptyLocalLegend } from '@/components/nominate/NominateConfig';
import HubNominationCard from '@/components/my-top100/HubNominationCard';
import HubEnergyTracker from '@/components/my-top100/HubEnergyTracker';

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
    factory: emptyPersonNomination,
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
    factory: emptyPersonNomination,
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
    factory: emptyAngelNomination,
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
    factory: emptyLocalLegend,
  },
];

export default function NominationHub({ activeCategory, onCategoryChange, nominations, onAddNomination, onUpdateNomination, onRemoveNomination, onAddExisting, nominator }) {
  const [nominees, setNominees] = useState([]);

  useEffect(() => {
    let mounted = true;
    base44.entities.Nominee.list('-updated_date', 200)
      .then((res) => { if (mounted) setNominees(res); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const category = HUB_CATEGORIES.find((c) => c.key === activeCategory);
  const categoryNominations = nominations[activeCategory] || [];
  const totalCount = Object.values(nominations).reduce((sum, arr) => sum + arr.length, 0);

  const handleAdd = () => {
    onAddNomination(activeCategory, category.factory);
  };

  const handleUpdate = (idx, field, value) => {
    onUpdateNomination(activeCategory, idx, field, value);
  };

  const handleRemove = (idx) => {
    onRemoveNomination(activeCategory, idx);
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

      {/* Nomination cards */}
      <div className="px-4 pb-4 space-y-4">
        <AnimatePresence>
          {categoryNominations.map((nom, idx) => (
            <HubNominationCard
              key={idx}
              category={category}
              index={idx}
              data={nom}
              onChange={(field, value) => handleUpdate(idx, field, value)}
              onRemove={() => handleRemove(idx)}
              onAddExisting={onAddExisting}
              nominees={nominees}
              nominator={nominator}
            />
          ))}
        </AnimatePresence>

        {/* Add another */}
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 border-dashed transition-all"
          style={{ borderColor: `${brand.navy}20`, color: `${brand.navy}60`, background: 'transparent' }}
        >
          <Plus className="w-4 h-4" />
          Add {categoryNominations.length > 0 ? 'another' : 'a'} nomination
        </button>
      </div>
    </div>
  );
}
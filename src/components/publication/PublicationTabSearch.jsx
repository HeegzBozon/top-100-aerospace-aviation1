import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { top100Women2025Config } from '@/components/publication/publicationConfig';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

export default function PublicationTabSearch({ nominees = [], onSelectNominee }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    const sectionResults = top100Women2025Config.sections
      .filter(section => !cleanQuery || `${section.name} ${section.label}`.toLowerCase().includes(cleanQuery))
      .map(section => ({ type: 'section', ...section }));

    const nomineeResults = nominees
      .filter(nominee => cleanQuery && [
        nominee.name,
        nominee.title,
        nominee.professional_role,
        nominee.company,
        nominee.country,
        nominee.industry,
      ].filter(Boolean).join(' ').toLowerCase().includes(cleanQuery))
      .slice(0, 8)
      .map(nominee => ({ type: 'nominee', ...nominee }));

    return cleanQuery ? [...nomineeResults, ...sectionResults].slice(0, 10) : sectionResults.slice(0, 4);
  }, [query, nominees]);

  const goToSection = (id) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openResult = (result) => {
    if (result.type === 'nominee') {
      goToSection('honorees');
      onSelectNominee?.(result);
      return;
    }
    goToSection(result.id);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (results[0]) openResult(results[0]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <label htmlFor="publication-tab-search" className="sr-only">Search publication sections</label>
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: `${brandColors.ink}45` }} />
        <input
          id="publication-tab-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search honorees, companies, countries, or sections..."
          className="w-full rounded-full border bg-white/80 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-[#c9a87c] focus:ring-offset-2"
          style={{ borderColor: `${brandColors.goldPrestige}35`, color: brandColors.navyDeep }}
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {results.length > 0 ? results.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            type="button"
            onClick={() => openResult(result)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5"
            style={{ background: brandColors.cream, borderColor: `${brandColors.goldPrestige}35`, color: brandColors.navyDeep }}
          >
            <span style={{ color: brandColors.goldPrestige }}>
              {result.type === 'nominee' ? `#${result.finalRank || '—'}` : result.label}
            </span>
            {result.type === 'nominee' ? result.name : result.name}
            {result.type === 'nominee' && (result.company || result.country) && (
              <span className="hidden text-[11px] opacity-60 sm:inline">
                {result.company || result.country}
              </span>
            )}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )) : (
          <p className="text-sm" style={{ color: `${brandColors.ink}60` }}>No matching sections found.</p>
        )}
      </div>
    </motion.div>
  );
}
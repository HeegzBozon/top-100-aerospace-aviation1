import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, Filter, Sparkles, Zap, ArrowDownUp, BadgeCheck, UserPlus, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import InlineNominateNew from '@/components/my-top100/InlineNominateNew';
import { matchDiscipline, stableShuffle } from '@/components/my-top100/disciplineMatch';
import { loadNomineePool, getNomineeCategory } from '@/components/my-top100/nomineeCategory';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const DISCIPLINES = [
  { key: 'all', label: 'All Fields' },
  { key: 'space_rd', label: 'Space R&D' },
  { key: 'commercial_aviation', label: 'Aviation' },
  { key: 'defense', label: 'Defense' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'operations', label: 'Operations' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'policy', label: 'Policy' },
  { key: 'entrepreneurship', label: 'Founders' },
];

const SORTS = [
  { key: 'random', label: 'Random' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'recent', label: 'Recently Added' },
  { key: 'verified', label: 'Verified First' },
];

// Category resolution is season-based — see getNomineeCategory in nomineeCategory.js

export default function NomineeSearchDrawer({ isOpen, onClose, onAdd, addedIds, nominator, onNominate }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [discipline, setDiscipline] = useState('all');
  const [sort, setSort] = useState('random');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [nominees, setNominees] = useState([]);
  const [seasonCategory, setSeasonCategory] = useState({});
  const [randomOrder, setRandomOrder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [inlineNominate, setInlineNominate] = useState(false); // show inline new-nominee form
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      loadNominees();
    } else {
      // reset sub-views when closed
      setInlineNominate(false);
      setShowSortMenu(false);
    }
  }, [isOpen, categoryFilter]);

  const loadNominees = async () => {
    setLoading(true);
    try {
      const { pool, seasonCategory } = await loadNomineePool();
      setNominees(pool);
      setRandomOrder(stableShuffle(pool));
      setSeasonCategory(seasonCategory);
    } catch { setNominees([]); }
    setLoading(false);
  };

  const sortedFiltered = useMemo(() => {
    let list = nominees.filter(n => {
      const matchesQuery = !query || n.name?.toLowerCase().includes(query.toLowerCase()) ||
        n.title?.toLowerCase().includes(query.toLowerCase()) ||
        n.company?.toLowerCase().includes(query.toLowerCase()) ||
        n.professional_role?.toLowerCase().includes(query.toLowerCase());
      const matchesCat = categoryFilter === 'all' || getNomineeCategory(n, seasonCategory) === categoryFilter;
      const matchesDisc = matchDiscipline(n, discipline);
      return matchesQuery && matchesCat && matchesDisc;
    });

    const rankIndex = (n) => randomOrder.findIndex(r => r.id === n.id);
    const byKey = {
      random: (a, b) => rankIndex(a) - rankIndex(b),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
      recent: (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0),
      verified: (a, b) => {
        const av = a.verified_status === 'fully_verified' ? 2 : a.verified_status === 'partially_verified' ? 1 : 0;
        const bv = b.verified_status === 'fully_verified' ? 2 : b.verified_status === 'partially_verified' ? 1 : 0;
        return bv - av || rankIndex(a) - rankIndex(b);
      },
    };
    return list.sort(byKey[sort] || byKey.random);
  }, [nominees, randomOrder, query, categoryFilter, discipline, sort, seasonCategory]);

  // Smart suggestions: highest aura_score not yet added (independent of query)
  const suggestions = useMemo(() => {
    if (query) return [];
    return nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => categoryFilter === 'all' || getNomineeCategory(n, seasonCategory) === categoryFilter)
      .filter(n => matchDiscipline(n, discipline))
      .slice(0, 4);
  }, [nominees, addedIds, query, categoryFilter, discipline, seasonCategory]);

  // Bulk add: all matches in current category not yet added
  const handleBulkAddCategory = async () => {
    setBulkAdding(true);
    const toAdd = nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => categoryFilter === 'all' || getNomineeCategory(n, seasonCategory) === categoryFilter)
      .slice(0, 100 - addedIds.size);
    for (const n of toAdd) onAdd(n);
    setBulkAdding(false);
  };

  const bulkCount = nominees.filter(n => !addedIds.has(n.id) && (categoryFilter === 'all' || getNomineeCategory(n, seasonCategory) === categoryFilter)).length;

  const activeSortLabel = SORTS.find(s => s.key === sort)?.label;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(10,18,30,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col overflow-hidden"
            style={{ background: brand.cream, maxHeight: '88vh', boxShadow: '0 -8px 40px rgba(10,18,30,0.18)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: `${brand.navy}20` }} />
            </div>

            {inlineNominate ? (
              <InlineNominateNew
                initialName={query}
                onBack={() => setInlineNominate(false)}
                onDone={() => { setInlineNominate(false); setQuery(''); }}
              />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3">
                  <div>
                    <h2 className="text-base font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Browse Nominees
                    </h2>
                    <p className="text-[10px]" style={{ color: `${brand.navy}50` }}>
                      {sortedFiltered.length} {sortedFiltered.length === 1 ? 'result' : 'results'}
                    </p>
                  </div>
                  <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: `${brand.navy}08` }}>
                    <X className="w-4 h-4" style={{ color: brand.navy }} />
                  </button>
                </div>

                {/* Search bar */}
                <div className="px-4 pb-2.5">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border" style={{ background: 'white', borderColor: `${brand.navy}15` }}>
                    <Search className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}50` }} />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search name, role, company..."
                      className="flex-1 text-sm bg-transparent outline-none"
                      style={{ color: brand.navy }}
                    />
                    {query && (
                      <button onClick={() => setQuery('')}><X className="w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} /></button>
                    )}
                  </div>
                </div>

                {/* Category filter */}
                <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setCategoryFilter(cat.key)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: categoryFilter === cat.key ? brand.navy : `${brand.navy}08`,
                        color: categoryFilter === cat.key ? 'white' : `${brand.navy}70`,
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Discipline + sort + verified row */}
                <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
                  {/* Discipline select */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Filter className="w-3.5 h-3.5" style={{ color: `${brand.navy}50` }} />
                    <select
                      value={discipline}
                      onChange={e => setDiscipline(e.target.value)}
                      className="text-xs font-semibold rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer"
                      style={{ background: discipline !== 'all' ? `${brand.gold}20` : `${brand.navy}08`, color: brand.navy }}
                    >
                      {DISCIPLINES.map(d => (
                        <option key={d.key} value={d.key}>{d.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setShowSortMenu(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: `${brand.navy}08`, color: brand.navy }}
                    >
                      <ArrowDownUp className="w-3.5 h-3.5" />
                      {activeSortLabel}
                    </button>
                    <AnimatePresence>
                      {showSortMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute top-full left-0 mt-1 z-20 rounded-2xl border overflow-hidden min-w-[150px]"
                            style={{ background: 'white', borderColor: `${brand.navy}10`, boxShadow: '0 8px 24px rgba(10,18,30,0.12)' }}
                          >
                            {SORTS.map(s => (
                              <button
                                key={s.key}
                                onClick={() => { setSort(s.key); setShowSortMenu(false); }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between"
                                style={{ color: sort === s.key ? brand.gold : brand.navy, background: sort === s.key ? `${brand.gold}08` : 'transparent' }}
                              >
                                {s.label}
                                {sort === s.key && <Check className="w-3.5 h-3.5" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                </div>

                {/* Results list */}
                <div className="flex-1 overflow-y-auto px-4 pb-8">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: `${brand.gold}40`, borderTopColor: brand.gold }} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Bulk add bar */}
                      {!query && categoryFilter !== 'all' && discipline === 'all' && bulkCount > 0 && (
                        <motion.button
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBulkAddCategory}
                          disabled={bulkAdding}
                          className="w-full flex items-center gap-2.5 p-3 rounded-2xl mb-2 transition-all"
                          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
                        >
                          <Zap className="w-4 h-4" style={{ color: brand.gold }} />
                          <span className="text-xs font-bold flex-1 text-left">
                            {bulkAdding ? 'Adding…' : `Bulk add ${bulkCount} ${CATEGORIES.find(c => c.key === categoryFilter)?.label || ''} nominees`}
                          </span>
                          {!bulkAdding && <Plus className="w-3.5 h-3.5" style={{ color: brand.gold }} />}
                        </motion.button>
                      )}

                      {/* Smart suggestions */}
                      {!query && suggestions.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1.5 mb-2 px-1">
                            <Sparkles className="w-3.5 h-3.5" style={{ color: brand.gold }} />
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}60` }}>
                              Suggested for you
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            {suggestions.map(nominee => {
                              const isAdded = addedIds.has(nominee.id);
                              return (
                                <NomineeRow
                                  key={nominee.id}
                                  nominee={nominee}
                                  isAdded={isAdded}
                                  onAdd={onAdd}
                                  onNominate={onNominate}
                                  compact
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {sortedFiltered.slice(0, 100).map(nominee => {
                        const isAdded = addedIds.has(nominee.id);
                        return (
                          <NomineeRow
                            key={nominee.id}
                            nominee={nominee}
                            isAdded={isAdded}
                            onAdd={onAdd}
                            onNominate={onNominate}
                          />
                        );
                      })}

                      {sortedFiltered.length === 0 && !loading && (
                        <EmptyResults query={query} onStartNominate={() => setInlineNominate(true)} onClose={onClose} />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NomineeRow({ nominee, isAdded, onAdd, onNominate, compact }) {
  const avatarUrl = nominee.avatar_url || nominee.photo_url;
  const verified = nominee.verified_status === 'fully_verified';
  return (
    <motion.div
      layout
      className="flex items-center gap-3 p-3 rounded-2xl border transition-all"
      style={{
        background: isAdded ? `${brand.navy}06` : 'white',
        borderColor: isAdded ? `${brand.gold}40` : `${brand.navy}08`,
      }}
    >
      <div
        className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={nominee.name} className="w-full h-full object-cover" />
        ) : nominee.name?.[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>{nominee.name}</p>
          {verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />}
        </div>
        <p className="text-[11px] truncate" style={{ color: `${brand.navy}60` }}>
          {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
        </p>
      </div>

      <button
        onClick={() => !isAdded && onNominate(nominee)}
        disabled={isAdded}
        className="shrink-0 flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-bold transition-all"
        style={{ background: isAdded ? `${brand.gold}20` : `${brand.gold}15`, color: brand.gold }}
        title={isAdded ? 'Added to your Top 100' : 'Nominate and add to your Top 100'}
      >
        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
        {isAdded ? 'Added' : 'Nominate'}
      </button>
    </motion.div>
  );
}

function EmptyResults({ query, onStartNominate, onClose }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: `${brand.navy}06` }}>
        <UserPlus className="w-6 h-6" style={{ color: `${brand.navy}50` }} />
      </div>
      <h3 className="text-sm font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
        No matches found
      </h3>
      <p className="text-xs leading-relaxed mb-5 max-w-[260px] mx-auto" style={{ color: `${brand.navy}60` }}>
        {query
          ? `We couldn't find “${query}” in the verified directory. If they belong in aerospace & aviation, nominate them right here.`
          : 'No nominees match your filters. Try adjusting, or nominate someone new.'}
      </p>
      <button
        onClick={onStartNominate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <UserPlus className="w-4 h-4" />
        Nominate {query ? `"${query}"` : 'someone new'}
      </button>
    </div>
  );
}
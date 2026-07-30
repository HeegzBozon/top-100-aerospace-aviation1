import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, Filter, Sparkles, Zap, ArrowDownUp, BadgeCheck, UserPlus, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import NomineeNominateSheet from '@/components/my-top100/NomineeNominateSheet';

const CATEGORIES = ['All', 'Women', 'Men', 'Angels'];

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
  { key: 'aura', label: 'Top Aura' },
  { key: 'name', label: 'Name A–Z' },
  { key: 'recent', label: 'Recently Added' },
  { key: 'starpower', label: 'Starpower' },
  { key: 'verified', label: 'Verified First' },
];

// Map filter pills to nominee fields for bulk-add + suggestions
function nomineeMatchesCategory(n, cat) {
  if (cat === 'All') return true;
  const text = `${n.description || ''} ${n.industry || ''} ${n.discipline || ''} ${n.category || ''}`.toLowerCase();
  if (cat === 'Women') return text.includes('woman') || text.includes('women') || text.includes('female');
  if (cat === 'Men') return text.includes('man') || text.includes('men') || text.includes('male');
  if (cat === 'Angels') return text.includes('angel') || text.includes('investor') || text.includes('vc');
  return true;
}

export default function NomineeSearchDrawer({ isOpen, onClose, onAdd, addedIds }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [discipline, setDiscipline] = useState('all');
  const [sort, setSort] = useState('aura');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const [nominating, setNominating] = useState(null); // nominee object when nominating
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      loadNominees();
    } else {
      // reset sub-views when closed
      setNominating(null);
      setShowSortMenu(false);
    }
  }, [isOpen, category]);

  const loadNominees = async () => {
    setLoading(true);
    try {
      const results = await base44.entities.Nominee.list('-aura_score', 200);
      setNominees(results);
    } catch { setNominees([]); }
    setLoading(false);
  };

  const sortedFiltered = useMemo(() => {
    let list = nominees.filter(n => {
      const matchesQuery = !query || n.name?.toLowerCase().includes(query.toLowerCase()) ||
        n.title?.toLowerCase().includes(query.toLowerCase()) ||
        n.company?.toLowerCase().includes(query.toLowerCase()) ||
        n.professional_role?.toLowerCase().includes(query.toLowerCase());
      const matchesCat = nomineeMatchesCategory(n, category);
      const matchesDisc = discipline === 'all' || n.discipline === discipline;
      const matchesVerified = !verifiedOnly || n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified';
      return matchesQuery && matchesCat && matchesDisc && matchesVerified;
    });

    const byKey = {
      aura: (a, b) => (b.aura_score || 0) - (a.aura_score || 0),
      starpower: (a, b) => (b.starpower_score || 0) - (a.starpower_score || 0),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
      recent: (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0),
      verified: (a, b) => {
        const av = a.verified_status === 'fully_verified' ? 2 : a.verified_status === 'partially_verified' ? 1 : 0;
        const bv = b.verified_status === 'fully_verified' ? 2 : b.verified_status === 'partially_verified' ? 1 : 0;
        return bv - av || (b.aura_score || 0) - (a.aura_score || 0);
      },
    };
    return list.sort(byKey[sort] || byKey.aura);
  }, [nominees, query, category, discipline, sort, verifiedOnly]);

  // Smart suggestions: highest aura_score not yet added (independent of query)
  const suggestions = useMemo(() => {
    if (query) return [];
    return nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => category === 'All' || nomineeMatchesCategory(n, category))
      .filter(n => discipline === 'all' || n.discipline === discipline)
      .sort((a, b) => (b.aura_score || 0) - (a.aura_score || 0))
      .slice(0, 4);
  }, [nominees, addedIds, query, category, discipline]);

  // Bulk add: all matches in current category not yet added
  const handleBulkAddCategory = async () => {
    setBulkAdding(true);
    const toAdd = nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => nomineeMatchesCategory(n, category))
      .slice(0, 100 - addedIds.size);
    for (const n of toAdd) onAdd(n);
    setBulkAdding(false);
  };

  const bulkCount = nominees.filter(n => !addedIds.has(n.id) && nomineeMatchesCategory(n, category)).length;

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

            {nominating ? (
              <NomineeNominateSheet
                nominee={nominating}
                onBack={() => setNominating(null)}
                onDone={() => setNominating(null)}
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
                      {verifiedOnly && ' · verified only'}
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
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: category === cat ? brand.navy : `${brand.navy}08`,
                        color: category === cat ? 'white' : `${brand.navy}70`,
                      }}
                    >
                      {cat}
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

                  {/* Verified toggle */}
                  <button
                    onClick={() => setVerifiedOnly(v => !v)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: verifiedOnly ? `${brand.gold}20` : `${brand.navy}08`,
                      color: verifiedOnly ? brand.gold : `${brand.navy}70`,
                    }}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </button>
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
                      {!query && category !== 'All' && discipline === 'all' && !verifiedOnly && bulkCount > 0 && (
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
                            {bulkAdding ? 'Adding…' : `Bulk add ${bulkCount} ${category} nominees`}
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
                                  onNominate={setNominating}
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
                            onNominate={setNominating}
                          />
                        );
                      })}

                      {sortedFiltered.length === 0 && !loading && (
                        <EmptyResults query={query} onClose={onClose} />
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

      {/* Nominate action */}
      {!compact && (
        <button
          onClick={() => onNominate(nominee)}
          className="shrink-0 flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-bold transition-all"
          style={{ background: `${brand.gold}15`, color: brand.gold }}
          title="Submit a formal nomination"
        >
          <Award className="w-3.5 h-3.5" />
          Nominate
        </button>
      )}

      {/* Add / Added */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={() => !isAdded && onAdd(nominee)}
        className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center transition-all"
        style={{
          background: isAdded ? `${brand.gold}20` : `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
        }}
      >
        {isAdded ? <Check className="w-3.5 h-3.5" style={{ color: brand.gold }} /> : <Plus className="w-3.5 h-3.5 text-white" />}
      </motion.button>
    </motion.div>
  );
}

function EmptyResults({ query, onClose }) {
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
          ? `We couldn't find “${query}” in the verified directory. If they belong in aerospace & aviation, nominate them yourself.`
          : 'No nominees match your filters. Try adjusting, or nominate someone new.'}
      </p>
      <Link
        to="/nominate"
        onClick={onClose}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <UserPlus className="w-4 h-4" />
        Submit a new nomination
      </Link>
    </div>
  );
}
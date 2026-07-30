import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, Filter, Sparkles, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';

const CATEGORIES = ['All', 'Women', 'Men', 'Angels'];

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
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      loadNominees();
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

  const filtered = useMemo(() => nominees.filter(n => {
    const matchesQuery = !query || n.name?.toLowerCase().includes(query.toLowerCase()) ||
      n.title?.toLowerCase().includes(query.toLowerCase()) ||
      n.company?.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  }), [nominees, query]);

  // Smart suggestions: highest aura_score not yet added (independent of query)
  const suggestions = useMemo(() => {
    if (query) return [];
    return nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => category === 'All' || nomineeMatchesCategory(n, category))
      .slice(0, 4);
  }, [nominees, addedIds, query, category]);

  // Bulk add: all matches in current category not yet added
  const handleBulkAddCategory = async () => {
    setBulkAdding(true);
    const toAdd = nominees
      .filter(n => !addedIds.has(n.id))
      .filter(n => nomineeMatchesCategory(n, category))
      .slice(0, 100 - addedIds.size);
    for (const n of toAdd) {
      onAdd(n);
    }
    setBulkAdding(false);
  };

  const bulkCount = nominees.filter(n => !addedIds.has(n.id) && nomineeMatchesCategory(n, category)).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(10,18,30,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl flex flex-col overflow-hidden"
            style={{
              background: brand.cream,
              maxHeight: '88vh',
              boxShadow: '0 -8px 40px rgba(10,18,30,0.18)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: `${brand.navy}20` }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="text-base font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                Add to Your List
              </h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ background: `${brand.navy}08` }}
              >
                <X className="w-4 h-4" style={{ color: brand.navy }} />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 pb-3">
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border"
                style={{ background: 'white', borderColor: `${brand.navy}15` }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}50` }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search by name, role, company..."
                  className="flex-1 text-sm bg-transparent outline-none"
                  style={{ color: brand.navy }}
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X className="w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
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

            {/* Results list */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: `${brand.gold}40`, borderTopColor: brand.gold }} />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Bulk add bar */}
                  {!query && category !== 'All' && bulkCount > 0 && (
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
                            <motion.button
                              key={nominee.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => !isAdded && onAdd(nominee)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left"
                              style={{ background: `${brand.gold}08`, borderColor: `${brand.gold}30` }}
                            >
                              <div
                                className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                              >
                                {nominee.avatar_url || nominee.photo_url ? (
                                  <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name} className="w-full h-full object-cover" />
                                ) : nominee.name?.[0]?.toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>{nominee.name}</p>
                                <p className="text-[10px] truncate" style={{ color: `${brand.navy}60` }}>
                                  {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
                                </p>
                              </div>
                              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${brand.gold}, #b8884a)` }}>
                                <Plus className="w-3.5 h-3.5 text-white" />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filtered.slice(0, 100).map(nominee => {
                    const isAdded = addedIds.has(nominee.id);
                    return (
                      <motion.div
                        key={nominee.id}
                        layout
                        className="flex items-center gap-3 p-3 rounded-2xl border transition-all"
                        style={{
                          background: isAdded ? `${brand.navy}06` : 'white',
                          borderColor: isAdded ? `${brand.gold}40` : `${brand.navy}08`,
                        }}
                      >
                        {/* Avatar */}
                        <div
                          className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                        >
                          {nominee.avatar_url || nominee.photo_url ? (
                            <img
                              src={nominee.avatar_url || nominee.photo_url}
                              alt={nominee.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            nominee.name?.[0]?.toUpperCase()
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>
                            {nominee.name}
                          </p>
                          <p className="text-[11px] truncate" style={{ color: `${brand.navy}60` }}>
                            {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
                          </p>
                        </div>

                        {/* Add/Added button */}
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => !isAdded && onAdd(nominee)}
                          className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center transition-all"
                          style={{
                            background: isAdded
                              ? `${brand.gold}20`
                              : `linear-gradient(135deg, ${brand.navy}, #0b2542)`,
                          }}
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5" style={{ color: brand.gold }} />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-white" />
                          )}
                        </motion.button>
                      </motion.div>
                    );
                  })}

                  {filtered.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <p className="text-sm" style={{ color: `${brand.navy}50` }}>No nominees found for "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
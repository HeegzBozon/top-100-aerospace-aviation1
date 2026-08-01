import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Filter, ArrowDownUp, BadgeCheck, Award, UserPlus, Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { brand } from '@/components/nominate/NominateConfig';
import NomineeNominateSheet from '@/components/my-top100/NomineeNominateSheet';
import InlineNominateNew from '@/components/my-top100/InlineNominateNew';
import NomineeProfilePanel from '@/components/my-top100/NomineeProfilePanel';
import { matchDiscipline, stableShuffle } from '@/components/my-top100/disciplineMatch';
import { filterPoolNominees } from '@/components/my-top100/nomineePoolFilter';

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

const PAGE_SIZE = 40;

export default function NomineeExplorerPopover({ isOpen, onClose, addedIds, onAdd, initialNominee }) {
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState('all');
  const [sort, setSort] = useState('random');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [nominees, setNominees] = useState([]);
  const [randomOrder, setRandomOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [nominating, setNominating] = useState(null);
  const [inlineNominate, setInlineNominate] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    base44.entities.Nominee.list('-created_date', 2000).then(r => {
      if (!active) return;
      const pool = filterPoolNominees(r);
      setNominees(pool);
      setRandomOrder(stableShuffle(pool));
      setLoading(false);
    });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, discipline, sort, verifiedOnly]);
  useEffect(() => {
    if (isOpen) {
      setViewingProfile(initialNominee || null);
    } else {
      setViewingProfile(null); setNominating(null); setInlineNominate(false);
    }
  }, [isOpen, initialNominee]);

  const sortedFiltered = useMemo(() => {
    const list = nominees.filter(n => {
      if (query) {
        const q = query.toLowerCase();
        const matches =
          n.name?.toLowerCase().includes(q) ||
          n.title?.toLowerCase().includes(q) ||
          n.professional_role?.toLowerCase().includes(q) ||
          n.company?.toLowerCase().includes(q) ||
          n.organization?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (!matchDiscipline(n, discipline)) return false;
      if (verifiedOnly && !(n.verified_status === 'fully_verified' || n.verified_status === 'partially_verified')) return false;
      return true;
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
  }, [nominees, randomOrder, query, discipline, sort, verifiedOnly]);

  const activeSortLabel = SORTS.find(s => s.key === sort)?.label;
  const visible = sortedFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < sortedFiltered.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 z-[200]"
            style={{ background: 'rgba(10,18,30,0.55)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="absolute inset-0 z-[200] flex items-center justify-center p-3 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="pointer-events-auto relative w-[680px] max-w-full max-h-[86vh] rounded-3xl overflow-hidden flex flex-col"
              style={{ background: brand.cream, boxShadow: '0 24px 70px rgba(10,18,30,0.35)' }}
            >
              {/* Header */}
              <div className="px-6 pt-5 pb-3 border-b shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Explore All Nominees
                    </h2>
                    <p className="text-[11px] mt-0.5" style={{ color: `${brand.navy}50` }}>
                      {loading ? 'Loading directory…' : `${sortedFiltered.length} ${sortedFiltered.length === 1 ? 'nominee' : 'nominees'} found`}
                    </p>
                  </div>
                  <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center transition-colors" style={{ background: `${brand.navy}06` }}>
                    <X className="w-4 h-4" style={{ color: `${brand.navy}60` }} />
                  </button>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border" style={{ background: brand.cream, borderColor: `${brand.navy}15` }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}50` }} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search name, role, company..."
                    className="flex-1 text-sm bg-transparent outline-none min-w-0"
                    style={{ color: brand.navy }}
                    autoFocus
                  />
                  {query && <button onClick={() => setQuery('')}><X className="w-3.5 h-3.5" style={{ color: `${brand.navy}40` }} /></button>}
                </div>
              </div>

              {/* Filters row */}
              <div className="flex items-center gap-2 px-6 py-3 border-b flex-wrap shrink-0" style={{ borderColor: `${brand.navy}08`, background: 'white' }}>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" style={{ color: `${brand.navy}50` }} />
                  <select
                    value={discipline}
                    onChange={e => setDiscipline(e.target.value)}
                    className="text-xs font-semibold rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer"
                    style={{ background: discipline !== 'all' ? `${brand.gold}20` : `${brand.navy}08`, color: brand.navy }}
                  >
                    {DISCIPLINES.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>
                <div className="relative">
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
                <button
                  onClick={() => setVerifiedOnly(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{ background: verifiedOnly ? `${brand.gold}20` : `${brand.navy}08`, color: verifiedOnly ? brand.gold : `${brand.navy}70` }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: brand.gold }} />
                    <p className="text-xs" style={{ color: `${brand.navy}50` }}>Loading full directory…</p>
                  </div>
                ) : sortedFiltered.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: `${brand.navy}06` }}>
                      <UserPlus className="w-6 h-6" style={{ color: `${brand.navy}50` }} />
                    </div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      No matches found
                    </h3>
                    <p className="text-xs leading-relaxed mb-5 max-w-[280px] mx-auto" style={{ color: `${brand.navy}60` }}>
                      {query
                        ? `We couldn't find "${query}" in the directory. Nominate them right here.`
                        : 'No nominees match your filters. Try adjusting, or nominate someone new.'}
                    </p>
                    <button
                      onClick={() => setInlineNominate(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Nominate {query ? `"${query}"` : 'someone new'}
                    </button>
                  </div>
                ) : (
                  <>
                    {visible.map(nominee => {
                      const isAdded = addedIds.has(nominee.id);
                      const verified = nominee.verified_status === 'fully_verified';
                      return (
                        <div
                          key={nominee.id}
                          className="flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-sm"
                          style={{ background: isAdded ? `${brand.navy}04` : 'white', borderColor: isAdded ? `${brand.gold}40` : `${brand.navy}08` }}
                          onClick={() => setViewingProfile(nominee)}
                        >
                          <div
                            className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                          >
                            {nominee.avatar_url || nominee.photo_url ? (
                              <img src={nominee.avatar_url || nominee.photo_url} alt={nominee.name} className="w-full h-full object-cover" />
                            ) : nominee.name?.[0]?.toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>{nominee.name}</p>
                              {verified && <BadgeCheck className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />}
                            </div>
                            <p className="text-[10px] truncate" style={{ color: `${brand.navy}55` }}>
                              {nominee.title || nominee.professional_role}{nominee.company ? ` · ${nominee.company}` : ''}
                            </p>
                          </div>

                          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}30` }} />

                          <button
                            onClick={(e) => { e.stopPropagation(); if (!isAdded) setNominating(nominee); }}
                            disabled={isAdded}
                            className="shrink-0 flex items-center gap-1 px-2.5 h-8 rounded-full text-[11px] font-bold transition-all"
                            style={{ background: isAdded ? `${brand.gold}20` : `${brand.gold}15`, color: brand.gold }}
                            title={isAdded ? 'Added to your Top 100' : 'Nominate and add to your Top 100'}
                          >
                            {isAdded ? <Check className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                            {isAdded ? 'Added' : 'Nominate'}
                          </button>
                        </div>
                      );
                    })}
                    {hasMore && (
                      <button
                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                        className="w-full py-3 mt-2 rounded-2xl text-sm font-bold transition-all"
                        style={{ background: 'white', border: `1px solid ${brand.navy}15`, color: brand.navy }}
                      >
                        Show more ({sortedFiltered.length - visibleCount} remaining)
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Inline profile panel (slides over results) */}
              <AnimatePresence>
                {viewingProfile && (
                  <NomineeProfilePanel
                    nominee={viewingProfile}
                    onBack={() => setViewingProfile(null)}
                    onAdd={(n) => { onAdd(n); }}
                    onNominate={(n) => { setViewingProfile(null); setNominating(n); }}
                    isAdded={addedIds.has(viewingProfile.id)}
                  />
                )}
              </AnimatePresence>

              {/* Nominate sheet overlay (inside popover) */}
              <AnimatePresence>
                {nominating && (
                  <>
                    <div className="absolute inset-0 z-40" style={{ background: 'rgba(10,18,30,0.4)' }} onClick={() => setNominating(null)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 10 }}
                      className="absolute left-1/2 top-1/2 z-50 w-[420px] max-w-[92%] max-h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-3xl overflow-hidden flex flex-col"
                      style={{ background: brand.cream, boxShadow: '0 20px 60px rgba(10,18,30,0.3)' }}
                    >
                      <NomineeNominateSheet
                        nominee={nominating}
                        onBack={() => setNominating(null)}
                        onDone={() => setNominating(null)}
                        onAddToList={onAdd}
                      />
                    </motion.div>
                  </>
                )}
                {inlineNominate && (
                  <>
                    <div className="absolute inset-0 z-40" style={{ background: 'rgba(10,18,30,0.4)' }} onClick={() => setInlineNominate(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 10 }}
                      className="absolute left-1/2 top-1/2 z-50 w-[420px] max-w-[92%] max-h-[80%] -translate-x-1/2 -translate-y-1/2 rounded-3xl overflow-hidden flex flex-col"
                      style={{ background: brand.cream, boxShadow: '0 20px 60px rgba(10,18,30,0.3)' }}
                    >
                      <InlineNominateNew
                        initialName={query}
                        onBack={() => setInlineNominate(false)}
                        onDone={() => { setInlineNominate(false); setQuery(''); }}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
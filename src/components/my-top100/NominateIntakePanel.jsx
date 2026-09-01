import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Check, Search, X, Award, BadgeCheck, Compass, UserPlus, Loader2 } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import HubEnergyTracker from '@/components/my-top100/HubEnergyTracker';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import SubmittedNominationsList from '@/components/my-top100/SubmittedNominationsList';
import { loadNomineePool } from '@/components/my-top100/nomineeCategory';

const DROPDOWN_LIMIT = 6;
const HOVER_BG = `${brand.navy}06`;

// Desktop intake panel for the Nominate tab (mobile uses MobileNominateView
// + the page-level quick-add). Accepts an externally-loaded nominee pool so
// the page can share one pool load across the desktop panel and the mobile
// quick-add sheet; falls back to loading its own when none is provided.
export default function NominateIntakePanel({
  submittedNominations,
  onAddNomination,
  onRemoveNomination,
  onAddExisting,
  nominator,
  addedIds,
  onOpenExplorer,
  pool: poolProp,
  poolTotal: poolTotalProp,
  loadingPool: loadingPoolProp,
}) {
  const [query, setQuery] = useState('');
  const [poolState, setPoolState] = useState([]);
  const [poolTotalState, setPoolTotalState] = useState(0);
  const [loadingPoolState, setLoadingPoolState] = useState(true);
  const [showPopover, setShowPopover] = useState(false);
  const [initialNominee, setInitialNominee] = useState(null);

  const hasExternalPool = poolProp !== undefined;
  const pool = hasExternalPool ? poolProp : poolState;
  const poolTotal = hasExternalPool ? (poolTotalProp ?? pool.length) : poolTotalState;
  const loadingPool = hasExternalPool ? !!loadingPoolProp : loadingPoolState;

  useEffect(() => {
    if (hasExternalPool) return;
    let active = true;
    loadNomineePool()
      .then(({ pool }) => {
        if (!active) return;
        setPoolState(pool);
        setPoolTotalState(pool.length);
        setLoadingPoolState(false);
      })
      .catch(() => {
        if (active) setLoadingPoolState(false);
      });
    return () => {
      active = false;
    };
  }, [hasExternalPool]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pool
      .filter(
        (n) =>
          n.name?.toLowerCase().includes(q) ||
          n.title?.toLowerCase().includes(q) ||
          n.professional_role?.toLowerCase().includes(q) ||
          n.company?.toLowerCase().includes(q) ||
          n.organization?.toLowerCase().includes(q)
      )
      .slice(0, DROPDOWN_LIMIT);
  }, [pool, query]);

  const allEntries = [];
  ['women', 'men', 'angels'].forEach((cat) => {
    (submittedNominations[cat] || []).forEach((n, idx) => {
      allEntries.push({ ...n, _cat: cat, _idx: idx });
    });
  });
  const totalCount = allEntries.length;

  const openNew = () => {
    setInitialNominee(null);
    setShowPopover(true);
    setQuery('');
  };
  const openExisting = (nominee) => {
    setInitialNominee(nominee);
    setShowPopover(true);
    setQuery('');
  };

  const handleSubmitted = (result) => {
    if (result.existing) {
      onAddExisting(result.nominee, { category: result.category, also_angels: result.also_angels });
      return;
    }
    onAddNomination(result.category, result.summary);
    setShowPopover(false);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Hero */}
      <div className="px-4 pt-5 pb-3 text-center shrink-0">
        <div
          className="h-12 w-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
          style={{ background: `${brand.gold}18` }}
        >
          <Sparkles className="w-5 h-5" style={{ color: brand.gold }} />
        </div>
        <p
          className="text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] mb-1.5"
          style={{ color: `${brand.navy}50` }}
        >
          Nominate
        </p>
        <h1
          className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 max-w-xl mx-auto"
          style={{ color: brand.navy, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Who deserves to be in the Top 100?
        </h1>
        <p
          className="text-xs lg:text-sm leading-relaxed max-w-lg mx-auto"
          style={{ color: `${brand.navy}60` }}
        >
          Nominate the women, men, and angel investors shaping aerospace &amp; aviation.
          Choose a category in the form — and check the box to also nominate someone as
          an angel.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-2 shrink-0">
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
        <div className="mx-3 h-2 w-2 rounded-full" style={{ background: brand.gold }} />
        <div className="flex-1 h-px" style={{ background: `${brand.navy}10` }} />
      </div>

      <div className="px-4 pb-3 shrink-0">
        <HubEnergyTracker count={totalCount} />
      </div>

      {/* Smart search */}
      <div className="px-4 pb-2 shrink-0">
        <div
          className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border"
          style={{ background: 'white', borderColor: `${brand.navy}15` }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: `${brand.navy}50` }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, company…"
            className="flex-1 text-sm lg:text-base bg-transparent outline-none"
            style={{ color: brand.navy }}
            autoFocus
          />
          {hasQuery && (
            <button onClick={() => setQuery('')}>
              <X className="w-4 h-4" style={{ color: `${brand.navy}40` }} />
            </button>
          )}
        </div>
      </div>

      {/* Inline results dropdown */}
      <AnimatePresence>
        {hasQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2 shrink-0 overflow-hidden"
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: 'white',
                borderColor: `${brand.navy}10`,
                boxShadow: '0 8px 24px rgba(10,18,30,0.08)',
              }}
            >
              {loadingPool ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: brand.gold }} />
                </div>
              ) : matches.length === 0 ? (
                <div className="p-3">
                  <p className="text-xs lg:text-sm mb-2.5" style={{ color: `${brand.navy}60` }}>
                    No matches for{' '}
                    <span className="font-semibold" style={{ color: brand.navy }}>
                      “{query.trim()}”
                    </span>{' '}
                    in the verified directory.
                  </p>
                  <button
                    onClick={openNew}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm lg:text-base font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Nominate “{query.trim()}” as new
                  </button>
                </div>
              ) : (
                <div className="p-1.5">
                  {matches.map((nominee) => {
                    const isAdded = addedIds?.has(nominee.id);
                    const verified = nominee.verified_status === 'fully_verified';
                    return (
                      <button
                        key={nominee.id}
                        onClick={() => openExisting(nominee)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = HOVER_BG)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors"
                      >
                        <div
                          className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-white text-[11px] font-bold overflow-hidden"
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
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p
                              className="text-sm lg:text-base font-semibold truncate"
                              style={{ color: brand.navy }}
                            >
                              {nominee.name}
                            </p>
                            {verified && (
                              <BadgeCheck
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: brand.gold }}
                              />
                            )}
                            {isAdded && (
                              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />
                            )}
                          </div>
                          <p className="text-[10px] lg:text-xs truncate" style={{ color: `${brand.navy}55` }}>
                            {nominee.title || nominee.professional_role}
                            {nominee.company ? ` · ${nominee.company}` : ''}
                          </p>
                        </div>
                        <Award className="w-3.5 h-3.5 shrink-0" style={{ color: brand.gold }} />
                      </button>
                    );
                  })}
                  <button
                    onClick={onOpenExplorer}
                    className="w-full flex items-center justify-center gap-2 mt-1 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold"
                    style={{ color: brand.navy, background: `${brand.navy}05` }}
                  >
                    <Compass className="w-3.5 h-3.5" style={{ color: brand.gold }} />
                    Explore all {poolTotal}+ nominees
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary actions */}
      <div className="px-4 pb-3 space-y-2 shrink-0">
        <button
          onClick={openNew}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm lg:text-base font-bold transition-all"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: 'white' }}
        >
          <Plus className="w-4 h-4" />
          {totalCount > 0 ? 'Add another nomination' : 'Add a nomination'}
        </button>
        <button
          onClick={onOpenExplorer}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm lg:text-base font-semibold transition-all"
          style={{ background: 'white', border: `1px solid ${brand.navy}15`, color: brand.navy }}
        >
          <Compass className="w-4 h-4" style={{ color: brand.gold }} />
          Explore nominees
        </button>
      </div>

      {/* Submitted nominations list */}
      <div className="px-4 pb-4 overflow-y-auto flex-1 min-h-0">
        <SubmittedNominationsList
          submittedNominations={submittedNominations}
          onRemoveNomination={onRemoveNomination}
          addedIds={addedIds}
        />
      </div>

      <AnimatePresence>
        {showPopover && (
          <HubNominationPopover
            nominees={pool}
            nominator={nominator}
            initialNominee={initialNominee}
            onClose={() => setShowPopover(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
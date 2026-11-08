import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { machineOverline } from '@/components/shell/machine';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import NomineeProfilePanel from '@/components/my-top100/NomineeProfilePanel';
import ExplorerControls from '@/components/my-top100/explore/ExplorerControls';
import ExplorerRow from '@/components/my-top100/explore/ExplorerRow';
import useExplorerCursor from '@/components/my-top100/explore/useExplorerCursor';
import '@/components/my-top100/explore/exploreSheet.css';
import useModalPicker from '@/components/handheld/useModalPicker';
import { matchDiscipline, stableShuffle } from '@/components/my-top100/disciplineMatch';
import { loadNomineePool, getNomineeCategory } from '@/components/my-top100/nomineeCategory';

// The directory, opened on the machine.
//
// The whole pool — every field, every cycle — read as one roll under a navy plate. The
// sheet is seated in whatever face it is opened on: centred inside the desk's tube, and
// on the glass it takes the picture between the strip and the chin (see the
// hh-glass-panel geometry in index.css), so the hardware never stands over the reading.
//
// It is driven by the hand that is there: the ring walks the roll and the confirm key
// opens the record; the arrow keys and Enter do the same on the desk, and Escape or B
// hands the surface back. A row is opened on the panel inside the sheet — never a new
// window, never a jump off the machine.
const PAGE_SIZE = 40;

export default function NomineeExplorerPopover({ isOpen, onClose, addedIds, onAdd, initialNominee, nominator }) {
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sort, setSort] = useState('random');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [seasonCategory, setSeasonCategory] = useState({});
  const [nominees, setNominees] = useState([]);
  const [randomOrder, setRandomOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [nominating, setNominating] = useState(null);
  const [inlineNominate, setInlineNominate] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);

  const bodyRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    setLoading(true);
    loadNomineePool().then(({ pool, seasonCategory: bySeason }) => {
      if (!active) return;
      setSeasonCategory(bySeason);
      setNominees(pool);
      setRandomOrder(stableShuffle(pool));
      setLoading(false);
    });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setViewingProfile(initialNominee || null);
    } else {
      setViewingProfile(null);
      setNominating(null);
      setInlineNominate(false);
    }
  }, [isOpen, initialNominee]);

  const sortedFiltered = useMemo(() => {
    const list = nominees.filter((nominee) => {
      if (query) {
        const q = query.toLowerCase();
        const matches =
          nominee.name?.toLowerCase().includes(q) ||
          nominee.title?.toLowerCase().includes(q) ||
          nominee.professional_role?.toLowerCase().includes(q) ||
          nominee.company?.toLowerCase().includes(q) ||
          nominee.organization?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (!matchDiscipline(nominee, discipline)) return false;
      if (verifiedOnly && !(nominee.verified_status === 'fully_verified' || nominee.verified_status === 'partially_verified')) return false;
      if (categoryFilter !== 'all' && getNomineeCategory(nominee, seasonCategory) !== categoryFilter) return false;
      return true;
    });

    const rankIndex = (n) => randomOrder.findIndex((r) => r.id === n.id);
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
  }, [nominees, randomOrder, query, discipline, sort, verifiedOnly, categoryFilter, seasonCategory]);

  const visible = sortedFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < sortedFiltered.length;

  // A row is opened on the panel inside the sheet; the roll's cursor is held while it is
  // up, and the sheet's own keys belong to that panel (see the modal picker below).
  const panelOpen = !!viewingProfile || !!nominating || inlineNominate;

  const { cursor, setCursor, reset } = useExplorerCursor({
    rows: visible,
    enabled: isOpen && !panelOpen,
    onOpen: (row) => setViewingProfile(row),
    onClose,
    bodyRef,
  });

  // A new reading starts at its head: the first name the filters leave is the one the
  // cursor stands on.
  useEffect(() => {
    reset();
    setVisibleCount(PAGE_SIZE);
  }, [query, discipline, sort, verifiedOnly, categoryFilter, reset]);

  // The record read on the panel is a read: a turn of the ring takes it down, and the
  // confirm key or the way back hands the sheet to the roll again.
  useModalPicker({
    open: isOpen && !!viewingProfile,
    onClose: () => setViewingProfile(null),
    bodyRef,
  });

  const openRow = (row) => setViewingProfile(row);

  // The field takes the cursor on a desk, where the hand is already on the keys. On the
  // glass it does not: the keys would come up over the reading the sheet was opened for.
  const deskOpened =
    typeof window !== 'undefined' && !window.matchMedia('(max-width: 767px)').matches;

  return isOpen ? (
    <div
      className="machine-overlay hh-glass-panel fixed inset-0 z-[200] flex items-end justify-center md:items-center md:p-4"
      role="presentation"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close the directory"
        className="absolute inset-0 h-full w-full cursor-default bg-editorial-navy/55 backdrop-blur-[3px]"
        tabIndex={-1}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="All nominees"
        className="machine-sheet explore-sheet hh-glass-panel-card relative flex w-full flex-col overflow-hidden border border-editorial-copper/40 md:max-h-full md:max-w-[720px] md:rounded-[14px]"
      >
        {/* The plate: the maker's overline, the reading's name, and the field. */}
        <header className="shrink-0 bg-editorial-navy px-5 pb-3.5 pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold">
                {machineOverline('Directory')}
              </p>
              <h2 className="mt-1 font-heading text-[22px] leading-none text-editorial-cream">
                The whole field
              </h2>
              <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.14em] text-editorial-cream/55">
                {loading
                  ? 'Reading the directory…'
                  : `${sortedFiltered.length} ${sortedFiltered.length === 1 ? 'name' : 'names'} in this reading`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close the directory"
              className="flex shrink-0 items-center gap-1 border border-editorial-cream/30 px-2.5 py-1.5 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-editorial-cream/80 transition-colors hover:bg-editorial-cream/10 hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-gold"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Close
            </button>
          </div>

          <ExplorerControls
            query={query}
            onQuery={setQuery}
            cohort={categoryFilter}
            onCohort={setCategoryFilter}
            field={discipline}
            onField={setDiscipline}
            sort={sort}
            onSort={setSort}
            verifiedOnly={verifiedOnly}
            onVerifiedOnly={setVerifiedOnly}
            autoFocus={deskOpened}
          />
        </header>

        {/* The roll. */}
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-5 w-5 animate-spin text-editorial-copper" aria-hidden="true" />
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45">
                Reading the directory
              </p>
            </div>
          ) : sortedFiltered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="pd-rule mx-auto w-10" />
              <h3 className="mt-4 font-heading text-[17px] leading-tight text-editorial-navy">
                No name in this reading
              </h3>
              <p className="mx-auto mt-2 max-w-[300px] font-body text-[12px] leading-relaxed text-editorial-navy/60">
                {query
                  ? `Nothing under “${query}” in the directory. The field is always open to a name that is missing.`
                  : 'No record matches this narrowing. Clear a filter, or put a name forward.'}
              </p>
              <button
                type="button"
                onClick={() => setInlineNominate(true)}
                className="mt-5 inline-flex items-center gap-2 border border-editorial-copper bg-editorial-copper px-4 py-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-cream transition-colors hover:bg-editorial-label focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-navy"
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                {query ? 'Nominate this name' : 'Nominate someone'}
              </button>
            </div>
          ) : (
            <>
              <ul className="border-t border-editorial-copper">
                {visible.map((nominee, index) => (
                  <ExplorerRow
                    key={nominee.id}
                    nominee={nominee}
                    index={index}
                    focused={index === cursor}
                    isAdded={addedIds.has(nominee.id)}
                    onOpen={() => openRow(nominee)}
                    onNominate={() => { setCursor(index); setNominating(nominee); }}
                  />
                ))}
              </ul>

              {hasMore && (
                <div className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="w-full border border-editorial-navy/25 py-2.5 font-body text-[9.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy transition-colors hover:bg-editorial-navy hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
                  >
                    Read on · {sortedFiltered.length - visibleCount} more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* The foot: how the machine is driven, and where the reading has got to. */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-editorial-copper/30 px-5 py-2">
          <p className="font-body text-[8.5px] uppercase tracking-[0.16em] text-editorial-navy/45">
            <span className="md:hidden">Wheel walks · A opens · B back</span>
            <span className="hidden md:inline">↑↓ walk · Enter opens · Esc back</span>
          </p>
          <p className="font-body text-[8.5px] uppercase tracking-[0.16em] tabular-nums text-editorial-navy/45">
            {loading ? '' : `${Math.min(visibleCount, sortedFiltered.length)} / ${sortedFiltered.length}`}
          </p>
        </footer>

        {/* The record, opened on its own panel inside the sheet. */}
        {viewingProfile && (
          <NomineeProfilePanel
            nominee={viewingProfile}
            onBack={() => setViewingProfile(null)}
            onAdd={(nominee) => onAdd(nominee)}
            onNominate={(nominee) => { setViewingProfile(null); setNominating(nominee); }}
            isAdded={addedIds.has(viewingProfile.id)}
          />
        )}

        {/* The nomination ladder — the same intake the search opens. The sheet stands
            behind it; closing returns to the roll where it was left. */}
        {(nominating || inlineNominate) && (
          <HubNominationPopover
            nominees={nominees}
            nominator={nominator}
            initialNominee={nominating}
            initialName={inlineNominate ? query : null}
            onClose={() => { setNominating(null); setInlineNominate(false); }}
            onSubmitted={(result) => {
              setNominating(null);
              setInlineNominate(false);
              if (result.existing) {
                onAdd(result.nominee, { nomination_category: result.category, also_angels: result.also_angels });
              } else {
                setQuery('');
              }
            }}
          />
        )}
      </section>
    </div>
  ) : null;
}
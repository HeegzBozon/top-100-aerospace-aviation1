import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { machineOverline } from '@/components/shell/machine';
import HubNominationPopover from '@/components/my-top100/HubNominationPopover';
import NomineeProfilePanel from '@/components/my-top100/NomineeProfilePanel';
import ExplorerControls from '@/components/my-top100/explore/ExplorerControls';
import ExplorerRow from '@/components/my-top100/explore/ExplorerRow';
import ExplorerGallery from '@/components/my-top100/explore/ExplorerGallery';
import ExplorerTagCloud from '@/components/my-top100/explore/ExplorerTagCloud';
import useNomineeTags from '@/components/my-top100/explore/useNomineeTags';
import useExplorerCursor from '@/components/my-top100/explore/useExplorerCursor';
import useAutoLoad from '@/components/my-top100/explore/useAutoLoad';
import '@/components/my-top100/explore/exploreSheet.css';
import useModalPicker from '@/components/handheld/useModalPicker';
import { stableShuffle } from '@/components/my-top100/disciplineMatch';
import { loadNomineePool, getNomineeCategory } from '@/components/my-top100/nomineeCategory';

// The directory, opened on the machine.
//
// The whole pool — every field, every cycle — read as one roll under a navy plate. The
// sheet is seated in whatever face it is opened on: centred inside the desk's tube, and
// on the glass it takes the picture between the strip and the chin (see the
// hh-glass-panel geometry in index.css), so the hardware never stands over the reading.
//
// One instrument narrows it. The search, the order and the vocabulary are one band, seated
// above the roll so the tool is always in reach; the roll reads on by itself as the window
// is walked down; and a name opens as a card laid over the roll rather than as a screen that
// takes the directory away. The field and the tag family are not menus: the words carry how
// much of the reading each one holds, so the cloud itself is the way into the field.
//
// It is driven by the hand that is there: the ring walks the roll and the confirm key
// opens the record; the arrow keys and Enter do the same on the desk, and Escape or B
// hands the surface back.
const PAGE_SIZE = 40;

export default function NomineeExplorerPopover({ isOpen, onClose, addedIds, onAdd, initialNominee, nominator }) {
  const [query, setQuery] = useState('');
  const [cohort, setCohort] = useState('all');
  const [sort, setSort] = useState('random');
  const [seasonCategory, setSeasonCategory] = useState({});
  const [nominees, setNominees] = useState([]);
  const [randomOrder, setRandomOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [nominating, setNominating] = useState(null);
  const [inlineNominate, setInlineNominate] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [view, setView] = useState('list');
  const [selectedTags, setSelectedTags] = useState([]);

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

  // The vocabulary the pool is read by: the approved tags, weighted by how many names
  // carry them. Read alongside the pool, never instead of it.
  const { tags, tagSetFor } = useNomineeTags(isOpen);

  useEffect(() => {
    if (isOpen) {
      setViewingProfile(initialNominee || null);
    } else {
      setViewingProfile(null);
      setNominating(null);
      setInlineNominate(false);
    }
  }, [isOpen, initialNominee]);

  // Everything the band narrows by except the words themselves. Held apart so the pills
  // can be told which of them would still land on someone in the reading the other
  // controls have left.
  const baseReading = useMemo(
    () =>
      nominees.filter((nominee) => {
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
        if (cohort !== 'all' && getNomineeCategory(nominee, seasonCategory) !== cohort) return false;
        return true;
      }),
    [nominees, query, cohort, seasonCategory]
  );

  const reading = useMemo(() => {
    const list = selectedTags.length
      ? baseReading.filter((nominee) => {
          const held = tagSetFor(nominee);
          return !!held && selectedTags.every((tag) => held.has(tag.key));
        })
      : baseReading;

    const rankIndex = (n) => randomOrder.findIndex((r) => r.id === n.id);
    const byKey = {
      random: (a, b) => rankIndex(a) - rankIndex(b),
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
      recent: (a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0),
    };
    return [...list].sort(byKey[sort] || byKey.random);
  }, [baseReading, selectedTags, tagSetFor, sort, randomOrder]);

  const visible = reading.slice(0, visibleCount);
  const hasMore = visibleCount < reading.length;

  // The words that would still narrow this reading. A pill outside this set stays where it
  // is and is simply refused, so no press can leave the sheet empty.
  const available = useMemo(() => {
    const keys = new Set();
    reading.forEach((nominee) => tagSetFor(nominee).forEach((key) => keys.add(key)));
    return keys;
  }, [reading, tagSetFor]);

  // What each word is worth in the reading the search and the cohort have left. Counted
  // against the reading *before* the words themselves, so pressing a word never re-sizes or
  // re-sorts the row under the hand that pressed it — the cloud answers the search, not the
  // press.
  const weights = useMemo(() => {
    const counts = new Map();
    baseReading.forEach((nominee) => {
      tagSetFor(nominee).forEach((key) => counts.set(key, (counts.get(key) || 0) + 1));
    });
    return counts;
  }, [baseReading, tagSetFor]);

  // The cloud as a density picture of the field: heaviest first, and a word nobody in this
  // reading holds falls out of the row entirely rather than standing as dead furniture.
  const cloudTags = useMemo(
    () =>
      tags
        .map((tag) => ({ ...tag, weight: weights.get(tag.key) || 0 }))
        .filter((tag) => tag.weight > 0 || selectedTags.some((picked) => picked.key === tag.key))
        .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)),
    [tags, weights, selectedTags]
  );

  // A row is opened on the card inside the sheet; the roll's cursor is held while it is up,
  // and the sheet's own keys belong to that card (see the modal picker below).
  const panelOpen = !!viewingProfile || !!nominating || inlineNominate;

  const { cursor, setCursor, reset } = useExplorerCursor({
    rows: visible,
    enabled: isOpen && !panelOpen && view === 'list',
    onOpen: (row) => setViewingProfile(row),
    onClose,
    bodyRef,
  });

  // The roll reads on by itself, and the ring keeps it fed: walking the cursor towards the
  // foot of what has been read folds the next page in rather than stopping at the edge.
  const loadMore = useCallback(() => setVisibleCount((count) => count + PAGE_SIZE), []);
  const setSentinel = useAutoLoad({
    rootRef: bodyRef,
    enabled: isOpen && !loading && !panelOpen,
    hasMore,
    onMore: loadMore,
    watch: reading.length,
  });

  useEffect(() => {
    if (view !== 'list') return;
    if (cursor >= visible.length - 3 && hasMore) loadMore();
  }, [cursor, visible.length, hasMore, view, loadMore]);

  // A new reading starts at its head: the first name the filters leave is the one the
  // cursor stands on.
  useEffect(() => {
    reset();
    setVisibleCount(PAGE_SIZE);
  }, [query, sort, cohort, view, selectedTags, reset]);

  // The record read on the card is a read: a turn of the ring takes it down, and the
  // confirm key or the way back hands the sheet to the roll again.
  useModalPicker({
    open: isOpen && !!viewingProfile,
    onClose: () => setViewingProfile(null),
    bodyRef,
  });

  const openRow = (row) => setViewingProfile(row);

  // One word narrows the pool; several narrow it to the names carrying all of them — the
  // same reading the old cloud gave, and the same one this directory gives by any other
  // control: a filter, never a weight.
  const toggleTag = (tag) => {
    setSelectedTags((picked) =>
      picked.some((held) => held.key === tag.key)
        ? picked.filter((held) => held.key !== tag.key)
        : [...picked, tag]
    );
  };

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
        {/* The plate: the maker's overline, the reading's name, and the way out. */}
        <header className="shrink-0 bg-editorial-navy px-5 pb-2.5 pt-3">
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
                  : `${reading.length} ${reading.length === 1 ? 'name' : 'names'} in this reading`}
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
        </header>

        {/* One band: the field, the tags that hold, the order, and the vocabulary. Held
            above the roll, so the tool is in reach wherever the reading has got to. */}
        <ExplorerControls
          query={query}
          onQuery={setQuery}
          sort={sort}
          onSort={setSort}
          view={view}
          onView={setView}
          autoFocus={deskOpened}
        >
          {!loading && (
            <ExplorerTagCloud
              tags={cloudTags}
              available={available}
              selected={selectedTags}
              cohort={cohort}
              onCohort={setCohort}
              onToggle={toggleTag}
              onClear={() => { setSelectedTags([]); setCohort('all'); }}
            />
          )}
        </ExplorerControls>

        {/* The roll. */}
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-5 w-5 animate-spin text-editorial-copper" aria-hidden="true" />
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45">
                Reading the directory
              </p>
            </div>
          ) : reading.length === 0 ? (
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
              {view === 'gallery' ? (
                <ExplorerGallery
                  nominees={visible}
                  addedIds={addedIds}
                  onOpen={openRow}
                  onNominate={(nominee) => setNominating(nominee)}
                />
              ) : (
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
              )}

              {/* The page the reading is about to read. */}
              {hasMore && (
                <div ref={setSentinel} aria-hidden="true" className="flex items-center justify-center py-4">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-editorial-copper/60" aria-hidden="true" />
                </div>
              )}
            </>
          )}
        </div>

        {/* The foot: how the machine is driven, and where the reading has got to. */}
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-editorial-copper/30 px-5 py-2">
          <p className="font-body text-[8.5px] uppercase tracking-[0.16em] text-editorial-navy/45">
            <span className="md:hidden">
              {view === 'gallery' ? 'A opens · B back' : 'Wheel walks · A opens · B back'}
            </span>
            <span className="hidden md:inline">
              {view === 'gallery' ? 'Every plate opens its record' : '↑↓ walk · Enter opens · Esc back'}
            </span>
          </p>
          <p className="font-body text-[8.5px] uppercase tracking-[0.16em] tabular-nums text-editorial-navy/45">
            {loading ? '' : `${visible.length} / ${reading.length}`}
          </p>
        </footer>

        {/* The record, laid over the roll on its own card — the directory stays behind it,
            in place, so dismissing the card puts the reader back where they stood. */}
        {viewingProfile && (
          <div
            className="absolute inset-0 z-40 flex items-stretch justify-center bg-editorial-navy/45 p-2 md:items-center md:p-4"
            role="presentation"
          >
            <button
              type="button"
              onClick={() => setViewingProfile(null)}
              aria-label="Close the record"
              className="absolute inset-0 h-full w-full cursor-default"
              tabIndex={-1}
            />
            <NomineeProfilePanel
              nominee={viewingProfile}
              onBack={() => setViewingProfile(null)}
              onNominate={(nominee) => { setViewingProfile(null); setNominating(nominee); }}
              isAdded={addedIds.has(viewingProfile.id)}
            />
          </div>
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BadgeCheck, Check, Plus, Search, X } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { registerDigits, registerDigitLegends } from '@/components/handheld/handheldKeys';
import { useNavHint } from '@/components/handheld/faceHint';
import { getNomineeCategory } from '@/components/my-top100/nomineeCategory';

// The directory, read on the glass. The desk's explorer is a wide dialog with a pointer
// in it; here the same pool is one column under the thumb, walked by whichever face the
// case carries: the ring or ▲▼ moves the cursor, A / # puts the focused name on the
// ballot, B hands the glass back to the ballot, and 1–4 pick the cohort outright.
//
// The pool runs to two thousand names, so only the rows around the cursor are in the
// document; the rest are counted at each end rather than rendered. The window follows
// the thumb, never the other way round.
const WINDOW = 18;
const PAGE = 5;

const COHORTS = [
  { key: 'all', label: 'All', legend: 'ALL' },
  { key: 'women', label: 'Women', legend: 'WOM' },
  { key: 'men', label: 'Men', legend: 'MEN' },
  { key: 'angels', label: 'Angels', legend: 'ANG' },
];

const browseLegend = () => ({
  digits: COHORTS.reduce((digits, cohort, i) => {
    digits[String(i + 1)] = { sub: cohort.legend, aria: `Show ${cohort.label}` };
    return digits;
  }, {}),
  enter: { sub: 'ADD', aria: '# — add this name to the ballot' },
});

const roleLine = (n) => [n.title || n.professional_role, n.company || n.organization].filter(Boolean).join(' · ');

export default function GlassNomineeExplorer({
  pool = [],
  seasonCategory = {},
  addedIds,
  loading = false,
  full = false,
  onAdd,
  onClose,
}) {
  const [cohort, setCohort] = useState('all');
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [justAdded, setJustAdded] = useState(null);
  const keyHint = useNavHint();
  const rowRefs = useRef([]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pool
      .filter((n) => {
        if (cohort !== 'all' && getNomineeCategory(n, seasonCategory) !== cohort) return false;
        if (!q) return true;
        return [n.name, n.title, n.professional_role, n.company, n.organization]
          .some((value) => (value || '').toLowerCase().includes(q));
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [pool, query, cohort, seasonCategory]);

  // Everything the console asks is answered from refs, so a registered picker never
  // reads a directory the thumb has already moved past.
  const listRef = useRef(list);
  listRef.current = list;
  const cursorRef = useRef(0);
  cursorRef.current = Math.max(0, Math.min(cursor, list.length - 1));
  const addedRef = useRef(addedIds);
  addedRef.current = addedIds;
  const fullRef = useRef(full);
  fullRef.current = full;
  const addRef = useRef(onAdd);
  addRef.current = onAdd;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const isAdded = (id) => !!addedRef.current && addedRef.current.has(id);

  const add = useCallback((index) => {
    const person = listRef.current[index];
    if (!person) return null;
    if (isAdded(person.id)) return `${person.name} is already on the ballot`;
    if (fullRef.current) return 'The ballot is full';
    addRef.current?.(person);
    setJustAdded(person.id);
    return `Added ${person.name}`;
  }, []);

  const walk = useCallback((direction) => {
    const rows = listRef.current;
    if (!rows.length) return null;
    const from = cursorRef.current;
    const to = Math.max(0, Math.min(rows.length - 1, from + direction));
    if (to === from) return null;
    setCursor(to);
    return rows[to].name;
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => listRef.current.map((n) => n.name),
      index: () => cursorRef.current,
      step: (direction) => walk(direction),
      page: (direction) => walk(direction * PAGE),
      goTo: (i) => {
        const rows = listRef.current;
        if (i < 0 || i >= rows.length) return null;
        setCursor(i);
        return rows[i].name;
      },
      enter: () => {
        add(cursorRef.current);
        return true;
      },
      back: () => {
        closeRef.current?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => touchPicker(), [cursor, list.length]);

  useEffect(
    () =>
      registerDigits((digit) => {
        const cohortAt = COHORTS[Number(digit) - 1];
        if (!cohortAt) return false;
        setCohort(cohortAt.key);
        setCursor(0);
        return true;
      }),
    [],
  );

  useEffect(() => registerDigitLegends(browseLegend()), []);

  useEffect(() => {
    if (cursor > list.length - 1) setCursor(0);
  }, [list.length, cursor]);

  useEffect(() => {
    rowRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, list.length]);

  const start = Math.max(0, Math.min(cursor - 6, list.length - WINDOW));
  const rows = list.slice(start, start + WINDOW);

  return (
    <div className="pb-3">
      {/* ── The surface's head: where the glass is standing, and the way back. ── */}
      <div className="px-3 pt-3">
        <div
          className="flex items-start justify-between gap-2 pb-2"
          style={{ borderBottom: `1px solid ${brand.navy}12` }}
        >
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.26em]" style={{ color: brand.gold }}>
              Selection committee · directory
            </p>
            <h2 className="mt-0.5 font-heading text-[18px] leading-tight" style={{ color: brand.navy }}>
              Explore nominees
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to the ballot"
            className="flex h-[30px] shrink-0 items-center gap-1 rounded-[9px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}14` }}
          >
            <X className="h-[13px] w-[13px]" style={{ color: `${brand.navy}90` }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: `${brand.navy}80` }}>
              Ballot
            </span>
          </button>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <p className="text-[10.5px] font-bold tabular-nums" style={{ color: brand.navy }}>
            {loading ? 'Reading the directory' : list.length}
            <span className="font-normal" style={{ color: `${brand.navy}50` }}>
              {loading ? '…' : ` ${list.length === 1 ? 'name' : 'names'}`}
            </span>
          </p>
          <p
            className="text-right text-[7.5px] font-bold uppercase leading-none tracking-[0.14em]"
            style={{ color: `${brand.navy}50` }}
          >
            {keyHint({ walk: 'Walk', open: 'Add' })}
          </p>
        </div>

        {/* One field, and the four cohorts under it. */}
        <div
          className="mt-2 flex items-center gap-2 rounded-[10px] px-2.5 py-2"
          style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}12` }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: `${brand.navy}45` }} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder="Search a name, role, company"
            aria-label="Search the directory"
            className="min-w-0 flex-1 bg-transparent text-[16px] outline-none"
            style={{ color: brand.navy }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear the search">
              <X className="h-3.5 w-3.5" style={{ color: `${brand.navy}40` }} />
            </button>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1">
          {COHORTS.map((option) => {
            const active = cohort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCohort(option.key);
                  setCursor(0);
                }}
                className="flex-1 rounded-full px-1 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.1em]"
                style={{
                  background: active ? brand.navy : 'rgba(255,255,255,0.62)',
                  color: active ? '#FAF8F5' : `${brand.navy}70`,
                  border: `1px solid ${active ? brand.navy : `${brand.navy}12`}`,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── The column itself. ── */}
      <div className="px-3 pt-2">
        {loading ? (
          <p className="py-6 text-center text-[11px]" style={{ color: `${brand.navy}55` }}>
            Reading the directory…
          </p>
        ) : list.length === 0 ? (
          <div
            className="mt-1 rounded-[12px] px-3.5 py-5 text-center"
            style={{ background: 'rgba(255,255,255,0.62)', border: `1px solid ${brand.navy}10` }}
          >
            <Search className="mx-auto h-4 w-4" style={{ color: `${brand.navy}35` }} />
            <p className="mt-2 text-[12px] font-bold" style={{ color: brand.navy }}>
              No name in this reading
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
              Clear the search or choose another cohort — the directory holds every field.
            </p>
          </div>
        ) : (
          <>
            {start > 0 && (
              <p className="pb-1 text-center text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: `${brand.navy}35` }}>
                {start} above
              </p>
            )}
            <div className="space-y-[5px]">
              {rows.map((person, i) => {
                const index = start + i;
                const focused = index === cursor;
                const added = isAdded(person.id) || justAdded === person.id;
                const verified =
                  person.verified_status === 'fully_verified' || person.verified_status === 'partially_verified';
                return (
                  <button
                    key={person.id}
                    type="button"
                    ref={(node) => {
                      rowRefs.current[index] = node;
                    }}
                    onClick={() => {
                      setCursor(index);
                      add(index);
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2 py-1.5 text-left transition-colors"
                    style={{
                      background: focused ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                      border: `1px solid ${focused ? 'rgba(184,115,51,0.45)' : `${brand.navy}0D`}`,
                      boxShadow: focused ? '0 2px 10px -6px rgba(7,17,31,0.55)' : 'none',
                    }}
                  >
                    <span
                      className="w-[18px] shrink-0 text-[9px] font-bold tabular-nums"
                      style={{ color: `${brand.navy}40` }}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1">
                        <span className="truncate text-[12px] font-bold" style={{ color: brand.navy }}>
                          {person.name}
                        </span>
                        {verified && <BadgeCheck className="h-3 w-3 shrink-0" style={{ color: brand.gold }} />}
                      </span>
                      {roleLine(person) && (
                        <span className="block truncate text-[9.5px]" style={{ color: `${brand.navy}55` }}>
                          {roleLine(person)}
                        </span>
                      )}
                    </span>
                    {added ? (
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: brand.gold }} />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0" style={{ color: `${brand.navy}35` }} />
                    )}
                  </button>
                );
              })}
            </div>
            {start + rows.length < list.length && (
              <p className="pt-1 text-center text-[8.5px] font-bold uppercase tracking-[0.14em]" style={{ color: `${brand.navy}35` }}>
                {list.length - start - rows.length} below
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
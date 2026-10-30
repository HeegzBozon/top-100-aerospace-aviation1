import { useCallback, useEffect, useRef, useState } from 'react';
import { Info, Lock, Plus, Search, Sparkles } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { registerDigits } from '@/components/handheld/handheldKeys';
import { useNavHint } from '@/components/handheld/faceHint';
import GlassBallotRow from '@/components/my-top100/GlassBallotRow';

const getStage = () => document.querySelector('[data-handheld-screen]');
// A page key (the ring's forward/back zones, ▲▼ held on the pad) crosses five positions,
// which is how far a hand expects a ballot to move at once.
const PAGE = 5;

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

// The nominating surface, built for the glass rather than poured into it.
//
// Its one objective is stated at the head: refine the ballot. So the ballot is the whole
// of the surface — one two-figure position per line, in order, under the thumb — and
// everything that used to crowd it (the organizing column, the suggestions, the two
// full-width calls to action) is behind a single copper key. Adding is a keypress, not a
// bar; the directory is the search key; the objectives are the ⓘ.
//
// How the hardware works the order — the same law on both faces, in each one's alphabet:
//   walk    ring turn / ▲▼        the cursor stands on a position
//   lift    A / OK (#)            the position comes off the ballot
//   move    ring turn / ▲▼        it is carried, and the ballot re-reads live beneath it
//   set     A / OK (#)            it is set down where it stands
//   drop    B / BACK              it is let go where it stands
//   place   1–9                   carried to that rank outright, or jumped to when not held
// On touch the row's own up, down and remove keys do the same work a thumb's way, so
// nothing here depends on hardware being fitted.
export default function GlassNominateSurface({
  rankings = [],
  totalCount = 0,
  category = 'all',
  onCategory,
  counts = {},
  readOnly = false,
  minimum = 1,
  onReorder,
  onRemove,
  onView,
  onNominate,
  onBrowse,
  onBriefing,
}) {
  const [cursor, setCursor] = useState(0);
  const [held, setHeld] = useState(null);
  const keyHint = useNavHint();
  const rowRefs = useRef([]);

  // Everything the console asks is answered from refs, so a registered picker never
  // reads a stale ballot.
  const rowsRef = useRef(rankings);
  rowsRef.current = rankings;
  const heldRef = useRef(held);
  heldRef.current = held;
  const cursorRef = useRef(cursor);
  cursorRef.current = Math.max(0, Math.min(cursor, rankings.length - 1));
  const reorderRef = useRef(onReorder);
  reorderRef.current = onReorder;
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  useEffect(() => {
    if (cursor > rankings.length - 1) setCursor(Math.max(0, rankings.length - 1));
  }, [rankings.length, cursor]);

  // One position swaps with its neighbour. The surface hands the whole filtered order
  // back to the ballot, which is what keeps the order a single artifact.
  const moveRow = useCallback((from, to) => {
    const rows = rowsRef.current;
    if (readOnlyRef.current) return;
    if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    reorderRef.current?.(next);
  }, []);

  const walk = useCallback(
    (direction) => {
      const rows = rowsRef.current;
      if (!rows.length) return null;
      const from = cursorRef.current;
      const to = Math.max(0, Math.min(rows.length - 1, from + direction));
      // The ends of a ballot are ends: the turn is declined and the glass reads on.
      if (to === from) return null;
      const carried = !!heldRef.current;
      if (carried) moveRow(from, to);
      setCursor(to);
      return `${to + 1}. ${carried ? rows[from].nominee_name : rows[to].nominee_name}`;
    },
    [moveRow],
  );

  const lift = useCallback(() => {
    if (readOnlyRef.current) return true;
    const row = rowsRef.current[cursorRef.current];
    if (heldRef.current) {
      setHeld(null);
      return true;
    }
    if (!row) return true;
    setHeld(row.nominee_id);
    return true;
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => rowsRef.current.map((row, i) => `${i + 1}. ${row.nominee_name}`),
      index: () => cursorRef.current,
      step: (direction) => walk(direction),
      page: (direction) => walk(direction * PAGE),
      goTo: (i) => {
        const rows = rowsRef.current;
        if (i < 0 || i >= rows.length) return null;
        setCursor(i);
        return `${i + 1}. ${rows[i].nominee_name}`;
      },
      enter: () => lift(),
      // A held position is let go where it stands; an unheld one hands the press back,
      // so B unwinds to the committee menu exactly as it does everywhere else.
      back: () => {
        if (!heldRef.current) return false;
        setHeld(null);
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, held, rankings.length]);

  useEffect(() => {
    rowRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, rankings.length]);

  // The radio's digits. Carrying a position, a digit is where it is being set down;
  // standing still, a digit is the position to jump to.
  useEffect(
    () =>
      registerDigits((digit) => {
        const n = Number(digit);
        if (!n || !rowsRef.current.length) return false;
        const target = Math.min(n, rowsRef.current.length) - 1;
        if (heldRef.current) moveRow(cursorRef.current, target);
        setCursor(target);
        return true;
      }),
    [moveRow],
  );

  const open = rankings.length === 0 ? 'empty' : 'list';
  const remaining = Math.max(0, minimum - totalCount);
  const progress = Math.min(1, totalCount / 100);

  const headHint = readOnly
    ? 'Locked · voting is closed'
    : keyHint({
        walk: held ? 'Move' : 'Walk',
        open: held ? 'Set' : 'Lift',
      });

  return (
    <div className="pb-3">
      {/* ── The surface's own head: what this is, where it stands, and the two keys. ── */}
      <div className="px-3 pt-3">
        <div
          className="flex items-start justify-between gap-2 pb-2"
          style={{ borderBottom: `1px solid ${brand.navy}12` }}
        >
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.26em]" style={{ color: brand.gold }}>
              Selection committee · ballot
            </p>
            <h2
              className="mt-0.5 font-heading text-[18px] leading-tight"
              style={{ color: brand.navy }}
            >
              Refine your TOP 100
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onBriefing}
              aria-label="How this works — objectives and key results"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}14` }}
            >
              <Info className="h-[14px] w-[14px]" style={{ color: `${brand.navy}90` }} />
            </button>
            <button
              type="button"
              onClick={onNominate}
              disabled={readOnly}
              aria-label="Nominate a name not on the ballot"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:brightness-110 disabled:opacity-40"
              style={{
                background: 'linear-gradient(180deg, #E0A96B, #B87333)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 2px 6px -3px rgba(7,17,31,0.7)',
              }}
            >
              <Plus className="h-[16px] w-[16px]" strokeWidth={2.6} style={{ color: '#FFF6E9' }} />
            </button>
          </div>
        </div>

        {/* Where the ballot stands, and the keys the face on the case is carrying. */}
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <p className="text-[10.5px] font-bold tabular-nums" style={{ color: brand.navy }}>
            {totalCount}
            <span className="font-normal" style={{ color: `${brand.navy}50` }}> of 100 ranked</span>
          </p>
          <p
            className="text-right text-[7.5px] font-bold uppercase leading-none tracking-[0.14em]"
            style={{ color: `${brand.navy}50` }}
          >
            {headHint}
          </p>
        </div>

        {/* The measure, as an instrument reads it. */}
        <div
          className="mt-1 h-[3px] overflow-hidden rounded-full"
          style={{ background: `${brand.navy}0D` }}
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${Math.max(progress * 100, totalCount ? 2 : 0)}%`,
              background: 'linear-gradient(90deg, #B87333, #C9A87C)',
            }}
          />
        </div>

        <p className="mt-1 text-[9.5px]" style={{ color: remaining ? `${brand.navy}60` : '#2d8a4f' }}>
          {readOnly
            ? 'Your order stays as it was cast.'
            : remaining
              ? `${remaining} more name${remaining === 1 ? '' : 's'} to open the ballot`
              : 'Counting — your ballot is open'}
        </p>

        {/* The categories, held to one line so the ballot keeps the glass. */}
        {totalCount > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {CATEGORIES.map((tab) => {
              const active = category === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onCategory?.(tab.key)}
                  aria-pressed={active}
                  className="flex-1 rounded-full px-1 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.1em] transition-colors"
                  style={{
                    background: active ? brand.navy : 'rgba(255,255,255,0.62)',
                    color: active ? '#FAF8F5' : `${brand.navy}70`,
                    border: `1px solid ${active ? brand.navy : `${brand.navy}12`}`,
                  }}
                >
                  {tab.label}
                  <span className="ml-1 opacity-60" style={{ fontSize: 7.5 }}>
                    {counts?.[tab.key] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── The ballot itself ── */}
      <div className="px-3 pt-2">
        {open === 'empty' ? (
          readOnly ? (
            <div
              className="mt-2 rounded-[12px] px-3 py-6 text-center"
              style={{ background: 'rgba(255,255,255,0.62)', border: `1px solid ${brand.navy}10` }}
            >
              <Lock className="mx-auto h-4 w-4" style={{ color: `${brand.navy}40` }} />
              <p className="mt-2 text-[11px]" style={{ color: `${brand.navy}60` }}>
                Voting has closed for this cycle.
              </p>
            </div>
          ) : (
            <div
              className="mt-2 rounded-[12px] px-3.5 py-4"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: `1px solid ${brand.navy}12`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: brand.gold }} />
              <p className="mt-1.5 text-[12.5px] font-bold" style={{ color: brand.navy }}>
                Every position is a preference.
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
                One name opens the ballot; a hundred fills it. Add the first and the order is
                yours to arrange.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onNominate}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold active:brightness-110"
                  style={{
                    background: 'linear-gradient(180deg, #E0A96B, #B87333)',
                    color: '#FFF6E9',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  <Plus className="h-3 w-3" strokeWidth={3} /> Add a name
                </button>
                <button
                  type="button"
                  onClick={onBrowse}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold"
                  style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}
                >
                  <Search className="h-3 w-3" /> Directory
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-[5px]">
            {rankings.map((item, i) => (
              <div
                key={item.nominee_id}
                ref={(node) => {
                  rowRefs.current[i] = node;
                }}
              >
                <GlassBallotRow
                  item={item}
                  rank={i + 1}
                  focused={i === cursor}
                  held={held === item.nominee_id}
                  readOnly={readOnly}
                  first={i === 0}
                  last={i === rankings.length - 1}
                  onFocus={() => setCursor(i)}
                  onOpen={() => onView?.(item)}
                  onMove={(direction) => {
                    moveRow(i, i + direction);
                    setCursor(Math.max(0, Math.min(rankings.length - 1, i + direction)));
                  }}
                  onRemove={onRemove}
                />
              </div>
            ))}

            {readOnly ? null : (
              <button
                type="button"
                onClick={onBrowse}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed py-2 text-[10px] font-semibold"
                style={{ borderColor: `${brand.navy}1F`, color: `${brand.navy}60` }}
              >
                <Search className="h-3 w-3" />
                {100 - totalCount} slot{100 - totalCount === 1 ? '' : 's'} left · search the directory
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
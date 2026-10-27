import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import GlassNameIndexRail from '@/components/magazine/glass/GlassNameIndexRail';
import GlassNameIndexRow from '@/components/magazine/glass/GlassNameIndexRow';

const EMPTY = new Set();

// The two orders the register is read in: as the book numbers it, and as an index sets it.
const arrange = (entries, order) => (order === 'name'
  ? [...entries].sort((a, b) => a.indexForm.localeCompare(b.indexForm))
  : [...entries].sort((a, b) => a.number - b.number));

// The Index of Names, on the glass.
//
// The book's index is printed matter — names under their letters, read once — and it stays
// where it prints. This is its counterpart on the machine: a numbered register you walk
// rather than a list you scan. The ring walks it, the confirm key opens the page a name
// stands on, and the alphabet across the head throws it to a letter in one press. The
// order key switches between the book's own numbering and one alphabet.
//
// A name opened in this sitting keeps a filled pip, so the register records the reading as
// it happens. That is a record of one sitting on one glass, and is kept nowhere else.
export default function GlassNameIndex({ entries = [], read = EMPTY, onOpen, onBack }) {
  const [order, setOrder] = useState('number');
  const [cursor, setCursor] = useState(0);
  const listEl = useRef(null);
  const handlers = useRef({ onOpen, onBack });
  handlers.current = { onOpen, onBack };

  const ordered = useMemo(() => arrange(entries, order), [entries, order]);

  // The letters the issue actually carries, so the rail can print the whole alphabet.
  const letters = useMemo(() => {
    const carried = new Set(entries.map((entry) => entry.letter));
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .split('')
      .map((letter) => ({ letter, present: carried.has(letter) }));
  }, [entries]);

  // The console's hands read the register as it stands now, not as it stood when the
  // picker was registered.
  const listRef = useRef(ordered);
  listRef.current = ordered;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;

  // A list stops at its ends: a turn past the first or the last name is declined, and the
  // console hands that turn to the glass.
  const land = (target) => {
    const list = listRef.current;
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].indexForm;
  };

  // Re-sorting is a different reading of the same register, so the name standing under the
  // ring stays under it.
  const switchOrder = () => {
    const standing = listRef.current[cursorRef.current]?.key;
    const next = order === 'number' ? 'name' : 'number';
    const spot = arrange(entries, next).findIndex((entry) => entry.key === standing);
    setOrder(next);
    setCursor(spot >= 0 ? spot : 0);
  };

  const jumpToLetter = (letter) => {
    const spot = listRef.current.findIndex((entry) => entry.letter === letter);
    if (spot >= 0) setCursor(spot);
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => listRef.current.map((entry) => entry.indexForm),
      index: () => cursorRef.current,
      step: (direction) => land(cursorRef.current + direction),
      page: (direction) => land(cursorRef.current + direction),
      goTo: (index) => land(index),
      enter: () => {
        const entry = listRef.current[cursorRef.current];
        if (!entry) return false;
        handlers.current.onOpen?.(entry);
        return true;
      },
      back: () => {
        handlers.current.onBack?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => { touchPicker(); }, [ordered, cursor]);

  useEffect(() => {
    listEl.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, ordered]);

  const opened = entries.filter((entry) => read.has(entry.position)).length;

  return (
    <div className="px-3 pb-5 pt-3">
      {/* The register's head, in the console's idiom: what it is, how it is walked, and
          the way back out of it */}
      <div className="flex items-center justify-between gap-3 pb-2" style={{ borderBottom: '1px solid rgba(30,58,90,0.12)' }}>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
          Index of Names
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
            ◀▶ Walk · A Read
          </p>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: P.navy }}
          >
            <ChevronLeft className="h-3 w-3" /> Back
          </button>
        </div>
      </div>

      {/* The stamp: how many names the issue carries, how many have been opened, and the
          order key */}
      <div className="flex items-center justify-between gap-3 pt-2.5">
        <p className="text-[9.5px]" style={{ color: 'rgba(30,58,90,0.62)' }}>
          <span style={{ color: P.navy, fontWeight: 600 }}>{opened}</span>
          {' of '}
          {entries.length} opened this sitting
        </p>
        <button
          type="button"
          onClick={switchOrder}
          title={order === 'number' ? 'Numbered as the book numbers them · tap for one alphabet' : 'One alphabet · tap for the book’s numbering'}
          aria-label={order === 'number' ? 'Sorted by number. Sort by name' : 'Sorted by name. Sort by number'}
          className="flex-none rounded-full px-2 py-0.5 font-mono text-[9px]"
          style={{ color: P.navy, background: 'rgba(30,58,90,0.05)', border: '1px solid rgba(30,58,90,0.30)' }}
        >
          {order === 'number' ? 'No.' : 'A–Z'}
        </button>
      </div>

      <GlassNameIndexRail letters={letters} onJump={jumpToLetter} />

      {entries.length === 0 ? (
        <p className="pt-6 text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          This issue carries no portraits to index.
        </p>
      ) : (
        <div ref={listEl} className="mt-2 space-y-1.5">
          {ordered.map((entry, i) => (
            <GlassNameIndexRow
              key={entry.key}
              entry={entry}
              active={i === cursor}
              read={read.has(entry.position)}
              onClick={() => handlers.current.onOpen?.(entry)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
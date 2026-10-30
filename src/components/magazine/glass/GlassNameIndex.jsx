import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import GlassHonoreeCard from '@/components/magazine/glass/GlassHonoreeCard';
import GlassNameIndexTools from '@/components/magazine/glass/GlassNameIndexTools';
import GlassNameIndexRow from '@/components/magazine/glass/GlassNameIndexRow';
import useFollowing from '@/components/following/useFollowing';
import useListEntry from '@/components/following/useListEntry';
import { personKey } from '@/components/following/honoreeRecord';
import { reasonLine } from '@/components/following/followingCopy';

const EMPTY = new Set();

// The two orders the register is read in: by standing, and as an index sets it. A name
// without a standing falls after those that have one, in the book's own order.
const standing = (entry) => (entry.rank == null ? 10000 + entry.number : entry.rank);
const arrange = (entries, order) => (order === 'name'
  ? [...entries].sort((a, b) => a.indexForm.localeCompare(b.indexForm))
  : [...entries].sort((a, b) => standing(a) - standing(b)));

const matches = (entry, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [entry.name, entry.indexForm, entry.region, entry.stand].some((v) => (v || '').toLowerCase().includes(q));
};

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
  const navigate = useNavigate();
  const [order, setOrder] = useState('rank');
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [card, setCard] = useState(null);
  const [notice, setNotice] = useState('');
  const listEl = useRef(null);

  // The two bridges off this register: the people a Fellow follows, kept in AeroSync, and
  // the list they keep, which is the list the Selection Committee orders and submits.
  const following = useFollowing();
  const list = useListEntry();

  const handlers = useRef({ onOpen, onBack });
  handlers.current = { onOpen, onBack };

  // A name already followed is marked in the roll itself, so the register reads as the
  // reader's own standing with the edition rather than as one more list to search.
  const followedNames = useMemo(
    () => new Set(following.rows.map((row) => personKey(row.following_name)).filter(Boolean)),
    [following.rows],
  );
  const isFollowed = (entry) => followedNames.has(personKey(entry.name));

  const ordered = useMemo(
    () => arrange(entries, order).filter((entry) => matches(entry, query)),
    [entries, order, query],
  );

  // A new search starts the ring back at the head of what it found.
  const search = (value) => {
    setQuery(value);
    setCursor(0);
  };

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
  const switchOrder = (next) => {
    if (next === order) return;
    const stands = listRef.current[cursorRef.current]?.key;
    const spot = arrange(entries, next).filter((entry) => matches(entry, query)).findIndex((entry) => entry.key === stands);
    setOrder(next);
    setCursor(spot >= 0 ? spot : 0);
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
        // A name is opened before it is acted on: her card carries reading, following and
        // keeping, and the ring walks all three.
        setCard(entry);
        return true;
      },
      back: () => {
        handlers.current.onBack?.();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => { touchPicker(); }, [ordered, cursor, card, following.rows.length, list.count]);

  useEffect(() => {
    listEl.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, ordered]);

  const opened = entries.filter((entry) => read.has(entry.position)).length;

  // What a press on the card does, and what the card says when it cannot.
  const toggleFollow = async (entry) => {
    const res = await following.toggle({ name: entry.name, portrait: entry.portrait, nomineeId: entry.nomineeId });
    if (res.ok) setNotice(res.following ? `Following ${res.name}` : `${res.name} is no longer in the people you follow`);
    else setNotice(reasonLine(res.reason));
  };

  const addToList = async (entry) => {
    const res = await list.add(entry);
    if (res.ok) setNotice(res.already ? `${res.name} is already on your list` : `${res.name} added to your TOP 100`);
    else setNotice(reasonLine(res.reason));
  };

  if (card) {
    return (
      <GlassHonoreeCard
        entry={card}
        wasRead={read.has(card.position)}
        followed={isFollowed(card)}
        inList={!!list.positionOf(card.nomineeId)}
        listPosition={list.positionOf(card.nomineeId)}
        signedIn={following.signedIn}
        notice={notice}
        onRead={() => onOpen?.(card)}
        onToggleFollow={() => toggleFollow(card)}
        onAddToList={() => addToList(card)}
        onOpenList={() => navigate('/selection-committee?tab=nominate')}
        onOpenAeroSync={() => navigate('/aerosync/following')}
        onSignIn={() => base44.auth.redirectToLogin(window.location.href)}
        onClose={() => {
          setNotice('');
          setCard(null);
        }}
      />
    );
  }

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
            ◀▶ Walk · A Open
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
        <div className="flex flex-none items-center gap-1.5">
          {following.rows.length ? (
            <button
              type="button"
              onClick={() => navigate('/aerosync/following')}
              title="The people you follow, with the cards you hold for them"
              className="flex-none rounded-full px-2 py-0.5 font-mono text-[9px]"
              style={{ color: P.copper, border: '1px solid rgba(184,115,51,0.5)' }}
            >
              {following.rows.length} followed
            </button>
          ) : null}
        </div>
      </div>

      <GlassNameIndexTools order={order} onOrder={switchOrder} query={query} onQuery={search} />

      {entries.length === 0 ? (
        <p className="pt-6 text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          This issue carries no portraits to index.
        </p>
      ) : ordered.length === 0 ? (
        <p className="pt-6 text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          No names match “{query.trim()}”.
        </p>
      ) : (
        <div ref={listEl} className="mt-2 space-y-1.5">
          {ordered.map((entry, i) => (
            <GlassNameIndexRow
              key={entry.key}
              entry={entry}
              active={i === cursor}
              read={read.has(entry.position)}
              followed={isFollowed(entry)}
              onClick={() => setCard(entry)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
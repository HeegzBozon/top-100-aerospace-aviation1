import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';
import { useNavHint } from '@/components/handheld/faceHint';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { registerDigits, registerDigitLegends } from '@/components/handheld/handheldKeys';
import JobComposer from '@/components/chamber-jobs/JobComposer';
import useClassifieds from '@/components/classifieds/useClassifieds';
import { CHANNELS, boardGroups, channelCounts } from '@/components/classifieds/classifiedsConfig';
import ClassifiedRow from '@/components/classifieds/ClassifiedRow';
import ClassifiedDetail from '@/components/classifieds/ClassifiedDetail';
import NoticeComposer from '@/components/classifieds/NoticeComposer';

// A page key crosses five listings at once, the way a hand expects a board to move.
const PAGE = 5;

// The board.
//
// One surface, three desks: Positions (a role to fill, or a Fellow open to a move),
// Mandates (a Fellow open to a commercial engagement), and the open board, which takes
// anything else a Fellow puts up. The reader walks the notices; the confirm key opens
// the one standing under the cursor; BACK returns to the board where it was left.
//
// It is written for both faces of the machine at once — the ring walks the board and A
// opens a notice; on the radio ▲▼ walk, # opens, and the figures 1–3 jump between the
// three desks, printed on the pad while the board holds it. On touch every notice is
// its own key, so nothing here depends on hardware being fitted.
export default function Classifieds({ embedded = false }) {
  const board = useClassifieds();
  const [channel, setChannel] = useState('positions');
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(0);
  const [openKey, setOpenKey] = useState(null);
  const [composer, setComposer] = useState(null);
  const [user, setUser] = useState(null);
  const keyHint = useNavHint();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const groups = useMemo(
    () => boardGroups(channel, board, search),
    [channel, board.jobs, board.people, board.notices, search],
  );
  const listings = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const offsets = useMemo(() => {
    let running = 0;
    return groups.map((group) => {
      const start = running;
      running += group.items.length;
      return start;
    });
  }, [groups]);
  const counts = useMemo(() => channelCounts(board), [board.jobs, board.people, board.notices]);
  const active = CHANNELS.find((item) => item.key === channel) || CHANNELS[0];
  const openListing = listings.find((listing) => listing.key === openKey) || null;

  // Everything the console asks is answered from refs, so a registered picker never
  // reads a channel or a cursor the glass has already moved past.
  const listingsRef = useRef(listings);
  listingsRef.current = listings;
  const cursorRef = useRef(cursor);
  cursorRef.current = Math.max(0, Math.min(cursor, listingsRef.current.length - 1));
  const openRef = useRef(openKey);
  openRef.current = openKey;
  const rowRefs = useRef([]);

  useEffect(() => {
    if (cursor > listings.length - 1) setCursor(Math.max(0, listings.length - 1));
  }, [listings.length, cursor]);

  useEffect(() => {
    rowRefs.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, channel, listings.length, openKey]);

  // A notice is read from its head, and the board comes back to the row it was opened
  // from — never to the top, so a hand that walked twelve listings stays on the twelfth.
  useEffect(() => {
    if (!openKey) return;
    const stage = document.querySelector('.hh-stage');
    if (stage) stage.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [openKey]);

  const walk = useCallback((direction) => {
    // A notice is being read: the ring belongs to the glass, which scrolls the page.
    if (openRef.current) return null;
    const rows = listingsRef.current;
    if (!rows.length) return null;
    const from = cursorRef.current;
    const to = Math.max(0, Math.min(rows.length - 1, from + direction));
    // The ends of a board are ends: the turn is declined and the glass reads on.
    if (to === from) return null;
    setCursor(to);
    return rows[to].title;
  }, []);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => (openRef.current ? [] : listingsRef.current.map((listing) => listing.title)),
      index: () => (openRef.current ? 0 : cursorRef.current),
      step: (direction) => walk(direction),
      page: (direction) => walk(direction * PAGE),
      goTo: (index) => {
        const rows = listingsRef.current;
        if (openRef.current || index < 0 || index >= rows.length) return null;
        setCursor(index);
        return rows[index].title;
      },
      enter: () => {
        const listing = listingsRef.current[cursorRef.current];
        if (!listing || openRef.current) return false;
        setOpenKey(listing.key);
        return true;
      },
      back: () => {
        if (!openRef.current) return false;
        setOpenKey(null);
        return true;
      },
    };
  }

  useEffect(() => (composer ? undefined : registerPicker(api.current)), [composer]);

  useEffect(() => {
    touchPicker();
  }, [cursor, openKey, channel, listings.length]);

  // The radio's figures are the three desks, and the pad reprints itself to say so.
  useEffect(
    () =>
      composer
        ? undefined
        : registerDigits((digit) => {
            const match = CHANNELS.find((item) => item.digit === digit);
            if (!match) return false;
            setChannel(match.key);
            setOpenKey(null);
            setCursor(0);
            return true;
          }),
    [composer],
  );

  useEffect(
    () =>
      composer
        ? undefined
        : registerDigitLegends({
            digits: Object.fromEntries(
              CHANNELS.map((item) => [item.digit, { sub: item.short, aria: `${item.digit} — read the ${item.label} desk` }]),
            ),
            enter: { sub: 'READ', aria: '# — read the notice standing under the cursor' },
            scan: { sub: 'SRCH', aria: 'Scan — search the board' },
          }),
    [composer],
  );

  const pick = (key) => {
    setChannel(key);
    setCursor(0);
    setOpenKey(null);
    setComposer(null);
  };

  const closeComposer = () => {
    setComposer(null);
    board.reload();
  };

  const canPost = !!user?.email;
  const total = listings.length;
  const hasFilters = !!search.trim();

  return (
    <div className={embedded ? '' : 'min-h-screen'} style={embedded ? undefined : { background: C.cream }}>
      <div className={embedded ? '' : 'mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-12'}>
        {embedded ? null : (
          <header>
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: C.copper }}>
              Classifieds
            </p>
            <h1 className="mt-1 font-heading text-2xl md:text-4xl" style={{ color: C.navy }}>
              The board.
            </h1>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
              Positions, mandates and notices, put up by Fellows themselves. Nothing here is priced,
              featured or ordered by payment, and every introduction is made privately through the
              person&rsquo;s own record.
            </p>
            <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${C.copper}66, ${C.border})` }} />
          </header>
        )}

        {/* ── The three desks ── */}
        <div
          role="tablist"
          aria-label="The board"
          className="mt-4 flex flex-wrap items-center gap-1"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          {CHANNELS.map((item) => {
            const selected = channel === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => pick(item.key)}
                className="flex items-baseline gap-1 rounded-t-lg px-2.5 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em]"
                style={selected ? { color: C.navy, boxShadow: `inset 0 -2px 0 ${C.copper}` } : { color: C.muted }}
              >
                <span className="text-[8px] tabular-nums" style={{ color: selected ? C.copper : `${C.muted}` }}>
                  {item.digit}
                </span>
                {item.label}
                <span className="text-[8.5px] font-normal tabular-nums" style={{ color: `${C.muted}` }}>
                  {counts[item.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
          <span className="font-semibold uppercase tracking-[0.14em]" style={{ color: C.copper, fontSize: 8.5 }}>
            {active.kicker}
          </span>
          <span className="mx-1.5">·</span>
          {active.blurb}
        </p>

        {/* ── The board's own keys: search, and the way to put something up ── */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: C.muted }} />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCursor(0);
              }}
              placeholder={`Search the ${active.label.toLowerCase()} desk`}
              aria-label="Search the board"
              className="w-full rounded-full py-1.5 pl-8 pr-2.5 text-[12px] outline-none"
              style={{ background: '#fff', border: `1px solid ${C.border}`, color: C.navy }}
            />
          </label>

          {channel === 'positions' && canPost ? (
            <button type="button" onClick={() => setComposer('role')} className={BTN_BASE} style={BTN.primary}>
              <Plus className="h-3.5 w-3.5" /> Post a role
            </button>
          ) : null}

          {channel === 'open' && canPost ? (
            <button type="button" onClick={() => setComposer('notice')} className={BTN_BASE} style={BTN.primary}>
              <Plus className="h-3.5 w-3.5" /> Post a notice
            </button>
          ) : null}

          {channel === 'mandates' ? (
            <Link to="/Profile" className={BTN_BASE} style={BTN.outline}>
              Your availability
            </Link>
          ) : null}
        </div>

        {(channel === 'positions' || channel === 'open') && !canPost ? (
          <p className="mt-2 text-[10.5px]" style={{ color: C.muted }}>
            Read freely. <button type="button" onClick={() => base44.auth.redirectToLogin(window.location.href)} className="font-semibold underline" style={{ color: C.navy }}>Sign in</button> to put something on the board.
          </p>
        ) : null}

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-[9.5px] uppercase tracking-[0.14em]" aria-live="polite" style={{ color: C.muted }}>
            {board.loading
              ? 'Reading the board'
              : `${total} ${total === 1 ? 'notice' : 'notices'} on this desk`}
          </p>
          <p className="text-right text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: `${C.muted}` }}>
            {openListing ? 'BACK · the board' : keyHint({ walk: 'Walk', open: 'Read' })}
          </p>
        </div>

        {/* ── What the glass is showing ── */}
        {openListing ? (
          <ClassifiedDetail listing={openListing} onClose={() => setOpenKey(null)} />
        ) : composer === 'role' ? (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
                Post a role
              </p>
              <button type="button" onClick={() => setComposer(null)} aria-label="Close" className="p-1" style={{ color: C.muted }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <JobComposer user={user} accent={C.copper} onSubmitted={closeComposer} />
          </div>
        ) : composer === 'notice' ? (
          <NoticeComposer user={user} onPosted={closeComposer} onCancel={() => setComposer(null)} />
        ) : board.loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.gold }} />
          </div>
        ) : board.error ? (
          <div className="mt-3 rounded-xl px-4 py-8 text-center" style={{ border: `1px solid ${C.border}`, background: C.surface }}>
            <p className="font-heading text-[17px]" style={{ color: C.navy }}>The board is momentarily closed.</p>
            <p className="mt-1 text-[11.5px]" style={{ color: C.muted }}>{board.error}</p>
            <button type="button" onClick={board.reload} className={`${BTN_BASE} mt-3`} style={BTN.navy}>
              Try again
            </button>
          </div>
        ) : total === 0 ? (
          <div className="mt-3 rounded-xl px-4 py-8 text-center" style={{ border: `1px dashed ${C.border}`, background: 'rgba(255,255,255,0.6)' }}>
            <p className="font-heading text-[17px]" style={{ color: C.navy }}>
              {hasFilters ? 'Nothing on the board reads that way.' : 'This desk is quiet.'}
            </p>
            <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-relaxed" style={{ color: C.muted }}>
              {hasFilters ? 'Clear the search and the desk prints again in full.' : active.empty}
            </p>
            {hasFilters ? (
              <button type="button" onClick={() => setSearch('')} className={`${BTN_BASE} mt-3`} style={BTN.navy}>
                Clear the search
              </button>
            ) : null}
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            {groups.map((group, groupIndex) => (
              <section key={group.label}>
                <p className="mb-1 pl-0.5 text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: C.muted }}>
                  {group.label}
                </p>
                <div className="space-y-1.5">
                  {group.items.map((listing, index) => {
                    const flat = offsets[groupIndex] + index;
                    return (
                      <div
                        key={listing.key}
                        ref={(node) => {
                          rowRefs.current[flat] = node;
                        }}
                      >
                        <ClassifiedRow
                          listing={listing}
                          focused={flat === cursor}
                          onFocus={() => setCursor(flat)}
                          onOpen={() => setOpenKey(listing.key)}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {embedded ? null : (
          <p className="mt-8 text-[10px] leading-relaxed" style={{ color: C.muted }}>
            The board never reads transaction, payment or sponsorship data, and no place on it can be
            bought. Availability is information, never position.
          </p>
        )}
      </div>
    </div>
  );
}
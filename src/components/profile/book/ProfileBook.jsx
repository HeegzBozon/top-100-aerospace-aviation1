import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import FlipPage, { PAGE_RATIO } from '@/components/magazine/FlipPage';
import ProfilePageSheet from './ProfilePageSheet';
import PageEditor from './PageEditor';
import BookTransport, { PACE_SCALE } from './BookTransport';
import BookDockTransport from './BookDockTransport';
import useProfileWheel from './useProfileWheel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDeskDockSlot } from '@/components/desktop/deskDockSlots';

const NAVY_DEEP = '#0B1826';
const GOLD = '#C9A87C';
const CREAM = '#FAF8F5';
const COPPER = '#B87333';

// The record, held as a book — and played as one.
//
// A desk holds the spread wide and turns it by hand; a handheld holds one page at a
// time and turns it with the ring. Play reads the same pages the film was cut from:
// each spread held for its dwell, then turned, looping or stopping at the end as the
// Fellow's own settings say. Nothing is composed a second time for playback.
export default function ProfileBook({
  pages,
  isOwner,
  onEnquire,
  onOpenEpisode,
  autoplayMode = 'loop',
  dwellSeconds = 7,
  onSaveFields = null,
}) {
  const stageRef = useRef(null);
  const turnTimer = useRef(0);
  // On a phone the transport stands under the page, inside the glass. On a desk the
  // shelf carries it, so the picture keeps the whole tube and no key covers the page.
  const isMobile = useIsMobile();

  const [stageWidth, setStageWidth] = useState(0);
  const [avail, setAvail] = useState(() => ({
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
    glass: false,
  }));
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(null);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pace, setPace] = useState('normal');
  // The page being written to, if any. Writing happens on the page itself, so playback
  // holds while a line is being corrected and the page never turns out from under it.
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const read = () => setStageWidth(el.clientWidth);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The page is measured against the picture it is actually printed in — the glass on
  // the handheld, the tube on the desk — so the whole spread stands in view the moment
  // the record opens, without a scroll, and never runs under the chin or the shelf.
  useEffect(() => {
    const read = () => {
      const glass = document.querySelector('[data-handheld-screen]');
      const tube = glass || document.querySelector('[data-desk-tube]');
      if (!tube) {
        setAvail({ h: window.innerHeight, glass: false });
        return;
      }
      const stageEl = stageRef.current;
      const top = stageEl
        ? stageEl.getBoundingClientRect().top -
          tube.getBoundingClientRect().top +
          tube.scrollTop
        : 0;
      // What the chrome takes below the page: the transport under the glass on a phone,
      // and the shelf standing over the foot of the tube on a desk.
      const reserve = glass ? 104 : 96;
      setAvail({ h: tube.clientHeight - Math.max(0, top) - reserve, glass: !!glass });
    };
    read();
    const settle = window.setTimeout(read, 320);
    window.addEventListener('resize', read);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', read);
    };
  }, []);

  useEffect(() => () => clearTimeout(turnTimer.current), []);

  const dims = useMemo(() => {
    if (!stageWidth) return null;
    const wide = stageWidth >= 700;
    const perView = wide ? 2 : 1;
    const chrome = avail.glass ? 168 : 56;
    const availH = Math.max(340, Math.min(avail.h - chrome, 780));
    const maxW = wide ? (stageWidth - 56) / 2 : stageWidth - 28;
    // On a phone the page is never set below the width its type needs: a slightly
    // taller reading window is the better trade for a page you can actually read.
    const floor = wide ? 0 : 280;
    const pageW = Math.max(148, Math.min(maxW, Math.max(availH / PAGE_RATIO, floor)));
    return { wide, perView, pageW, pageH: pageW * PAGE_RATIO };
  }, [stageWidth, avail]);

  const perView = dims?.perView || 1;
  const maxStart = Math.max(pages.length - perView, 0);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const go = useCallback(
    (dir) => {
      if (!dims) return null;
      const target =
        dir === 'next'
          ? Math.min(index + dims.perView, maxStart)
          : Math.max(index - dims.perView, 0);
      if (target === index) return null;
      setEditing(null);
      setIndex(target);
      setTurning(dir);
      clearTimeout(turnTimer.current);
      turnTimer.current = window.setTimeout(() => setTurning(null), 620);
      return pages[target]?.label || null;
    },
    [dims, index, maxStart, pages]
  );

  const jump = useCallback(
    (pageIndex) => {
      if (!dims) return null;
      const target = Math.min(Math.floor(pageIndex / dims.perView) * dims.perView, maxStart);
      setEditing(null);
      setIndex(target);
      setContentsOpen(false);
      return pages[target]?.label || null;
    },
    [dims, maxStart, pages]
  );

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  // Play reads the record the way the film did: one spread, held for its dwell, then
  // turned. A record that reaches its last spread either starts again or settles.
  useEffect(() => {
    if (!playing || editing || !pages.length || !dims) return undefined;
    const base = Math.max(3, Number(dwellSeconds) || 7) * 1000;
    const dwell = Math.max(1200, base * (PACE_SCALE[pace] || 1));
    const id = window.setTimeout(() => {
      const next = index + dims.perView;
      if (next <= maxStart) setIndex(next);
      else if (autoplayMode === 'loop' && pace !== 'skim') setIndex(0);
      else setPlaying(false);
    }, dwell);
    return () => clearTimeout(id);
  }, [playing, pace, index, dims, maxStart, autoplayMode, dwellSeconds, pages.length, editing]);

  const view = useMemo(() => pages.slice(index, index + perView), [pages, index, perView]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go('prev');
      } else if (e.key === ' ' && !contentsOpen) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        if (editing) setEditing(null);
        else if (contentsOpen) setContentsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, contentsOpen, togglePlay, editing]);

  // The ring drives the book the same way the arrows do: a detent turns a page, the
  // centre plays and pauses, back closes the contents and otherwise leaves the page.
  useProfileWheel({
    labels: () => pages.map((page) => page.label),
    index: () => Math.min(index, Math.max(pages.length - 1, 0)),
    turn: go,
    jump,
    enter: () => {
      togglePlay();
      return true;
    },
    back: () => {
      if (contentsOpen) {
        setContentsOpen(false);
        return true;
      }
      return false;
    },
    play: togglePlay,
    isPlaying: () => playing,
  });

  // The shelf's transport, rebuilt as the reader moves it: the dock carries the record's
  // own controls instead of the tiles while the record is open.
  const dockTransport = useMemo(
    () => (
      <BookDockTransport
        labels={pages.map((page) => page.label)}
        index={index}
        visibleCount={view.length}
        playing={playing}
        pace={pace}
        onFirst={() => setIndex(0)}
        onPrev={() => go('prev')}
        onNext={() => go('next')}
        onTogglePlay={togglePlay}
        onJump={jump}
        onContents={() => setContentsOpen(true)}
        onPace={setPace}
      />
    ),
    [pages, index, view.length, playing, pace, go, jump, togglePlay]
  );
  useDeskDockSlot('record-transport', isMobile ? null : dockTransport, 0);

  return (
    <div style={{ background: NAVY_DEEP }} className="relative">
      {/* The stage the book stands on — nothing above it: the record opens on the page
          itself, and its controls stand on the machine's shelf below. */}
      <div
        ref={stageRef}
        className="relative flex items-center justify-center px-3 py-3 sm:px-7 sm:py-4"
        style={{ perspective: '2200px' }}
      >
        {dims && (
          <div
            className="relative"
            style={{
              width: view.length * dims.pageW,
              height: dims.pageH,
              boxShadow: '0 40px 80px -40px rgba(3,8,15,0.95), 0 2px 0 rgba(201,168,124,0.16)',
            }}
          >
            <div className="flex" style={{ width: '100%', height: '100%' }}>
              {view.map((page, i) => (
                <div
                  key={i}
                  style={{
                    width: dims.pageW,
                    height: dims.pageH,
                    overflow: 'hidden',
                    position: 'relative',
                    borderRight:
                      i < view.length - 1 ? '1px solid rgba(30,58,90,0.18)' : 'none',
                  }}
                >
                  <FlipPage>
                    <ProfilePageSheet
                      page={page}
                      isOwner={isOwner}
                      onEnquire={onEnquire}
                      onOpenEpisode={onOpenEpisode}
                      onEditPage={onSaveFields ? setEditing : null}
                    />
                  </FlipPage>

                  {/* The line being written, on the page that prints it. Drawn beside
                      the scaled sheet rather than inside it, so the field is a field's
                      size whatever the spread is scaled to. */}
                  {editing && editing.key === page.key ? (
                    <PageEditor
                      fields={editing.edit.fields}
                      onCancel={() => setEditing(null)}
                      onSave={async (patch) => {
                        await onSaveFields(patch);
                        setEditing(null);
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            {/* The spine's shade, so the two pages read as one folded sheet */}
            {view.length > 1 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0"
                style={{
                  left: dims.pageW - 22,
                  width: 44,
                  background:
                    'linear-gradient(90deg, rgba(30,58,90,0) 0%, rgba(30,58,90,0.16) 46%, rgba(30,58,90,0.04) 100%)',
                }}
              />
            )}

            {/* The sheet being turned */}
            {turning && (
              <div
                aria-hidden="true"
                className={`pb-leaf pb-leaf-${turning}`}
                style={{
                  left: turning === 'next' && view.length > 1 ? dims.pageW : 0,
                  width: view.length > 1 ? dims.pageW : '100%',
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Foot: only the glass needs a transport of its own — a desk drives the record
          from its shelf. */}
      {isMobile && (
        <BookTransport
          labels={pages.map((page) => page.label)}
          index={index}
          visibleCount={view.length}
          playing={playing}
          onFirst={() => setIndex(0)}
          onPrev={() => go('prev')}
          onNext={() => go('next')}
          onTogglePlay={togglePlay}
          onJump={jump}
          onContents={() => setContentsOpen(true)}
          pace={pace}
          onPace={setPace}
        />
      )}

      {/* A page that will not turn is a page that has arrived: nothing else. */}
      <span className="sr-only" aria-live="polite">
        {`Page ${index + 1} of ${pages.length}`}
      </span>

      {contentsOpen && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          style={{ background: 'rgba(7,15,31,0.66)' }}
          onClick={() => setContentsOpen(false)}
          role="presentation"
        >
          <div
            className="h-full w-full max-w-xs overflow-y-auto p-6"
            style={{ background: NAVY_DEEP }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-lg" style={{ color: CREAM }}>
                Contents
              </h2>
              <button
                type="button"
                onClick={() => setContentsOpen(false)}
                aria-label="Close contents"
                className="rounded-full p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" style={{ color: CREAM }} />
              </button>
            </div>

            <ol className="space-y-0.5">
              {pages.map((page, i) => {
                const current = i >= index && i < index + perView;
                return (
                  <li key={page.key}>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={current ? 'true' : undefined}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                        current ? 'bg-white/[0.08]' : 'hover:bg-white/5'
                      }`}
                    >
                      <p
                        className="font-body text-[8.5px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: current ? GOLD : 'rgba(250,248,245,0.45)' }}
                      >
                        {page.label}
                      </p>
                      <p
                        className="mt-1 font-heading text-[13px] leading-tight"
                        style={{ color: current ? GOLD : CREAM }}
                      >
                        {page.title}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
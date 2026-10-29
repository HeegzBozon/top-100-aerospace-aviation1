import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, X } from 'lucide-react';
import FlipPage, { PAGE_RATIO } from '@/components/magazine/FlipPage';
import ProfilePageSheet from './ProfilePageSheet';
import BookTransport from './BookTransport';
import useProfileWheel from './useProfileWheel';

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
}) {
  const stageRef = useRef(null);
  const turnTimer = useRef(0);

  const [stageWidth, setStageWidth] = useState(0);
  const [avail, setAvail] = useState(() => ({
    h: typeof window === 'undefined' ? 800 : window.innerHeight,
    glass: false,
  }));
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(null);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const read = () => setStageWidth(el.clientWidth);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The page is measured against the picture it is actually printed in: on the
  // handheld that is the glass, not the window, so the foot of the page never runs
  // under the chin.
  useEffect(() => {
    const read = () => {
      const glass = document.querySelector('[data-handheld-screen]');
      const glassH = glass?.clientHeight || 0;
      setAvail({ h: glassH || window.innerHeight, glass: glassH > 0 });
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
    const chrome = avail.glass ? 168 : 210;
    const availH = Math.max(340, Math.min(avail.h - chrome, 780));
    const maxW = wide ? (stageWidth - 56) / 2 : stageWidth - 28;
    const pageW = Math.max(148, Math.min(maxW, availH / PAGE_RATIO));
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
      setIndex(Math.min(Math.floor(pageIndex / dims.perView) * dims.perView, maxStart));
      setContentsOpen(false);
      return null;
    },
    [dims, maxStart]
  );

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  // Play reads the record the way the film did: one spread, held for its dwell, then
  // turned. A record that reaches its last spread either starts again or settles.
  useEffect(() => {
    if (!playing || !pages.length || !dims) return undefined;
    const dwell = Math.max(3, Number(dwellSeconds) || 7) * 1000;
    const id = window.setTimeout(() => {
      const next = index + dims.perView;
      if (next <= maxStart) setIndex(next);
      else if (autoplayMode === 'loop') setIndex(0);
      else setPlaying(false);
    }, dwell);
    return () => clearTimeout(id);
  }, [playing, index, dims, maxStart, autoplayMode, dwellSeconds, pages.length]);

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
      } else if (e.key === 'Escape' && contentsOpen) {
        setContentsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, contentsOpen, togglePlay]);

  // The ring drives the book the same way the arrows do: a detent turns a page, the
  // centre plays and pauses, back closes the contents and otherwise leaves the page.
  useProfileWheel({
    labels: () => view.map((page) => page.label),
    index: () => 0,
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
  });

  const atStart = index <= 0;
  const atEnd = index >= maxStart;

  return (
    <div style={{ background: NAVY_DEEP }} className="relative">
      {/* Head band: what is being read, and the way into it playing itself */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-8"
        style={{ borderBottom: '1px solid rgba(201,168,124,0.18)' }}
      >
        <p
          className="font-body text-[9.5px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'rgba(201,168,124,0.8)' }}
        >
          The record · {pages.length} {pages.length === 1 ? 'page' : 'pages'}
          {playing ? ` · playing ${String(index + 1).padStart(2, '0')}` : ''}
        </p>

        <div className="flex items-center gap-2">
          <span
            className="hidden font-body text-[9px] uppercase tracking-[0.22em] sm:inline"
            style={{ color: 'rgba(250,248,245,0.42)' }}
          >
            {dims?.wide ? 'Spread' : 'Turn with the arrows'}
          </span>
          <button
            type="button"
            onClick={togglePlay}
            aria-pressed={playing}
            aria-label={playing ? 'Pause the record' : 'Play the record'}
            className="flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-colors"
            style={{
              background: playing ? 'rgba(184,115,51,0.22)' : COPPER,
              border: `1px solid ${playing ? 'rgba(184,115,51,0.7)' : COPPER}`,
              color: CREAM,
            }}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="font-body text-[9.5px] font-bold uppercase tracking-[0.2em]">
              {playing ? 'Pause' : 'Play'}
            </span>
          </button>
        </div>
      </div>

      {/* The stage the book stands on */}
      <div
        ref={stageRef}
        className="relative flex items-center justify-center px-3 py-5 sm:px-7 sm:py-8"
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
                    />
                  </FlipPage>
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

      {/* Foot: the transport — the measure of the record, played or turned */}
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
      />

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
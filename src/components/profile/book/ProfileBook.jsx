import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, X } from 'lucide-react';
import FlipPage, { PAGE_RATIO } from '@/components/magazine/FlipPage';
import ProfilePageSheet from './ProfilePageSheet';

const NAVY_DEEP = '#0B1826';
const GOLD = '#C9A87C';
const CREAM = '#FAF8F5';

// The record, held as a book.
//
// A desk holds the spread wide — two pages, turned by hand. A handheld holds one
// page at a time, because the glass is one page wide. Both read the very same
// pages: this is a presentation of the record, not a second copy of it.
export default function ProfileBook({ pages, isOwner, onEnquire, onOpenEpisode }) {
  const stageRef = useRef(null);
  const timers = useRef([]);

  const [stageWidth, setStageWidth] = useState(0);
  const [viewportH, setViewportH] = useState(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight
  );
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState(null);
  const [contentsOpen, setContentsOpen] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const read = () => setStageWidth(el.clientWidth);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const read = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const dims = useMemo(() => {
    if (!stageWidth) return null;
    const wide = stageWidth >= 700;
    const perView = wide ? 2 : 1;
    const availH = Math.max(360, Math.min(viewportH - 210, 780));
    const maxW = wide ? (stageWidth - 56) / 2 : stageWidth - 28;
    const pageW = Math.max(148, Math.min(maxW, availH / PAGE_RATIO));
    return { wide, perView, pageW, pageH: pageW * PAGE_RATIO };
  }, [stageWidth, viewportH]);

  const perView = dims?.perView || 1;
  const maxStart = Math.max(pages.length - perView, 0);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const go = useCallback(
    (dir) => {
      if (!dims || turning) return;
      const target =
        dir === 'next'
          ? Math.min(index + dims.perView, maxStart)
          : Math.max(index - dims.perView, 0);
      if (target === index) return;
      setTurning(dir);
      timers.current.push(window.setTimeout(() => setIndex(target), 190));
      timers.current.push(window.setTimeout(() => setTurning(null), 620));
    },
    [dims, turning, index, maxStart]
  );

  const jump = useCallback(
    (pageIndex) => {
      if (!dims) return;
      const start = Math.floor(pageIndex / dims.perView) * dims.perView;
      setIndex(Math.min(start, maxStart));
      setContentsOpen(false);
    },
    [dims, maxStart]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go('prev');
      } else if (e.key === 'Escape' && contentsOpen) {
        setContentsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, contentsOpen]);

  const view = useMemo(
    () => pages.slice(index, index + perView),
    [pages, index, perView]
  );

  const atStart = index <= 0;
  const atEnd = index >= maxStart;

  return (
    <div style={{ background: NAVY_DEEP }} className="relative">
      {/* Head band: what is being read, and how far through it the reader is */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-8"
        style={{ borderBottom: `1px solid rgba(201,168,124,0.18)` }}
      >
        <p
          className="font-body text-[9.5px] font-semibold uppercase tracking-[0.28em]"
          style={{ color: 'rgba(201,168,124,0.8)' }}
        >
          The record · {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </p>
        <p
          className="font-body text-[9px] uppercase tracking-[0.22em]"
          style={{ color: 'rgba(250,248,245,0.42)' }}
        >
          {dims?.wide ? 'Spread · turn with the arrows' : 'Turn with the arrows'}
        </p>
      </div>

      {/* The stage the book stands on */}
      <div
        ref={stageRef}
        className="relative flex items-center justify-center px-3 py-6 sm:px-7 sm:py-9"
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

      {/* Foot band: the turn, the place, the contents */}
      <div
        className="flex items-center justify-center gap-1 px-4 py-2.5"
        style={{ borderTop: `1px solid rgba(201,168,124,0.18)` }}
      >
        <button
          type="button"
          onClick={() => setIndex(0)}
          disabled={atStart}
          aria-label="Back to the cover"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-25"
          style={{ color: CREAM }}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go('prev')}
          disabled={atStart}
          aria-label="Previous page"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-25"
          style={{ color: CREAM }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span
          className="px-2 text-[13px] tabular-nums"
          style={{ fontFamily: 'var(--font-heading)', color: CREAM }}
          aria-live="polite"
        >
          {String(index + 1).padStart(2, '0')}
          <span style={{ color: 'rgba(250,248,245,0.35)' }}>
            {view.length > 1
              ? `–${String(Math.min(index + view.length, pages.length)).padStart(2, '0')}`
              : ''}{' '}
            / {String(pages.length).padStart(2, '0')}
          </span>
        </span>

        <button
          type="button"
          onClick={() => go('next')}
          disabled={atEnd}
          aria-label="Next page"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-25"
          style={{ color: CREAM }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setContentsOpen(true)}
          className="ml-2 rounded-full px-3 py-2 font-body text-[9px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.6)' }}
        >
          Contents
        </button>
      </div>

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
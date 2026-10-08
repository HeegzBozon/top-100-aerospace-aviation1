import React, { useRef, useState, useCallback, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Share2, List, X } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';

// Cinematic flipbook using react-pageflip. Renders native composition pages
// with tactile page turns, chapter dividers, and pull quote breakaway pages.
export default function CinematicFlipbook({ pages, issue }) {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(pages.length);
  const [showContents, setShowContents] = useState(false);

  const onFlip = useCallback((e) => setCurrentPage(e.data), []);
  const onInit = useCallback(() => {
    if (bookRef.current?.pageFlip) setTotalPages(bookRef.current.pageFlip().getPageCount());
  }, []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  const goToPage = useCallback((idx) => {
    bookRef.current?.pageFlip()?.flip(idx, 'top');
    setShowContents(false);
  }, []);

  const share = useCallback(() => {
    if (navigator.share) navigator.share({ title: issue.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  }, [issue.title]);

  // Build chapter index for the contents panel
  const chapterIndex = useMemo(() => {
    return pages
      .map((p, i) => ({ page: p, index: i }))
      .filter(({ page }) => page.layout_type === 'chapter_divider' || page.layout_type === 'cover');
  }, [pages]);

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: P.navyVoid }}>
        <p className="text-sm" style={{ color: 'rgba(250,248,245,0.5)' }}>No pages to display.</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center w-full overflow-hidden" style={{ background: P.navyVoid, minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] truncate" style={{ color: P.gold }}>
          TOP 100 · {issue.title}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowContents(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10"
            style={{ color: P.cream }}
            aria-label="Contents"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={share}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10"
            style={{ color: P.cream }}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Flipbook */}
      <div className="flex flex-1 items-center justify-center w-full py-12 px-4" style={{ minHeight: '100vh' }}>
        <HTMLFlipBook
          ref={bookRef}
          width={400}
          height={560}
          size="stretch"
          minWidth={300}
          maxWidth={460}
          minHeight={420}
          maxHeight={640}
          showCover={true}
          flippingTime={800}
          usePortrait={true}
          autoSize={true}
          maxShadowOpacity={0.5}
          drawShadow={true}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          onFlip={onFlip}
          onInit={onInit}
          className="mx-auto"
          startPage={0}
          mobileScrollSupport={true}
        >
          {pages.map((page, i) => (
            <div key={page.id || i} style={{ height: '100%', overflow: 'hidden' }}>
              <PageRenderer page={page} issue={issue} pageNumber={i + 1} totalPages={totalPages} />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-2 shadow-2xl"
          style={{ background: 'rgba(7,15,31,0.92)', border: '1px solid rgba(201,168,124,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <button
            onClick={flipPrev}
            disabled={currentPage === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
            style={{ color: P.cream }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm tabular-nums px-2" style={{ color: P.cream, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {String(currentPage + 1).padStart(2, '0')}
            <span style={{ color: 'rgba(250,248,245,0.35)' }}> / {String(totalPages).padStart(2, '0')}</span>
          </span>
          <button
            onClick={flipNext}
            disabled={currentPage >= totalPages - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
            style={{ color: P.cream }}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contents panel */}
      {showContents && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(7,15,31,0.6)' }} onClick={() => setShowContents(false)}>
          <div className="w-full max-w-xs h-full overflow-y-auto p-6" style={{ background: P.navy }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg" style={{ color: P.cream }}>Contents</h3>
              <button onClick={() => setShowContents(false)} className="p-1 rounded-full hover:bg-white/10"><X className="w-4 h-4" style={{ color: P.cream }} /></button>
            </div>
            <div className="space-y-1">
              {chapterIndex.map(({ page, index }) => (
                <button
                  key={page.id || index}
                  onClick={() => goToPage(index)}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5"
                >
                  <p className="text-sm" style={{ color: P.cream }}>
                    {page.layout_type === 'cover' ? 'Cover' : page.chapter_label || 'Section'}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(250,248,245,0.4)' }}>Page {String(index + 1).padStart(2, '0')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
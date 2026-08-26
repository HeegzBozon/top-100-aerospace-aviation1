import HTMLFlipBook from 'react-pageflip';
import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// The page-turn engine. Wraps react-pageflip in a full-screen cinematic
// shell — navy void, gold chrome, serif counter. Swipe, click corners,
// or use the bottom nav. The share button hits the native sheet.
export default function FlipbookReader({ pages, accent, editionTitle }) {
  const bookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(pages.length);

  const onFlip = useCallback((e) => setCurrentPage(e.data), []);
  const onInit = useCallback(() => {
    if (bookRef.current?.pageFlip) setTotalPages(bookRef.current.pageFlip().getPageCount());
  }, []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  const share = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: editionTitle || 'TOP 100 Edition', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  }, [editionTitle]);

  return (
    <div className="relative flex flex-col items-center min-h-screen w-full overflow-hidden" style={{ background: B.navyDeep }}>
      {/* Top bar */}
      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
          TOP 100 · {editionTitle || 'Edition'}
        </span>
        <button
          onClick={share}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10"
          style={{ color: B.cream }}
          aria-label="Share edition"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Flipbook */}
      <div className="flex flex-1 items-center justify-center w-full py-10 px-4" style={{ minHeight: '100vh' }}>
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={560}
          size="stretch"
          minWidth={300}
          maxWidth={480}
          minHeight={400}
          maxHeight={620}
          showCover={true}
          flippingTime={700}
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
            <div key={i} className="edition-page" style={{ height: '100%', overflow: 'hidden' }}>
              {page}
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-2 shadow-2xl"
          style={{ background: 'rgba(7,17,31,0.92)', border: '1px solid rgba(201,168,124,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <button
            onClick={flipPrev}
            disabled={currentPage === 0}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
            style={{ color: B.cream }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm tabular-nums px-2" style={{ color: B.cream, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {String(currentPage + 1).padStart(2, '0')}
            <span style={{ color: 'rgba(250,248,245,0.35)' }}> / {String(totalPages).padStart(2, '0')}</span>
          </span>
          <button
            onClick={flipNext}
            disabled={currentPage >= totalPages - 1}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
            style={{ color: B.cream }}
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
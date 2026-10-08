import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, List, X, Share2, Loader2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { base44 } from '@/api/base44Client';

// PDF viewer with cinematic page-by-page navigation. Used when the issue
// is assembled from a finished PDF upload.
export default function PdfViewer({ issue, signedUrl, mode }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showContents, setShowContents] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const totalPages = issue.cover_pdf_page_count || 0;

  const goNext = useCallback(() => {
    if (currentPage < totalPages) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentPage((p) => Math.min(p + 1, totalPages));
        setTransitioning(false);
      }, 300);
    }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentPage((p) => Math.max(p - 1, 1));
        setTransitioning(false);
      }, 300);
    }
  }, [currentPage]);

  const share = useCallback(() => {
    if (navigator.share) navigator.share({ title: issue.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  }, [issue.title]);

  if (!signedUrl) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: P.navyVoid }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: P.gold }} />
      </div>
    );
  }

  const pdfUrl = `${signedUrl}#page=${currentPage}&toolbar=0&navpanes=0&view=FitH`;

  return (
    <div className="relative flex flex-col items-center w-full overflow-hidden" style={{ background: P.navyVoid, minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] truncate" style={{ color: P.gold }}>
          TOP 100 · {issue.title}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowContents(true)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" style={{ color: P.cream }} aria-label="Contents">
            <List className="h-4 w-4" />
          </button>
          <button onClick={share} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10" style={{ color: P.cream }} aria-label="Share">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PDF page */}
      <div className="flex flex-1 items-center justify-center w-full py-12 px-4" style={{ minHeight: '100vh' }}>
        <div
          className="relative rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            width: '100%',
            maxWidth: mode === 'single' ? '640px' : '480px',
            aspectRatio: '3/4',
            maxHeight: '85vh',
            opacity: transitioning ? 0.3 : 1,
            transform: transitioning ? 'scale(0.98)' : 'scale(1)',
            border: '1px solid rgba(201,168,124,0.2)',
          }}
        >
          <iframe
            key={currentPage}
            src={pdfUrl}
            title={`Page ${currentPage}`}
            className="w-full h-full"
            style={{ border: 0 }}
          />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-2 shadow-2xl"
          style={{ background: 'rgba(7,15,31,0.92)', border: '1px solid rgba(201,168,124,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
            style={{ color: P.cream }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm tabular-nums px-2" style={{ color: P.cream, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {String(currentPage).padStart(2, '0')}
            <span style={{ color: 'rgba(250,248,245,0.35)' }}> / {String(totalPages).padStart(2, '0')}</span>
          </span>
          <button
            onClick={goNext}
            disabled={currentPage >= totalPages}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => { setCurrentPage(pageNum); setShowContents(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5"
                >
                  <p className="text-sm" style={{ color: P.cream }}>Page {String(pageNum).padStart(2, '0')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, List, X, Share2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';
import { useCinematicPlayback } from '@/components/magazine/useCinematicPlayback';
import { PlayPauseButton, SpeedSelector, PlaybackProgress } from '@/components/magazine/PlaybackControls';

// Responsive single-page reading mode. Shows one page at a time in a
// scrollable, article-style view with chapter navigation. Doubles as a
// passive film: narrated autoplay paces itself by page density.
export default function SinglePageReader({ pages, issue, isPlaying, setIsPlaying, speed, setSpeed }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showContents, setShowContents] = useState(false);
  const totalPages = pages.length;

  const goNext = useCallback(() => setCurrentIdx(i => Math.min(i + 1, totalPages - 1)), [totalPages]);
  const goPrev = useCallback(() => setCurrentIdx(i => Math.max(i - 1, 0)), []);

  // Stop at the end of the publication
  useEffect(() => {
    if (isPlaying && currentIdx >= totalPages - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIdx, totalPages, setIsPlaying]);

  const { progress } = useCinematicPlayback({
    currentPageIndex: currentIdx,
    totalPages,
    goNext,
    pages,
    isPlaying,
    speed,
  });

  const chapterIndex = useMemo(() => {
    return pages
      .map((p, i) => ({ page: p, index: i }))
      .filter(({ page }) => page.layout_type === 'chapter_divider' || page.layout_type === 'cover');
  }, [pages]);

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: P.cream }}>
        <p className="text-sm" style={{ color: 'rgba(30,58,90,0.5)' }}>No pages to display.</p>
      </div>
    );
  }

  const page = pages[currentIdx];

  const share = () => {
    if (navigator.share) navigator.share({ title: issue.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="min-h-screen w-full" style={{ background: P.cream }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3" style={{ background: P.cream, borderBottom: `1px solid rgba(30,58,90,0.08)` }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] truncate flex-1" style={{ color: P.navy }}>
          TOP 100 · {issue.title}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowContents(true)} className="p-2 rounded-full hover:bg-black/5" aria-label="Contents">
            <List className="w-4 h-4" style={{ color: P.navy }} />
          </button>
          <button onClick={share} className="p-2 rounded-full hover:bg-black/5" aria-label="Share">
            <Share2 className="w-4 h-4" style={{ color: P.navy }} />
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div
          className="rounded-2xl overflow-hidden shadow-xl mx-auto transition-all duration-500"
          style={{
            aspectRatio: '3/4',
            maxWidth: '480px',
            background: P.cream,
            border: '1px solid rgba(30,58,90,0.1)',
          }}
          key={currentIdx}
        >
          <PageRenderer page={page} issue={issue} pageNumber={currentIdx + 1} totalPages={totalPages} />
        </div>

        {/* Page navigation */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium transition-all disabled:opacity-30"
            style={{ border: `1px solid rgba(30,58,90,0.15)`, color: P.navy }}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <PlayPauseButton
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying(!isPlaying)}
            disabled={currentIdx >= totalPages - 1}
            theme="light"
          />
          <span className="text-sm font-mono px-1" style={{ color: 'rgba(30,58,90,0.5)', fontFamily: "'Playfair Display', Georgia, serif" }}>
            {String(currentIdx + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
          <SpeedSelector speed={speed} onChange={setSpeed} theme="light" />
          <button
            onClick={goNext}
            disabled={currentIdx === totalPages - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium transition-all disabled:opacity-30"
            style={{ border: `1px solid rgba(30,58,90,0.15)`, color: P.navy }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cinematic progress bar */}
      <PlaybackProgress progress={progress} active={isPlaying} />

      {/* Contents panel */}
      {showContents && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(7,15,31,0.4)' }} onClick={() => setShowContents(false)}>
          <div className="w-full max-w-xs h-full overflow-y-auto p-6" style={{ background: P.cream }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg" style={{ color: P.navy }}>Contents</h3>
              <button onClick={() => setShowContents(false)} className="p-1 rounded-full hover:bg-black/5"><X className="w-4 h-4" style={{ color: P.navy }} /></button>
            </div>
            <div className="space-y-1">
              {chapterIndex.map(({ page, index }) => (
                <button
                  key={page.id || index}
                  onClick={() => { setCurrentIdx(index); setShowContents(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-black/5"
                >
                  <p className="text-sm" style={{ color: P.navy }}>
                    {page.layout_type === 'cover' ? 'Cover' : page.chapter_label || 'Section'}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(30,58,90,0.4)' }}>Page {String(index + 1).padStart(2, '0')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
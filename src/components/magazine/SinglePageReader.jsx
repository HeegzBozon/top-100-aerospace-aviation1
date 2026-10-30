import React, { useState, useMemo, useRef, useCallback } from 'react';
import { List, X, Share2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';
import ReaderModeToggle from '@/components/magazine/ReaderModeToggle';
import PageScrollRail from '@/components/magazine/PageScrollRail';

// Single-page reading mode: every page of the issue set down one under the next as a long
// editorial scroll. On a desk each page keeps the proportion of a printed page — the
// column is wide enough to read at an arm's length, not a phone column in the middle of
// the screen — and the ways to read it sit in the bar at the top rather than over the page.
export default function SinglePageReader({ pages, articles = [], issue, mode, onModeChange }) {
  const [showContents, setShowContents] = useState(false);
  const sectionRefs = useRef([]);
  const totalPages = pages.length;

  const chapterIndex = useMemo(() => {
    return pages
      .map((p, i) => ({ page: p, index: i }))
      .filter(({ page }) =>
        page.layout_type === 'chapter_divider' ||
        page.layout_type === 'cover' ||
        page.layout_type === 'toc'
      );
  }, [pages]);

  const scrollToPage = useCallback((idx) => {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowContents(false);
  }, []);

  const share = () => {
    if (navigator.share) navigator.share({ title: issue.title, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  };

  if (!pages.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: P.cream }}>
        <p className="text-sm" style={{ color: 'rgba(30,58,90,0.5)' }}>No pages to display.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: P.cream }}>
      {/* Head band: the issue, the reading modes, the contents and the link to hand out */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-2.5 sm:px-6"
        style={{ background: P.cream, borderBottom: '1px solid rgba(30,58,90,0.08)' }}
      >
        <span
          className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: P.navy }}
        >
          TOP 100 · {issue.title}
        </span>
        <ReaderModeToggle mode={mode} onChange={onModeChange} onDark={false} />
        <div className="flex items-center gap-0.5">
          <button onClick={() => setShowContents(true)} className="rounded-full p-2 hover:bg-black/5" aria-label="Contents">
            <List className="h-4 w-4" style={{ color: P.navy }} />
          </button>
          <button onClick={share} className="rounded-full p-2 hover:bg-black/5" aria-label="Share">
            <Share2 className="h-4 w-4" style={{ color: P.navy }} />
          </button>
        </div>
      </div>

      {/* The issue, page by page */}
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
        <div className="space-y-10">
          {pages.map((page, idx) => (
            <section
              key={page.id || idx}
              ref={(el) => (sectionRefs.current[idx] = el)}
              className="scroll-mt-16"
            >
              <div
                className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-lg shadow-lg"
                style={{
                  aspectRatio: '5 / 7',
                  maxHeight: '82vh',
                  background: P.cream,
                  border: '1px solid rgba(30,58,90,0.1)',
                }}
              >
                <PageRenderer
                  page={page}
                  issue={issue}
                  articles={articles}
                  pageNumber={idx + 1}
                  totalPages={totalPages}
                />
                {/* The page's own measure, in place of the browser's scroll bar */}
                <PageScrollRail pageKey={page.id || idx} />
              </div>
              {/* The folio, printed under the page the way a spread prints it */}
              <p
                className="mt-3 text-center text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'rgba(30,58,90,0.3)' }}
              >
                {String(idx + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </p>
            </section>
          ))}
        </div>
      </div>

      {/* Contents panel */}
      {showContents && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(7,15,31,0.4)' }} onClick={() => setShowContents(false)}>
          <div className="h-full w-full max-w-xs overflow-y-auto p-6" style={{ background: P.cream }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-lg" style={{ color: P.navy }}>Contents</h3>
              <button onClick={() => setShowContents(false)} className="rounded-full p-1 hover:bg-black/5" aria-label="Close contents">
                <X className="h-4 w-4" style={{ color: P.navy }} />
              </button>
            </div>
            <div className="space-y-1">
              {chapterIndex.map(({ page, index }) => (
                <button
                  key={page.id || index}
                  onClick={() => scrollToPage(index)}
                  className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-black/5"
                >
                  <p className="text-sm" style={{ color: P.navy }}>
                    {page.layout_type === 'cover' ? 'Cover' : page.chapter_label || 'Section'}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(30,58,90,0.4)' }}>Page {String(index + 1).padStart(2, '0')}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
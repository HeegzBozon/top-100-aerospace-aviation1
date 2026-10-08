import React, { useState, useMemo, useRef, useCallback } from 'react';
import { List, X, Share2 } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';

// Single-page reading mode: all pages stacked in one long editorial
// scroll, like the Top100Women2025 publication. Contents panel jumps
// to sections via smooth scroll.
export default function SinglePageReader({ pages, articles = [], issue }) {
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
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: P.cream }}>
        <p className="text-sm" style={{ color: 'rgba(30,58,90,0.5)' }}>No pages to display.</p>
      </div>
    );
  }

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

      {/* Long scroll: all pages stacked vertically */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {pages.map((page, idx) => (
          <section
            key={page.id || idx}
            ref={(el) => (sectionRefs.current[idx] = el)}
            className="scroll-mt-16"
          >
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
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
            </div>
            {/* Page number label between sections */}
            <p className="text-center text-[10px] mt-3 tracking-[0.3em] uppercase" style={{ color: 'rgba(30,58,90,0.3)' }}>
              {String(idx + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
            </p>
          </section>
        ))}
      </div>

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
                  onClick={() => scrollToPage(index)}
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
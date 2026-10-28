import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { LogOut, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, Share2, List, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';
import FlipPage, { PAGE_RATIO } from '@/components/magazine/FlipPage';
import ReaderModeToggle from '@/components/magazine/ReaderModeToggle';
import { useCinematicPlayback } from '@/components/magazine/useCinematicPlayback';
import { PlayPauseButton, SpeedSelector, PlaybackProgress } from '@/components/magazine/PlaybackControls';
import ReadProgressMeter from '@/components/magazine/ReadProgressMeter';
import { clearIssueProgress, readIssueProgress, saveIssueProgress } from '@/lib/readingProgress';

// The open issue on a desk: two pages held wide, turned by hand or rolled as a film.
//
// The spread is measured from the tube it is read in, not from a fixed page size. A desk
// gets a spread the size of the screen — a printed page, not a phone card — with the head
// band above it and the controls in a foot band beneath, so nothing is laid over the page
// being read. A desk always holds two pages wide: one page at a time is the handheld's
// instrument, and the glass reader is where a narrow picture is read.
export default function CinematicFlipbook({
  pages,
  articles = [],
  issue,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  mode,
  onModeChange,
}) {
  const bookRef = useRef(null);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  // Read again arrives with `restart`: the issue opens at its front, whatever place the
  // last pass left it at.
  const restart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('restart');
  // The place is read back where the reader left it, so the issue reopens on the spread
  // they were reading rather than on the cover for the second time.
  const [currentPage, setCurrentPage] = useState(() => {
    if (restart) return 0;
    const place = readIssueProgress(issue?.id)?.page || 0;
    return Math.min(place, Math.max(pages.length - 1, 0));
  });
  const [totalPages, setTotalPages] = useState(pages.length);
  const [showContents, setShowContents] = useState(false);
  const navigate = useNavigate();
  const [frameHeight, setFrameHeight] = useState(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });

  const onFlip = useCallback((e) => setCurrentPage(e.data), []);
  const onInit = useCallback(() => {
    if (bookRef.current?.pageFlip) setTotalPages(bookRef.current.pageFlip().getPageCount());
  }, []);

  const flipPrev = useCallback(() => bookRef.current?.pageFlip()?.flipPrev(), []);
  const flipNext = useCallback(() => bookRef.current?.pageFlip()?.flipNext(), []);

  // The tube is the measure. The machine's menu strip is already at the head of the tube,
  // so the reader claims what is left under it and no more: the picture fits the screen the
  // first time, with no page scroll behind the spread.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const tube = root.closest('.imac-screen');
    const seat = tube?.querySelector('.mb-seat');
    const read = () => {
      if (tube) {
        const bar = seat ? seat.getBoundingClientRect().height : 0;
        setFrameHeight(Math.max(320, tube.clientHeight - bar));
      } else {
        // Read outside a tube (a print view, an embed): the window is the frame.
        setFrameHeight(Math.max(320, window.innerHeight - 120));
      }
    };
    read();
    const observer = new ResizeObserver(read);
    if (tube) observer.observe(tube);
    if (seat) observer.observe(seat);
    window.addEventListener('resize', read);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', read);
    };
  }, []);

  // Then the stage itself, which is what the spread has to fit inside.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const read = () => setStage({ width: el.clientWidth, height: el.clientHeight });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stop at the end of the publication
  useEffect(() => {
    if (isPlaying && currentPage >= totalPages - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentPage, totalPages, setIsPlaying]);

  const { progress } = useCinematicPlayback({
    currentPageIndex: currentPage,
    totalPages,
    goNext: flipNext,
    pages,
    isPlaying,
    speed,
  });

  // The largest spread the stage holds: two pages side by side with margin enough for the
  // turn's shadow, or one page when the stage is too narrow to hold two.
  const dims = useMemo(() => {
    const availW = Math.max(0, stage.width - 72);
    const availH = Math.max(0, stage.height - 8);
    if (availW < 240 || availH < 240) return null;
    const pageW = Math.floor(Math.min(availW / 2, availH / PAGE_RATIO));
    if (pageW < 160) return null;
    return { width: pageW, height: Math.floor(pageW * PAGE_RATIO) };
  }, [stage]);

  const goToPage = useCallback((idx) => {
    const flip = bookRef.current?.pageFlip();
    // A jump of any length — back to the cover, or into another chapter — is a turn to a
    // page, not a walk to it: the book lands on it rather than flicking past the pages in
    // between.
    if (flip?.turnToPage) flip.turnToPage(idx);
    else flip?.flip(idx, 'top');
    setShowContents(false);
  }, []);

  // The spread standing open: the cover alone, then the pair held wide beside it. Both
  // pages of the pair are the page being read, so both roll under the film while it plays
  // — including the right-hand page, which a single index would have left standing still.
  const holdsPage = useCallback(
    (i) => i === currentPage || (currentPage > 0 && i === currentPage + 1),
    [currentPage]
  );

  // Reading it again: this reader's pass on this issue is wiped as the issue opens, so the
  // title screen reads Start again rather than the pass just finished.
  useEffect(() => {
    if (restart && issue?.id) clearIssueProgress(issue.id);
  }, [restart, issue?.id]);

  // The place is written as the page turns, so it always holds. The Save control below is
  // the reader putting the issue down on purpose — nothing has to be pressed for the place
  // to be kept, which is why it is an analogue rather than a requirement.
  useEffect(() => {
    if (!issue?.id || totalPages < 1) return;
    saveIssueProgress(issue.id, { page: currentPage, total: totalPages, title: issue.title });
  }, [issue?.id, issue?.title, currentPage, totalPages]);

  // Putting the issue down on purpose: the place is written and the reader is handed back
  // to the title screen, where the edition key reads Resume.
  const saveAndExit = useCallback(() => {
    saveIssueProgress(issue.id, { page: currentPage, total: totalPages, title: issue.title });
    navigate('/');
  }, [issue.id, issue.title, currentPage, totalPages, navigate]);

  // How much of the issue has gone by — the head band's measure, not the foot's.
  const issuePercent = totalPages > 1
    ? Math.min(100, Math.round((currentPage / (totalPages - 1)) * 100))
    : 0;

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

  // The chapter the open spread stands in: the last one the reader has passed.
  const activeChapter = useMemo(() => {
    let at = -1;
    chapterIndex.forEach((entry, i) => {
      if (entry.index <= currentPage) at = i;
    });
    return at;
  }, [chapterIndex, currentPage]);

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: P.navyVoid }}>
        <p className="text-sm" style={{ color: 'rgba(250,248,245,0.5)' }}>No pages to display.</p>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="relative flex w-full flex-col overflow-hidden"
      style={{ background: P.navyVoid, height: frameHeight ? `${frameHeight}px` : '100%' }}
    >
      {/* Head band: the issue being read, the ways to read it, and the two things a
          reader reaches for — the contents and the link to hand out. */}
      <header
        className="flex flex-none items-center gap-3 px-4 py-2 sm:px-6"
        style={{ background: 'rgba(7,15,31,0.72)', borderBottom: '1px solid rgba(201,168,124,0.18)' }}
      >
        <span
          className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: P.gold }}
        >
          TOP 100 · {issue.title}
        </span>
        <ReadProgressMeter percent={issuePercent} />
        <ReaderModeToggle mode={mode} onChange={onModeChange} />
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowContents(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10"
            style={{ color: P.cream }}
            aria-label="Contents"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={share}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-white/10"
            style={{ color: P.cream }}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* The spread, held in the middle of the stage */}
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {dims && (
          <HTMLFlipBook
            key={`${dims.width}x${dims.height}`}
            ref={bookRef}
            width={dims.width}
            height={dims.height}
            size="stretch"
            minWidth={dims.width}
            maxWidth={dims.width}
            minHeight={dims.height}
            maxHeight={dims.height}
            showCover={true}
            flippingTime={800}
            usePortrait={false}
            autoSize={false}
            maxShadowOpacity={0.5}
            drawShadow={true}
            useMouseEvents={true}
            swipeDistance={30}
            clickEventForward={true}
            onFlip={onFlip}
            onInit={onInit}
            className="mx-auto"
            startPage={currentPage}
            mobileScrollSupport={false}
          >
            {pages.map((page, i) => {
              const open = holdsPage(i);
              return (
                <div key={page.id || i} style={{ height: '100%', overflow: 'hidden' }}>
                  <FlipPage>
                    <PageRenderer
                      page={page}
                      issue={issue}
                      articles={articles}
                      pageNumber={i + 1}
                      totalPages={totalPages}
                      playing={isPlaying && open}
                      autoscroll={open}
                      speed={typeof speed === 'number' ? speed : 1}
                    />
                  </FlipPage>
                </div>
              );
            })}
          </HTMLFlipBook>
        )}
      </div>

      {/* Foot band: the turn and the film, in the machine's own tones */}
      <footer
        className="flex flex-none items-center justify-center gap-1 px-4 py-2"
        style={{ background: 'rgba(7,15,31,0.72)', borderTop: '1px solid rgba(201,168,124,0.18)' }}
      >
        <button
          onClick={() => goToPage(0)}
          disabled={currentPage === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: P.cream }}
          aria-label="Back to the front of the issue"
          title="Back to the front"
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>
        <button
          onClick={flipPrev}
          disabled={currentPage === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: P.cream }}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <PlayPauseButton
          isPlaying={isPlaying}
          onToggle={() => setIsPlaying(!isPlaying)}
          disabled={currentPage >= totalPages - 1}
        />
        <span
          className="px-2 text-sm tabular-nums"
          style={{ color: P.cream, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {String(currentPage + 1).padStart(2, '0')}
          <span style={{ color: 'rgba(250,248,245,0.35)' }}> / {String(totalPages).padStart(2, '0')}</span>
        </span>
        {/* The page's own measure, read beside its number while the film runs */}
        <span className="w-9 text-[10px] font-bold tabular-nums" style={{ color: P.gold }} aria-hidden={!isPlaying}>
          {isPlaying ? `${Math.round(progress * 100)}%` : ''}
        </span>
        <SpeedSelector speed={speed} onChange={setSpeed} />
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: P.cream }}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        {/* The issue by its parts: the chapters, read in one list and stepped into
            whole rather than a page at a time */}
        <button
          onClick={() => setShowContents(true)}
          className="ml-1 flex h-9 items-center gap-1.5 rounded-full px-3 text-[9px] font-bold uppercase tracking-[0.18em] transition-all hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.62)' }}
          aria-label="Chapters"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Chapters</span>
        </button>
        <button
          onClick={saveAndExit}
          className="ml-2 flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-all hover:bg-white/10"
          style={{ color: 'rgba(250,248,245,0.62)' }}
          aria-label="Save my place and leave the issue"
        >
          <LogOut className="h-3.5 w-3.5" />
          Save &amp; Exit
        </button>
      </footer>

      {/* The page's rule, closing the foot of the picture inside the tube */}
      <PlaybackProgress progress={progress} active={isPlaying} />

      {/* Contents panel */}
      {showContents && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(7,15,31,0.6)' }} onClick={() => setShowContents(false)}>
          <div className="h-full w-full max-w-xs overflow-y-auto p-6" style={{ background: P.navy }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-lg" style={{ color: P.cream }}>Chapters</h3>
              <button onClick={() => setShowContents(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Close chapters">
                <X className="h-4 w-4" style={{ color: P.cream }} />
              </button>
            </div>
            <div className="space-y-1">
              {chapterIndex.map(({ page, index }, i) => (
                <button
                  key={page.id || index}
                  onClick={() => goToPage(index)}
                  aria-current={i === activeChapter ? 'true' : undefined}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    i === activeChapter ? 'bg-white/[0.08]' : 'hover:bg-white/5'
                  }`}
                >
                  <p className="text-sm" style={{ color: i === activeChapter ? P.gold : P.cream }}>
                    {page.layout_type === 'cover' ? 'Cover' : page.chapter_label || 'Section'}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: 'rgba(250,248,245,0.4)' }}>
                    {page.chapter_number ? `Chapter ${page.chapter_number} · ` : ''}
                    Page {String(index + 1).padStart(2, '0')}
                  </p>
                </button>
              ))}
              {chapterIndex.length === 0 && (
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(250,248,245,0.45)' }}>
                  This issue carries no chapter marks yet. Turn the pages to read it.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
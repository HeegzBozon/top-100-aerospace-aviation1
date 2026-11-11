import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { LogOut, BookOpen, ChevronLeft, ChevronRight, ChevronsLeft, Share2, List, X, Play, Pause, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';
import FlipPage, { PAGE_RATIO } from '@/components/magazine/FlipPage';
import ReaderModeToggle from '@/components/magazine/ReaderModeToggle';
import PageNotes from '@/components/magazine/comments/PageNotes';
import {
  useCinematicPlayback,
  SKIM_SPEED,
  computePageDwell,
  isTimedSpeed,
  timedSeconds,
  timelineDwells,
} from '@/components/magazine/useCinematicPlayback';
import { PlayPauseButton, SpeedSelector, PlaybackProgress, ReadAlongToggle } from '@/components/magazine/PlaybackControls';
import ReadProgressMeter from '@/components/magazine/ReadProgressMeter';
import PageScrollRail from '@/components/magazine/PageScrollRail';
import { clearIssueProgress, readIssueProgress, saveIssueProgress } from '@/lib/readingProgress';
import { readIssueBookmarks, removeIssueBookmark, toggleIssueBookmark } from '@/lib/issueBookmarks';
import { issuePageUrl, pageFromUrl, writePageToUrl } from '@/components/magazine/issueDeepLink';
import { useToast } from '@/components/ui/use-toast';

// A page carries something to read only if it sets body copy — the same words its dwell is
// reckoned from.
const carriesCopy = (page) =>
  (page?.content_blocks || []).some((block) => block.type === 'body' || block.type === 'pull_quote');

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
  restartFromCover = false,
}) {
  const bookRef = useRef(null);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  // Read again arrives with `restart`: the issue opens at its front, whatever place the
  // last pass left it at — from the title screen's own Start over, or from a link that
  // says so.
  const restart = restartFromCover
    || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('restart'));
  // The place is read back where the reader left it, so the issue reopens on the spread
  // they were reading rather than on the cover for the second time.
  const [currentPage, setCurrentPage] = useState(() => {
    if (restart) return 0;
    // A link that names a page opens on that page; only a link that names none reopens the
    // issue where this reader left it.
    const linked = pageFromUrl({ total: pages.length });
    if (linked !== null) return linked;
    const place = readIssueProgress(issue?.id)?.page || 0;
    return Math.min(place, Math.max(pages.length - 1, 0));
  });
  const [totalPages, setTotalPages] = useState(pages.length);
  const [showContents, setShowContents] = useState(false);
  // The reader's own ribbons: the spreads they have marked to come back to, in the issue's
  // page order. Kept on this machine, and only ever their own.
  const [bookmarks, setBookmarks] = useState(() => readIssueBookmarks(issue?.id));
  const navigate = useNavigate();
  const { toast } = useToast();
  const [frameHeight, setFrameHeight] = useState(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  // The roll belongs to the page, not to the book: a spread can hold one page that runs
  // past its frame and one that does not, and either can be put on hold by itself.
  const [pausedPages, setPausedPages] = useState({});
  const [rollable, setRollable] = useState({});
  // Read along: the page followed word by word at reading pace. The desk still holds two
  // pages wide — a spread is not given up for it — but only one of the two is the page
  // being read, so the words are followed one page at a time and never in two columns.
  const [readAlong, setReadAlong] = useState(false);

  // Switching it on slows a skimmed issue to one and starts the film, because a page turned
  // every second and a half is not a page anyone can follow a word through.
  const toggleReadAlong = useCallback(() => {
    setReadAlong((on) => {
      if (!on) {
        // Neither a skim nor a timed film is a pace a word can be followed at.
        if (speed === SKIM_SPEED || isTimedSpeed(speed)) setSpeed(1);
        setIsPlaying(true);
      }
      return !on;
    });
  }, [speed, setSpeed, setIsPlaying]);

  const reportOverflow = useCallback((key, hasOverflow) => {
    setRollable((prev) => (Boolean(prev[key]) === hasOverflow ? prev : { ...prev, [key]: hasOverflow }));
  }, []);

  const togglePageRoll = useCallback((key) => {
    setPausedPages((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const onFlip = useCallback((e) => setCurrentPage(e.data), []);
  const onInit = useCallback(() => {
    if (bookRef.current?.pageFlip) setTotalPages(bookRef.current.pageFlip().getPageCount());
  }, []);

  const flipPrev = useCallback(() => {
    return bookRef.current?.pageFlip()?.flipPrev();
  }, []);
  const flipNext = useCallback(() => {
    return bookRef.current?.pageFlip()?.flipNext();
  }, []);

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
    readAlong,
  });

  // A timed film turns its pages on its own clock, so a page's roll is scaled to the beat it is
  // actually given rather than to reading pace — the words finish as the page turns.
  const timedDwells = useMemo(
    () => (isTimedSpeed(speed) ? timelineDwells(pages, timedSeconds(speed)) : null),
    [speed, pages],
  );
  const pagePace = useCallback((idx) => {
    const reading = typeof speed === 'number' && speed > 0 ? speed : 1;
    if (readAlong || !timedDwells) return reading;
    return Math.max(1, computePageDwell(pages[idx]) / Math.max(timedDwells[idx] || 1, 1));
  }, [readAlong, speed, timedDwells, pages]);

  // The largest spread the stage holds: two pages side by side with margin enough for the
  // turn's shadow, or one page when the stage is too narrow to hold two.
  const dims = useMemo(() => {
    const availW = Math.max(0, stage.width - 72);
    const availH = Math.max(0, stage.height - 8);
    if (availW < 240 || availH < 240) return null;
    // A desk holds two pages wide: a spread shares the stage between them. A single-plate
    // issue has nothing to share it with.
    const pageW = Math.floor(Math.min(pages.length === 1 ? availW : availW / 2, availH / PAGE_RATIO));
    if (pageW < 160) return null;
    return { width: pageW, height: Math.floor(pageW * PAGE_RATIO) };
  }, [stage, pages.length]);

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

  // Which of the two pages on the desk is the one being read: the page on the left of the
  // spread, or the right when the left is a plate with no copy to follow. One page at a
  // time — the facing page is looked at, exactly as it was before read along was switched on.
  const readAlongPage = useMemo(() => {
    if (!readAlong) return -1;
    if (carriesCopy(pages[currentPage])) return currentPage;
    if (carriesCopy(pages[currentPage + 1])) return currentPage + 1;
    return currentPage;
  }, [readAlong, pages, currentPage]);

  // Read along moves one page. While a page in the spread is being followed, the rest of the
  // spread stands still rather than rolling a second page under the reader: the facing page is
  // looked at, not read, and its roll would pull the eye off the word being followed. Nothing
  // changes when read along is off, or when the spread carries no words to follow.
  const spreadFollowed = readAlong && carriesCopy(pages[readAlongPage]);

  // A skim or a timed run is not a pace a word can be followed at, so choosing one hands the
  // page back to the film: the mark comes off with the pace.
  const chooseSpeed = useCallback((value) => {
    if (value === SKIM_SPEED || isTimedSpeed(value)) setReadAlong(false);
    setSpeed(value);
  }, [setSpeed]);

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

  // The address bar carries the page being read. Nothing is navigated — the entry is
  // rewritten in place — so the link a reader copies out of the browser, and the one the
  // Share control hands over, both open the issue on this page.
  useEffect(() => {
    if (totalPages < 1) return;
    writePageToUrl(currentPage);
  }, [currentPage, totalPages]);

  // Putting the issue down on purpose: the place is written and the reader is handed back
  // to the title screen, where the edition key reads Resume.
  const saveAndExit = useCallback(() => {
    saveIssueProgress(issue.id, { page: currentPage, total: totalPages, title: issue.title });
    navigate('/');
  }, [issue.id, issue.title, currentPage, totalPages, navigate]);

  // What a ribbon is called in the list: the chapter the page stands in, which is how a
  // reader finds their way back to a spread they marked.
  const bookmarkLabel = useCallback((idx) => {
    const page = pages[idx];
    if (page?.chapter_label) return page.chapter_label;
    const chapter = pages.slice(0, idx + 1).reverse().find((entry) => entry.chapter_label);
    return chapter?.chapter_label || (page?.layout_type === 'cover' ? 'Cover' : `Page ${idx + 1}`);
  }, [pages]);

  const markedHere = bookmarks.some((mark) => mark.page === currentPage);

  const toggleBookmark = useCallback(() => {
    if (!issue?.id) return;
    setBookmarks(toggleIssueBookmark(issue.id, { page: currentPage, label: bookmarkLabel(currentPage) }));
  }, [issue?.id, currentPage, bookmarkLabel]);

  const dropBookmark = useCallback((page) => {
    if (!issue?.id) return;
    setBookmarks(removeIssueBookmark(issue.id, page));
  }, [issue?.id]);

  // How much of the issue has gone by — the head band's measure, not the foot's.
  const issuePercent = totalPages > 1
    ? Math.min(100, Math.round((currentPage / (totalPages - 1)) * 100))
    : 0;

  // Handing on the page under the reader: the link names the spread, so whoever opens it
  // arrives at this page of the issue rather than at its cover.
  const share = useCallback(async () => {
    const url = issuePageUrl(currentPage);
    const said = `${bookmarkLabel(currentPage)} · page ${currentPage + 1}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: issue.title, text: said, url });
        return;
      } catch {
        // Dismissed, or no sheet on this machine: it is copied instead.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: `${issue.title} · ${said}` });
    } catch {
      toast({ title: 'Could not copy the link', description: url, variant: 'destructive' });
    }
  }, [currentPage, issue.title, bookmarkLabel, toast]);

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
            aria-label={`Share this page — copy a link that opens page ${currentPage + 1}`}
            title={`Link to page ${currentPage + 1}`}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* The spread, held in the middle of the stage */}
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {dims && (pages.length === 1 && pages[0] ? (
          // A single-plate issue: the one page it carries stands alone at the size of a
          // printed page. An issue of any length is always held two pages wide.
          <div className="relative" style={{ width: dims.width, height: dims.height }}>
            <FlipPage>
              <PageRenderer
                page={pages[currentPage]}
                issue={issue}
                articles={articles}
                pageNumber={currentPage + 1}
                totalPages={totalPages}
                playing={isPlaying}
                autoscroll={!spreadFollowed}
                reading
                readAlong
                pages={pages}
                onGoToPage={goToPage}
                speed={pagePace(currentPage)}
                paused={Boolean(pausedPages[pages[currentPage]?.id || currentPage + 1])}
                progress={isPlaying ? progress : null}
                onOverflow={reportOverflow}
              />
            </FlipPage>
            <PageScrollRail
              pageKey={pages[currentPage]?.id || currentPage + 1}
              tone={pages[currentPage]?.layout_type === 'profile' ? 'night' : 'paper'}
            />
          </div>
        ) : <HTMLFlipBook
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
              const key = page.id || i + 1;
              const paused = Boolean(pausedPages[key]);
              return (
                <div key={page.id || i} className="group relative" style={{ height: '100%', overflow: 'hidden' }}>
                  {/* A marked spread wears its ribbon folded over the corner of the page */}
                  {bookmarks.some((mark) => mark.page === i) && (
                    <span
                      className="pointer-events-none absolute right-0 top-0 z-10"
                      aria-hidden="true"
                      style={{ width: 0, height: 0, borderTop: `20px solid ${P.copper}`, borderLeft: '20px solid transparent' }}
                    />
                  )}
                  <FlipPage>
                    <PageRenderer
                      page={page}
                      issue={issue}
                      articles={articles}
                      pageNumber={i + 1}
                      totalPages={totalPages}
                      playing={isPlaying && open}
                      autoscroll={open && !spreadFollowed}
                      active={open}
                      readAlong={readAlong && i === readAlongPage}
                      pages={pages}
                      onGoToPage={goToPage}
                      speed={pagePace(i)}
                      paused={paused}
                      // The beat of the turn, handed to the page being played: its panels
                      // unfold one at a time rather than arriving as a finished sheet.
                      progress={i === currentPage ? progress : null}
                      onOverflow={reportOverflow}
                    />
                  </FlipPage>
                  {/* The page's own measure at the trim, in place of the browser's scroll bar */}
                  <PageScrollRail
                    pageKey={key}
                    tone={page?.layout_type === 'profile' ? 'night' : 'paper'}
                  />
                  {/* A page long enough to roll wears its own hold, on the page itself and
                      only under a pointer — one per page, so the left and the right of a
                      spread are started and stopped independently. */}
                  {open && rollable[key] && (
                    <button
                      onClick={(event) => { event.stopPropagation(); togglePageRoll(key); }}
                      onMouseDown={(event) => event.stopPropagation()}
                      className={`absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 ${
                        paused ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        background: 'rgba(7,15,31,0.74)',
                        border: `1px solid ${P.gold}66`,
                        color: P.cream,
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                      }}
                      aria-label={paused ? 'Resume this page' : 'Pause this page'}
                      title={paused ? 'Roll this page' : 'Hold this page'}
                    >
                      {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                    </button>
                  )}
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
        <SpeedSelector speed={speed} onChange={chooseSpeed} />
        <ReadAlongToggle on={readAlong} onToggle={toggleReadAlong} />
        <button
          onClick={flipNext}
          disabled={currentPage >= totalPages - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-25"
          style={{ color: P.cream }}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        {/* The ribbon: the spread under the reader, marked so it can be come back to */}
        <button
          onClick={toggleBookmark}
          className="ml-1 flex h-9 items-center gap-1.5 rounded-full px-3 text-[9px] font-bold uppercase tracking-[0.18em] transition-all hover:bg-white/10"
          style={{ color: markedHere ? P.gold : 'rgba(250,248,245,0.62)' }}
          aria-pressed={markedHere}
          aria-label={markedHere ? 'Remove the bookmark on this spread' : 'Bookmark this spread'}
          title={markedHere ? 'Marked' : 'Mark this spread'}
        >
          <Bookmark className="h-4 w-4" fill={markedHere ? P.gold : 'none'} />
          <span className="hidden sm:inline">{markedHere ? 'Marked' : 'Mark'}</span>
        </button>
        {/* The margin of the page under the reader: a private note to the masthead, kept
            with the rest of what a reader keeps for themselves — the mark beside it, the
            chapters after it. */}
        <PageNotes
          issue={issue}
          page={pages[currentPage]}
          articles={articles}
          pageNumber={currentPage + 1}
          marks={bookmarks}
          markedHere={markedHere}
          onToggleMark={toggleBookmark}
          onGoToPage={goToPage}
          onDropMark={dropBookmark}
          onPause={() => setIsPlaying(false)}
        />
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
              <button onClick={() => setShowContents(false)} className="rounded-full p-1 hover:bg-white/10" aria-label="Close contents">
                <X className="h-4 w-4" style={{ color: P.cream }} />
              </button>
            </div>

            {/* The issue's own parts. The reader's ribbons are kept in the margin, with
                their notes, where a spread can be marked and unmarked. */}
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: P.gold }}>
              Chapters
            </p>
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
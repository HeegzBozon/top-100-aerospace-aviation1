import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, List } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { useCinematicPlayback, PLAYBACK_SPEEDS } from '@/components/magazine/useCinematicPlayback';
import { buildIssueContents, buildNameIndex, foldLabel } from '@/components/magazine/glass/glassIssueEntries';
import GlassIssuePage from '@/components/magazine/glass/GlassIssuePage';
import GlassNameIndex from '@/components/magazine/glass/GlassNameIndex';
import useIssueEditMenu from '@/components/magazine/glass/useIssueEditMenu';
import useIssueFileMenu from '@/components/magazine/glass/useIssueFileMenu';

import GlassStudioList from '@/components/magazine/glass/GlassStudioList';
import { clearIssueProgress, saveIssueProgress } from '@/lib/readingProgress';

const getStage = () => document.querySelector('[data-handheld-screen]') || document.querySelector('.hh-stage');

// The register stands at the head of the contents: one press takes the reader out of the
// page-by-page walk and into the issue's own roll of names.
const REGISTER_KEY = 'issue-name-index';

// An issue, read on the glass.
//
// Two levels, and nothing more: the contents, walked on the ring, and one page of
// the issue standing open. Rotation walks the contents; on a page it is left to the
// glass, which scrolls the page — a page is read, not clicked — while back and
// forward on the ring turn to the neighbouring page and A starts or stops the film.
// The index holds the landmarks a reader navigates by, so a hundred-page issue is
// still a short walk, and everything between them is reached by turning.
export default function GlassIssueReader({ issue, pages = [], articles = [], signedUrl, isPlaying, setIsPlaying, speed, setSpeed }) {
  const isPdf = issue.assembly_mode === 'pdf';
  const total = isPdf ? (issue.cover_pdf_page_count || 0) : pages.length;

  const [view, setView] = useState('contents');
  const [position, setPosition] = useState(1);
  const [cursor, setCursor] = useState(0);

  const contents = useMemo(() => {
    if (isPdf) {
      return Array.from({ length: total }, (_, i) => ({
        key: `pdf-${i + 1}`,
        position: i + 1,
        label: `Page ${String(i + 1).padStart(2, '0')}`,
        hint: '',
      }));
    }
    return buildIssueContents(pages);
  }, [isPdf, total, pages]);

  // The register of names: the issue's own honorees, numbered as they stand in it, read
  // from the portraits the issue already carries.
  const nameIndex = useMemo(() => (isPdf ? [] : buildNameIndex(pages, articles)), [isPdf, pages, articles]);

  // Read again opens the issue at its front with this reader's pass on it wiped, so the
  // title screen reads Start again rather than the pass just finished.
  useEffect(() => {
    if (issue?.id && new URLSearchParams(window.location.search).has('restart')) {
      clearIssueProgress(issue.id);
    }
  }, [issue?.id]);

  // The place is kept as the page turns, on the glass as on the desk, so the title screen
  // reports one reading whichever machine it was read on.
  useEffect(() => {
    if (!issue?.id || total < 1) return;
    saveIssueProgress(issue.id, { page: position - 1, total, title: issue.title });
  }, [issue?.id, issue?.title, position, total]);

  // What has been opened in this sitting. Kept on the glass and nowhere else: it is the
  // record of one reading, not a property of the issue.
  const [read, setRead] = useState(() => new Set());

  // What the ring walks: the register at the head of the contents, then the issue's own
  // landmarks. One list, so a turn or a press means the same thing in either.
  const listRows = useMemo(() => {
    const register = nameIndex.length
      ? [{
        key: REGISTER_KEY,
        isRegister: true,
        position: null,
        label: 'Index of Names',
        hint: `${nameIndex.length} names`,
      }]
      : [];
    return register.concat(contents);
  }, [contents, nameIndex.length]);

  const openPage = pages[position - 1] || null;
  const fold = foldLabel(openPage, position, total);

  // The section ahead: the next landmark after the page standing open. A reader walks a
  // hundred-page issue by its parts, so the way on to the next one is a single press.
  const nextSection = useMemo(
    () => (isPdf ? null : contents.find((entry) => entry.position > position) || null),
    [contents, isPdf, position],
  );

  // The film: paced by the page it is holding, and it stops at the colophon. The turn
  // reads the standing page off the ref, because the console's own hands hold this
  // function long after the render that made it.
  // What the page's own roll is written into: the well the page opens for its own
  // length (see pageTeleprompter). One page stands on the glass at a time, so the ring
  // reads it by the mark the page already carries rather than threading a ref down.
  const pageScroller = () => getStage()?.querySelector('[data-page-scroll]');

  // One detent's worth of the page under the ring, and whether it moved at all. A page
  // with nothing to roll — a cover, a full-bleed spread — says so at once.
  const rollPage = (direction) => {
    const el = pageScroller();
    if (!el || el.scrollHeight <= el.clientHeight + 4) return false;
    const before = el.scrollTop;
    el.scrollTop = before + direction * 48;
    return el.scrollTop !== before;
  };

  const turn = (direction, atFoot = false) => {
    const next = positionRef.current + direction;
    if (next < 1 || next > total) return null;
    setPosition(next);
    // Entered from below, a page opens at its foot, so the reading carries on the way the
    // reader was walking instead of starting the page over.
    if (atFoot) {
      requestAnimationFrame(() => {
        const el = pageScroller();
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
    return isPdf ? `Page ${String(next).padStart(2, '0')}` : foldLabel(pages[next - 1], next, total);
  };

  const { progress } = useCinematicPlayback({
    currentPageIndex: position - 1,
    totalPages: total,
    goNext: () => { turn(1); },
    pages,
    isPlaying,
    speed,
  });

  useEffect(() => {
    if (isPlaying && position >= total) setIsPlaying(false);
  }, [isPlaying, position, total, setIsPlaying]);

  const openAt = (target) => {
    if (target < 1 || target > total) return;
    setIsPlaying(false);
    setPosition(target);
    setView('page');
    setRead((prev) => (prev.has(target) ? prev : new Set(prev).add(target)));
  };

  // Into the register, and out of it on to the page the name stands on.
  const openRegister = () => {
    setIsPlaying(false);
    setCursor(0);
    setView('index');
  };

  const openName = (entry) => openAt(entry.position);

  // The issue's own File menu: the honoree the reader has turned to can be followed or
  // connected to their rolodex, her profile shared or taken away as a sheet, and the issue
  // itself handed out or downloaded as a PDF. It is registered with the machine for as long
  // as this reader stands open, and reports in the glass through the panel it hands back.
  const fileMenu = useIssueFileMenu({
    issue,
    pages,
    articles,
    nameIndex,
    position,
    onOpenRegister: openRegister,
    onBusy: () => setIsPlaying(false),
  });

  // The issue's own Edit menu: the article the reader is standing on can be answered — a
  // note to the masthead about what they have just read, or a correction proposed against
  // it. Both are filed against the page under the ring, read by the masthead, and never
  // printed into the issue by being filed.
  const editMenu = useIssueEditMenu({
    issue,
    pages,
    articles,
    position,
    onBusy: () => setIsPlaying(false),
  });

  // Whatever the menus are reporting stands over the issue, on every level of the reader.
  const withPanel = (content) => (
    <>
      {content}
      {fileMenu.panel}
      {editMenu.panel}
    </>
  );

  // Refs, because the console's hands read the surface as it stands now rather than
  // as it was when the picker was registered.
  const viewRef = useRef(view);
  viewRef.current = view;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const positionRef = useRef(position);
  positionRef.current = position;
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const listRef = useRef(listRows);
  listRef.current = listRows;
  const foldRef = useRef(fold);
  foldRef.current = fold;

  const land = (target) => {
    const list = listRef.current;
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => (viewRef.current === 'page'
        ? [foldRef.current]
        : listRef.current.map((entry) => entry.label)),
      index: () => (viewRef.current === 'page' ? 0 : cursorRef.current),
      // Rotation walks the contents. On a page it rolls the page under the ring, and the
      // roll carries on: past the foot of one page the turn is handed to the next, past
      // the head of it to the one before. So the wheel alone reads the issue through a
      // page at a time — while ◀▶ still steps between pages and the contents are the
      // sections, walked on the same ring.
      step: (direction) => {
        if (viewRef.current !== 'page') return land(cursorRef.current + direction);
        if (rollPage(direction)) return true;
        return turn(direction, direction < 0);
      },
      // Back and forward on the ring turn the pages.
      page: (direction) => {
        if (viewRef.current === 'page') return turn(direction);
        return land(cursorRef.current + direction);
      },
      goTo: (index) => (viewRef.current === 'page' ? null : land(index)),
      enter: () => {
        if (viewRef.current === 'page') {
          setIsPlaying(!playingRef.current);
          return true;
        }
        const entry = listRef.current[cursorRef.current];
        if (!entry) return false;
        if (entry.isRegister) {
          openRegister();
          return true;
        }
        openAt(entry.position);
        return true;
      },
      back: () => {
        if (viewRef.current === 'page' || viewRef.current === 'index') {
          setView('contents');
          return true;
        }
        return false;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [view, cursor, position, isPlaying, total, nameIndex.length]);

  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [view, position]);

  if (view === 'page') {
    return withPanel(
      <GlassIssuePage
        issue={issue}
        page={openPage}
        pdf={isPdf}
        signedUrl={signedUrl}
        articles={articles}
        position={position}
        total={total}
        playing={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speed={speed}
        onCycleSpeed={() => {
          const i = PLAYBACK_SPEEDS.indexOf(speed);
          setSpeed(PLAYBACK_SPEEDS[(i + 1) % PLAYBACK_SPEEDS.length]);
        }}
        progress={progress}
        onTurn={turn}
        onJumpSection={() => {
          if (nextSection) setPosition(nextSection.position);
        }}
        nextSection={nextSection}
        onBack={() => setView('contents')}
      />,
    );
  }

  if (view === 'index') {
    return withPanel(
      <GlassNameIndex
        entries={nameIndex}
        read={read}
        onOpen={openName}
        onBack={() => setView('contents')}
      />,
    );
  }

  return withPanel(
    <GlassStudioList
      kicker={isPdf ? 'Pages' : 'Contents'}
      hint="◀▶ Walk · A Read"
      note={(
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.42)' }}>
              {issue.title}
            </span>
            <span className="text-[10px]" style={{ color: P.navy }}>
              {total} {total === 1 ? 'page' : 'pages'}
            </span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
            {isPdf
              ? 'The finished issue, turned page by page. Open a page to read it on the glass.'
              : 'Open a page to read it whole. Turning takes you through the issue as it prints.'}
          </p>
        </div>
      )}
      entries={listRows.map((entry) => ({
        key: entry.key,
        label: entry.label,
        hint: entry.hint,
        icon: entry.isRegister ? List : BookOpen,
        tone: entry.isRegister ? 'action' : undefined,
      }))}
      cursor={cursor}
      onOpen={(i, entry) => {
        setCursor(i);
        if (entry.key === REGISTER_KEY) openRegister();
        else openAt(entry.position);
      }}
      empty={(
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          {total ? 'Nothing here yet.' : 'This issue has no pages.'}
        </p>
      )}
    />,
  );
}
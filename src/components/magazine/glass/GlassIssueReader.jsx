import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { useCinematicPlayback, PLAYBACK_SPEEDS } from '@/components/magazine/useCinematicPlayback';
import { buildIssueContents, foldLabel } from '@/components/magazine/glass/glassIssueEntries';
import GlassIssuePage from '@/components/magazine/glass/GlassIssuePage';

import GlassStudioList from '@/components/magazine/glass/GlassStudioList';

const getStage = () => document.querySelector('[data-handheld-screen]') || document.querySelector('.hh-stage');

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

  const openPage = pages[position - 1] || null;
  const fold = foldLabel(openPage, position, total);

  // The film: paced by the page it is holding, and it stops at the colophon. The turn
  // reads the standing page off the ref, because the console's own hands hold this
  // function long after the render that made it.
  const turn = (direction) => {
    const next = positionRef.current + direction;
    if (next < 1 || next > total) return null;
    setPosition(next);
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
  };

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
  const contentsRef = useRef(contents);
  contentsRef.current = contents;
  const foldRef = useRef(fold);
  foldRef.current = fold;

  const land = (target) => {
    const list = contentsRef.current;
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  };

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => (viewRef.current === 'page'
        ? [foldRef.current]
        : contentsRef.current.map((entry) => entry.label)),
      index: () => (viewRef.current === 'page' ? 0 : cursorRef.current),
      // Rotation walks the contents. On a page it declines, so the glass takes the
      // turn and scrolls the page under the thumb.
      step: (direction) => {
        if (viewRef.current === 'page') return null;
        return land(cursorRef.current + direction);
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
        const entry = contentsRef.current[cursorRef.current];
        if (!entry) return false;
        openAt(entry.position);
        return true;
      },
      back: () => {
        if (viewRef.current === 'page') {
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
  }, [view, cursor, position, isPlaying, total]);

  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [view, position]);

  if (view === 'page') {
    return (
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
        onBack={() => setView('contents')}
      />
    );
  }

  return (
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
      entries={contents.map((entry) => ({
        key: entry.key,
        label: entry.label,
        hint: entry.hint,
        icon: BookOpen,
      }))}
      cursor={cursor}
      onOpen={(i, entry) => { setCursor(i); openAt(entry.position); }}
      empty={(
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.6)' }}>
          {total ? 'Nothing here yet.' : 'This issue has no pages.'}
        </p>
      )}
    />
  );
}
import { useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import usePageComments from '@/components/magazine/comments/usePageComments';
import PageNotesPanel from '@/components/magazine/comments/PageNotesPanel';

// The margin of the page being read.
//
// One key in the head band opens the reader's own margin, which holds both things they
// keep for themselves: the notes written to the masthead, and the ribbons they have
// folded over spreads to come back to. The film is put on hold as it opens — nobody
// writes a note while the page is turning away from them.
function resolvePageLabel(page, articles, pageNumber) {
  if (!page) return `Page ${pageNumber}`;
  const heading = (page.content_blocks || []).find((block) => block.type === 'heading' && block.text);
  const article = page.article_id ? (articles || []).find((a) => a.id === page.article_id) : null;
  return page.chapter_label || heading?.text || article?.title || `Page ${pageNumber}`;
}

export default function PageNotes({
  issue,
  page,
  articles = [],
  pageNumber,
  marks = [],
  markedHere = false,
  onToggleMark,
  onGoToPage,
  onDropMark,
  onPause,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('notes');
  const pageLabel = useMemo(
    () => resolvePageLabel(page, articles, pageNumber),
    [page, articles, pageNumber],
  );
  const notes = usePageComments({
    issue,
    page,
    pageNumber,
    pageLabel,
    active: open,
  });

  const openMargin = () => {
    onPause?.();
    setOpen(true);
  };

  const jumpTo = (idx) => {
    onGoToPage?.(idx);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={openMargin}
        className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-all hover:bg-white/10"
        style={{ color: 'rgba(250,248,245,0.72)' }}
        aria-expanded={open}
        aria-label={`Your margin on page ${pageNumber}`}
        title="Your margin — notes and marks on this page"
      >
        <MessageSquare className="h-4 w-4" style={{ color: P.gold }} />
        <span className="hidden sm:inline">Notes</span>
      </button>

      {open && (
        <PageNotesPanel
          onClose={() => setOpen(false)}
          issue={issue}
          pageNumber={pageNumber}
          pageLabel={pageLabel}
          notes={notes}
          tab={tab}
          onTab={setTab}
          marks={marks}
          markedHere={markedHere}
          onToggleMark={onToggleMark}
          onGoTo={jumpTo}
          onDropMark={onDropMark}
        />
      )}
    </>
  );
}
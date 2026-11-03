import { useMemo, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import usePageComments from '@/components/magazine/comments/usePageComments';
import PageNotesPanel from '@/components/magazine/comments/PageNotesPanel';

// The margin of the page being read.
//
// A discreet key in the head band — a note icon and the word — that opens the reader's
// private desk on this page. Nothing on the page itself moves, and nothing here tells
// anyone else the page was read.
function resolvePageLabel(page, articles, pageNumber) {
  if (!page) return `Page ${pageNumber}`;
  const heading = (page.content_blocks || []).find((block) => block.type === 'heading' && block.text);
  const article = page.article_id ? (articles || []).find((a) => a.id === page.article_id) : null;
  return page.chapter_label || heading?.text || article?.title || `Page ${pageNumber}`;
}

export default function PageNotes({ issue, page, articles = [], pageNumber }) {
  const [open, setOpen] = useState(false);
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-all hover:bg-white/10"
        style={{ color: 'rgba(250,248,245,0.72)' }}
        aria-expanded={open}
        aria-label={`Notes on page ${pageNumber}`}
        title="Notes on this page — private to you and the masthead"
      >
        <MessageSquare className="h-4 w-4" style={{ color: P.gold }} />
        <span className="hidden lg:inline">Notes</span>
      </button>

      {open && (
        <PageNotesPanel
          onClose={() => setOpen(false)}
          issue={issue}
          pageNumber={pageNumber}
          pageLabel={pageLabel}
          notes={notes}
        />
      )}
    </>
  );
}
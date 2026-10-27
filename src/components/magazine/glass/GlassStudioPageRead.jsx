import { ChevronLeft } from 'lucide-react';
import { MAGAZINE_PALETTE as P, layoutLabel } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';

// A page of the issue, read whole on the glass — the reader's own rendering, one page
// at a time. The ring scrolls the page rather than walking anything: back and forward
// on the ring turn to the neighbouring page, which is how the issue is proved before
// it is published.
export default function GlassStudioPageRead({ page, issue, articles, pageNumber, totalPages, onTurn, onBack }) {
  const canPrev = pageNumber > 1;
  const canNext = pageNumber < totalPages;

  return (
    <div className="hh-slide-window flex flex-col px-3 pb-2 pt-3">
      <div className="flex items-center justify-between gap-3 pb-2">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: P.navy }}>
          <ChevronLeft className="h-3 w-3" /> Pages
        </button>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: P.copper }}>
          {layoutLabel(page.layout_type)}
        </p>
        <p className="font-mono text-[9px]" style={{ color: 'rgba(30,58,90,0.45)' }}>
          {String(pageNumber).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl" style={{ background: P.cream, border: '1px solid rgba(30,58,90,0.12)' }}>
        <PageRenderer page={page} issue={issue} articles={articles} pageNumber={pageNumber} totalPages={totalPages} />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button type="button" disabled={!canPrev} onClick={() => onTurn(-1)} className="text-[8.5px] font-bold uppercase tracking-[0.16em] disabled:opacity-30" style={{ color: P.navy }}>
          ◀ Previous
        </button>
        <p className="text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
          ◀▶ Turn · B Back
        </p>
        <button type="button" disabled={!canNext} onClick={() => onTurn(1)} className="text-[8.5px] font-bold uppercase tracking-[0.16em] disabled:opacity-30" style={{ color: P.navy }}>
          Next ▶
        </button>
      </div>
    </div>
  );
}
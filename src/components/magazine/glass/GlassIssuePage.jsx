import { BookOpen, ChevronLeft, Gauge, Loader2, Pause, Play } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import PageRenderer from '@/components/magazine/PageRenderer';
import { foldLabel } from '@/components/magazine/glass/glassIssueEntries';

// One page of an issue, read on the glass.
//
// The page is the picture: the magazine's own rendering fills the well, and the
// chrome around it is the console's — the way back to the contents, the fold, the
// film controls, and a rule that fills as the page is held. Ring rotation is left
// to the glass, which scrolls the page; back and forward on the ring turn to the
// neighbouring page, and A starts or stops the film.
export default function GlassIssuePage({
  issue,
  page,
  pdf = false,
  signedUrl,
  articles = [],
  position,
  total,
  playing,
  onTogglePlay,
  speed,
  onCycleSpeed,
  progress,
  onTurn,
  onBack,
}) {
  const canPrev = position > 1;
  const canNext = position < total;
  const fold = foldLabel(page, position, total);

  return (
    <div className="hh-slide-window flex flex-col px-3 pb-2 pt-3">
      {/* The issue's own band: where this page sits, and the way back to the contents */}
      <div className="flex items-center justify-between gap-2 pb-2" style={{ borderBottom: '1px solid rgba(30,58,90,0.12)' }}>
        <button
          type="button"
          onClick={onBack}
          className="flex flex-none items-center gap-0.5 text-[8.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: P.navy }}
        >
          <ChevronLeft className="h-3 w-3" /> Contents
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[8.5px] font-bold uppercase tracking-[0.22em]" style={{ color: P.copper }}>
          {issue.title}
        </p>
        <p className="flex-none font-mono text-[9px] tabular-nums" style={{ color: 'rgba(30,58,90,0.5)' }}>
          {fold}
        </p>
      </div>

      {/* The film's progress across the page being held */}
      <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full" style={{ background: 'rgba(30,58,90,0.10)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${playing ? Math.min((progress || 0) * 100, 100) : 0}%`,
            background: `linear-gradient(90deg, ${P.gold}, ${P.copper})`,
            transition: 'width 120ms linear',
          }}
        />
      </div>

      {/* The page itself */}
      <div
        className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-2xl"
        style={{ background: P.cream, border: '1px solid rgba(30,58,90,0.12)' }}
      >
        {pdf && !signedUrl ? (
          <div className="flex h-full items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: P.copper }} />
          </div>
        ) : signedUrl ? (
          <iframe
            key={position}
            src={`${signedUrl}#page=${position}&toolbar=0&navpanes=0&view=FitH`}
            title={`Page ${position}`}
            className="h-full w-full"
            style={{ border: 0 }}
          />
        ) : page ? (
          <PageRenderer page={page} issue={issue} articles={articles} pageNumber={position} totalPages={total} />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="text-[11px]" style={{ color: 'rgba(30,58,90,0.6)' }}>
              This page is not in the issue any longer.
            </p>
          </div>
        )}
      </div>

      {/* The controls: turning, and the film */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onTurn(-1)}
          className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[8.5px] font-bold uppercase tracking-[0.14em] disabled:opacity-30"
          style={{ color: P.navy, border: '1px solid rgba(30,58,90,0.16)' }}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!canNext && !playing}
          className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[8.5px] font-bold uppercase tracking-[0.14em] disabled:opacity-30"
          style={{ background: playing ? P.copper : P.navy, color: P.cream }}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play as film'}
        </button>

        <button
          type="button"
          onClick={onCycleSpeed}
          className="flex h-8 items-center gap-1 rounded-full px-2.5 font-mono text-[9px] tabular-nums"
          style={{ color: P.navy, border: '1px solid rgba(30,58,90,0.16)' }}
        >
          <Gauge className="h-3.5 w-3.5" /> {speed}×
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onTurn(1)}
          className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[8.5px] font-bold uppercase tracking-[0.14em] disabled:opacity-30"
          style={{ color: P.navy, border: '1px solid rgba(30,58,90,0.16)' }}
        >
          Next <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>

      <p className="pt-1.5 text-center text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
        <BookOpen className="mr-1 inline h-3 w-3 align-[-2px]" />
        ◀▶ Turn · A Play · B Contents
      </p>
    </div>
  );
}
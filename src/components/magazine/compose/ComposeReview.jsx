import { ArrowRight, BookOpen, RotateCcw, Send } from 'lucide-react';
import { COMPOSE_STEPS, isStepDone } from './composeConfig';
import IssueScorecard from '@/components/magazine/review/IssueScorecard';

// The lap, read back.
//
// The issue as it now stands, line by line, with the ones still blank marked plainly.
// Each line is a way back into its prompt, so a writer can take one again without
// walking the whole lap, and the way out is either the classic editor or the
// Preview & Publish surface the house already reviews in.

const rows = (values) => [
  { key: 'direction', label: 'The direction', value: values.direction, long: true },
  { key: 'title', label: 'The name', value: values.title },
  { key: 'subtitle', label: 'The line under it', value: values.subtitle },
  { key: 'cover_kicker', label: 'The cover kicker', value: values.cover_kicker },
  {
    key: 'sections',
    label: 'The blueprint',
    value: (values.sections || []).length
      ? `${values.sections.length} sections · ${values.sections.map((s) => s.name).slice(0, 4).join(' · ')}${
          values.sections.length > 4 ? ' …' : ''
        }`
      : '',
  },
  { key: 'preface', label: 'The letter', value: values.preface, long: true },
  { key: 'colophon', label: 'Ad Astra', value: values.colophon, long: true },
];

export default function ComposeReview({ values, issue, standard, articles, onJump, onOpenClassic, onPublish, onAnotherLap }) {
  const written = COMPOSE_STEPS.filter((step) => step.kind !== 'review' && isStepDone(values, step)).length;
  const total = COMPOSE_STEPS.filter((step) => step.kind !== 'review').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-editorial-copper pb-3">
        <h2 className="font-heading text-[26px] leading-tight text-editorial-navy sm:text-[34px]">
          {values.title || 'An untitled issue'}
        </h2>
        <p className="font-body text-[10px] uppercase tracking-[0.22em] text-editorial-label">
          {written} of {total} written
        </p>
      </div>

      <dl className="mt-1 divide-y divide-editorial-navy/10">
        {rows(values).map((row) => {
          const blank = !String(row.value || '').trim();
          return (
            <div key={row.key} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <dt className="w-40 font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-navy/45">
                {row.label}
              </dt>
              <dd
                className={`min-w-0 flex-1 font-body text-[13px] leading-6 ${
                  blank ? 'font-heading italic text-editorial-copper' : 'text-editorial-navy'
                }`}
              >
                {blank ? 'Not written yet' : row.long ? `${String(row.value).slice(0, 220)}${String(row.value).length > 220 ? '…' : ''}` : row.value}
              </dd>
              <button
                type="button"
                onClick={() => onJump(row.key)}
                className="inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-navy/40 hover:text-editorial-copper"
              >
                Take again <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={onPublish}
          className="inline-flex items-center gap-2 bg-editorial-navy px-4 py-2.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-cream transition-opacity hover:opacity-85"
        >
          <Send className="h-3.5 w-3.5" /> Preview &amp; Publish
        </button>
        <button
          type="button"
          onClick={onOpenClassic}
          className="inline-flex items-center gap-2 border-b border-editorial-navy/30 pb-0.5 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy hover:border-editorial-copper"
        >
          <BookOpen className="h-3.5 w-3.5" /> Open the classic editor
        </button>
        <button
          type="button"
          onClick={onAnotherLap}
          className="inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-navy/50 hover:text-editorial-copper"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Take another lap
        </button>
      </div>

      {/* The reading, at the end of the lap where a book is read: six measures, on
          demand, so the last thing before the press is an editor's eye on it. */}
      <IssueScorecard issue={issue} standard={standard} articles={articles} />
    </div>
  );
}
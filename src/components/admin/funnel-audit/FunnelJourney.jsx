import { ArrowRight, DoorOpen, Radio, Sparkles, UserCheck } from 'lucide-react';
import { NURTURE_TONE, STAGE_TONE } from './auditTones';

// ONE JOURNEY, READ RUNG BY RUNG.
//
// The door it opens from, the rungs a reader walks, the instrument on each rung, and who
// speaks to the person afterwards. A rung with no instrument is drawn, never hidden: the
// empty ones are the audit.
export default function FunnelJourney({ funnel, evidence, evidenceState, evidenceError, onRetry }) {
  const stages = funnel.stages;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-xl text-editorial-cream">{funnel.name}</h3>
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-editorial-gold">{funnel.house}</span>
        </div>
        <p className="mt-1.5 max-w-2xl font-body text-xs leading-6 text-[#a3b8c9]">{funnel.gist}</p>
      </div>

      <div>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">The doors</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {funnel.doors.map((door) => (
            <li
              key={door}
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/12 bg-white/[0.04] px-2 py-1 font-body text-[10px] text-editorial-cream"
            >
              <DoorOpen className="h-3 w-3 flex-none text-editorial-copper" aria-hidden="true" />
              {door}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
            The rungs, and the instrument on each
          </p>
          <p className="font-body text-[10px] uppercase tracking-[0.16em] text-[#7d97ad]">
            {stages.filter((s) => s.status === 'recorded').length} of {stages.length} recorded
          </p>
        </div>

        <ol className="mt-3 space-y-1.5">
          {stages.map((stage, index) => {
            const tone = STAGE_TONE[stage.status];
            return (
              <li
                key={`${stage.label}-${index}`}
                className="rounded-md border border-white/8 bg-white/[0.025] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="w-4 flex-none font-body text-[10px] tabular-nums text-editorial-copper">{index + 1}</span>
                  <span className={`h-1.5 w-1.5 flex-none rounded-full ${tone.mark}`} aria-hidden="true" />
                  <span className="min-w-[9rem] flex-none font-body text-xs font-semibold text-editorial-cream">{stage.label}</span>
                  <span className={tone.chip}>{tone.label}</span>
                  <code className="flex-1 truncate font-body text-[10px] tracking-[0.03em] text-[#a3b8c9]">{stage.mark}</code>
                </div>
                {stage.note ? (
                  <p className="mt-1 pl-[2.1rem] font-body text-[11px] leading-5 text-[#8ea7bd]">{stage.note}</p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
          Who speaks to the person afterwards
        </p>
        <ul className="mt-2 divide-y divide-white/[0.07]">
          {funnel.nurture.map((row) => {
            const tone = NURTURE_TONE[row.status];
            return (
              <li key={row.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                <UserCheck className="h-3.5 w-3.5 flex-none text-editorial-copper" aria-hidden="true" />
                <span className="min-w-[11rem] flex-1 font-body text-xs text-editorial-cream">{row.label}</span>
                <span className="font-body text-[11px] text-[#8ea7bd]">{row.mechanism}</span>
                <span className={tone.chip}>{tone.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">Where it is kept</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {funnel.records.map((record) => (
            <li
              key={record}
              className="rounded-sm border border-editorial-copper/35 bg-editorial-copper/8 px-2 py-1 font-body text-[10px] text-[#d8c3ab]"
            >
              {record}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-editorial-copper/35 bg-editorial-copper/8 p-4">
        <p className="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-gold">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> The gap, in one line
        </p>
        <p className="mt-1.5 font-body text-xs leading-6 text-editorial-cream">{funnel.gap}</p>
      </div>

      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
            <Radio className="h-3 w-3" aria-hidden="true" /> Live reading
          </p>
          {evidenceState === 'ready' ? (
            <button type="button" onClick={onRetry} className="font-body text-[10px] uppercase tracking-[0.16em] text-[#8ea7bd] hover:text-editorial-cream">
              Re-read
            </button>
          ) : null}
        </div>

        {evidenceState === 'loading' ? (
          <p className="mt-2 font-body text-xs text-[#a3b8c9]">Reading the ledger…</p>
        ) : evidenceState === 'error' ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-md border border-[#f2a1a1]/35 bg-[#f2a1a1]/8 px-3 py-2.5">
            <p className="flex-1 font-body text-xs text-[#f2a1a1]">
              The live reading failed. {evidenceError || 'The counters could not be read.'}
            </p>
            <button type="button" onClick={onRetry} className="desk-key">
              Try again
            </button>
          </div>
        ) : evidenceState === 'ready' && evidence?.length ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {evidence.map((metric) => (
              <div key={metric.key} className="desk-face px-3 py-3">
                <p className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-label">{metric.label}</p>
                <p className="mt-1 font-heading text-xl text-editorial-navy">
                  {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                </p>
                {metric.note ? (
                  <p className="mt-0.5 font-body text-[10px] leading-4 text-editorial-navy/60">{metric.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : evidenceState === 'ready' ? (
          <p className="mt-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 font-body text-xs leading-6 text-[#a3b8c9]">
            No live counter is defined for this journey. What it holds is read from the record type itself.
          </p>
        ) : null}
      </div>

      <p className="flex items-center gap-1.5 font-body text-[10px] leading-5 text-[#7d97ad]">
        <ArrowRight className="h-3 w-3 flex-none" aria-hidden="true" />
        Nothing on this journey feeds discovery, measurement or influence. Opening a journey changes nothing.
      </p>
    </div>
  );
}
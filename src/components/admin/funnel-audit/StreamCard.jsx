import { ArrowRight, CalendarClock, ShieldCheck, Waypoints } from 'lucide-react';
import { FUNNELS } from './funnelRegistry';
import { findingsOfStream } from './valueStreams';
import { SEVERITY_TONE } from './auditTones';

const funnelById = (id) => FUNNELS.find((funnel) => funnel.id === id);

// One stream: the journey it answers for, the live count at each door, and the findings on
// its own work. The count is a reading, never a target.
export default function StreamCard({ stream, evidence, evidenceState, onOpenFunnel }) {
  const findings = findingsOfStream(stream.id);
  const shown = findings.slice(0, 3);

  const headline = (funnel) => {
    if (evidenceState !== 'ready' || !evidence) return null;
    const metrics = evidence[funnel.id] || [];
    const wanted = funnel.evidence?.[0];
    return metrics.find((metric) => metric.key === wanted) || metrics[0] || null;
  };

  const readout = (funnel) => {
    const metric = headline(funnel);
    if (!metric) return 'not read';
    return typeof metric.value === 'number'
      ? `${metric.value.toLocaleString()} ${metric.label.toLowerCase()}`
      : 'not read';
  };

  return (
    <article className="desk-plate flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <Waypoints className="h-3.5 w-3.5 text-editorial-gold" aria-hidden="true" />
            <h3 className="font-heading text-lg text-editorial-cream">{stream.name}</h3>
          </div>
          <p className="mt-0.5 font-body text-[9px] uppercase tracking-[0.16em] text-[#7d97ad]">
            {stream.house}
          </p>
        </div>
        <span className="flex-none rounded-sm border border-editorial-gold/30 bg-editorial-gold/10 px-1.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-gold">
          {findings.length === 1 ? '1 finding' : `${findings.length} findings`}
        </span>
      </div>

      <p className="mt-2.5 font-body text-[11px] leading-5 text-[#c4d2de]">{stream.objective}</p>

      <div className="mt-3 space-y-1">
        {stream.funnels.map((id) => {
          const funnel = funnelById(id);
          if (!funnel) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpenFunnel(id)}
              className="flex w-full items-center justify-between gap-2 rounded-sm border border-white/8 bg-white/[0.02] px-2 py-1.5 text-left transition-colors hover:border-editorial-gold/40 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-gold/60"
            >
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-cream/90">
                {funnel.name}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-body text-[10px] tabular-nums text-[#a3b8c9]">
                  {readout(funnel)}
                </span>
                <ArrowRight className="h-3 w-3 text-[#7d97ad]" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>

      {shown.length ? (
        <ul className="mt-3 space-y-1.5">
          {shown.map((finding) => {
            const tone = SEVERITY_TONE[finding.severity];
            return (
              <li key={finding.id} className="flex items-start gap-2">
                <span className={`${tone.chip} flex-none`}>{tone.label}</span>
                <span className="font-body text-[10px] leading-4 text-[#c4d2de]">{finding.title}</span>
              </li>
            );
          })}
          {findings.length > shown.length ? (
            <li className="font-body text-[9px] uppercase tracking-[0.14em] text-[#7d97ad]">
              and {findings.length - shown.length} more on the findings sheet
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-3 font-body text-[10px] leading-4 text-[#8ea7bd]">{stream.note}</p>
      )}

      <div className="mt-auto space-y-2 pt-3">
        <p className="flex items-start gap-1.5 border-t border-white/8 pt-2 font-body text-[10px] leading-4 text-[#8ea7bd]">
          <ShieldCheck className="mt-0.5 h-3 w-3 flex-none text-[#8ad4a8]" aria-hidden="true" />
          {stream.guardrail}
        </p>
        {stream.deadline ? (
          <p className="flex items-start gap-1.5 font-body text-[10px] leading-4 text-[#e0a96b]">
            <CalendarClock className="mt-0.5 h-3 w-3 flex-none" aria-hidden="true" />
            {stream.deadline}
          </p>
        ) : null}
      </div>
    </article>
  );
}
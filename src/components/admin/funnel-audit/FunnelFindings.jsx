import { ArrowUpRight, FileWarning } from 'lucide-react';
import { CONFIDENCE_TONE, SEVERITY_ORDER, SEVERITY_TONE } from './auditTones';
import { FINDINGS, funnelName } from './funnelRegistry';

// WHAT THE READING TURNED UP.
//
// Ordered by what it costs the house, and each row says how sure the reading is: a confirmed
// row was seen in the code, a likely one follows from it, an unknown one is named so nobody
// mistakes silence for health.
export default function FunnelFindings({ onOpenFunnel }) {
  if (FINDINGS.length === 0) {
    return (
      <p className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-6 text-center font-body text-xs leading-6 text-[#a3b8c9]">
        No finding was recorded. That is itself worth checking: an audit with nothing in it usually means nothing was read.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {SEVERITY_ORDER.map((severity) => {
        const rows = FINDINGS.filter((finding) => finding.severity === severity);
        if (rows.length === 0) return null;
        const tone = SEVERITY_TONE[severity];

        return (
          <section key={severity} aria-label={`${tone.label} findings`}>
            <div className="flex items-center gap-2.5">
              <span className={`h-3 w-0.5 ${tone.rule}`} aria-hidden="true" />
              <h4 className={`font-body text-[10px] font-bold uppercase tracking-[0.28em] ${tone.ink}`}>{tone.label}</h4>
              <span className="font-body text-[10px] tabular-nums text-[#7d97ad]">{rows.length}</span>
            </div>

            <ul className="mt-2.5 space-y-2">
              {rows.map((finding) => {
                const confidence = CONFIDENCE_TONE[finding.confidence];
                return (
                  <li key={finding.id} className="rounded-md border border-white/10 bg-white/[0.025] p-3.5 md:p-4">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="font-body text-[10px] tabular-nums text-editorial-copper">{finding.id}</span>
                      <h5 className="min-w-0 flex-1 font-body text-sm font-semibold leading-5 text-editorial-cream">
                        {finding.title}
                      </h5>
                      <span className={`inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-[0.14em] ${confidence.ink}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${confidence.dot}`} aria-hidden="true" />
                        {confidence.label}
                      </span>
                    </div>

                    <p className="mt-1.5 font-body text-xs leading-6 text-[#a3b8c9]">{finding.statement}</p>

                    <div className="mt-2.5 flex items-start gap-1.5">
                      <FileWarning className="mt-0.5 h-3 w-3 flex-none text-editorial-copper" aria-hidden="true" />
                      <p className="font-body text-[11px] leading-5 text-[#8ea7bd]">
                        <span className="uppercase tracking-[0.14em] text-[#7d97ad]">Evidence · </span>
                        {finding.evidence}
                      </p>
                    </div>

                    <p className="mt-2 font-body text-[11px] leading-5 text-editorial-cream/90">
                      <span className="uppercase tracking-[0.14em] text-editorial-gold">What would close it · </span>
                      {finding.remedy}
                    </p>

                    <button
                      type="button"
                      onClick={() => onOpenFunnel(finding.funnel === 'all' ? 'nomination' : finding.funnel)}
                      className="mt-2.5 inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-[0.16em] text-[#8ea7bd] hover:text-editorial-cream"
                    >
                      {funnelName(finding.funnel)}
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="font-body text-[10px] leading-5 text-[#7d97ad]">
        A finding names what was read, never what a Fellow did. Nothing in this list is measurement, and closing any of it
        changes no record a person owns.
      </p>
    </div>
  );
}
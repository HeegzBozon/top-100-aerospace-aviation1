import { ArrowUpRight, CircleDashed } from 'lucide-react';
import { EFFORT_LABEL, SEVERITY_TONE } from './auditTones';
import { FUNNELS, ROADMAP, funnelName } from './funnelRegistry';

// WHAT TO DO, IN ORDER.
//
// Ranked by what the house loses while it waits, not by how interesting the work is. Each
// line is one piece of work, the finding it closes, and the journey it belongs to.
export default function FunnelRoadmap({ onOpenFunnel }) {
  return (
    <div className="space-y-5">
      <ol className="space-y-2">
        {ROADMAP.map((item) => {
          const tone = SEVERITY_TONE[item.severity];
          const funnel = FUNNELS.find((f) => f.id === item.funnel);

          return (
            <li key={item.rank} className="rounded-md border border-white/10 bg-white/[0.025] p-3.5 md:p-4">
              <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                <span className="mt-0.5 flex-none font-heading text-lg leading-none tabular-nums text-editorial-copper">
                  {String(item.rank).padStart(2, '0')}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <h4 className="font-body text-sm font-semibold text-editorial-cream">{item.title}</h4>
                    <span className={tone.chip}>{tone.label}</span>
                    <span className="font-body text-[10px] uppercase tracking-[0.14em] text-[#7d97ad]">
                      {EFFORT_LABEL[item.effort]}
                    </span>
                  </div>
                  <p className="mt-1.5 font-body text-xs leading-6 text-[#a3b8c9]">{item.why}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onOpenFunnel(item.funnel === 'all' ? (funnel?.id || 'nomination') : item.funnel)}
                      className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-[0.16em] text-[#8ea7bd] hover:text-editorial-cream"
                    >
                      {funnelName(item.funnel)}
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span className="font-body text-[10px] uppercase tracking-[0.14em] text-[#7d97ad]">
                      Closes {item.closes.join(' · ')}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
        <p className="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-gold">
          <CircleDashed className="h-3 w-3" aria-hidden="true" /> Not in this scope
        </p>
        <p className="mt-1.5 font-body text-xs leading-6 text-[#a3b8c9]">
          Nothing here changes a journey by itself. Each line above is a proposal, and the work begins only when one is
          taken up as its own scope. Until then this desk reads and leaves every surface exactly as it found it. No item
          touches discovery, ordering, measurement or influence.
        </p>
      </div>
    </div>
  );
}
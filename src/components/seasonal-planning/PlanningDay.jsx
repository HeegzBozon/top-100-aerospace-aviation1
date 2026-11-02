import { Check } from 'lucide-react';

// One day of the itinerary: a module of steps, each ticked off as it is completed.
export default function PlanningDay({ day, done, onToggle }) {
  const count = day.steps.filter(([k]) => done.includes(k)).length;
  const complete = count === day.steps.length;
  return (
    <section className={`rounded-lg border bg-white p-4 ${complete ? 'border-editorial-copper' : 'border-editorial-navy/15'}`}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">{day.title}</p>
          <h2 className="font-heading text-lg text-editorial-navy">{day.subtitle}</h2>
        </div>
        <span className="font-body text-[11px] font-semibold text-editorial-navy">{complete ? 'Complete' : `${count}/${day.steps.length}`}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-editorial-navy/10">
        <div className="h-full bg-editorial-copper transition-all" style={{ width: `${(count / day.steps.length) * 100}%` }} />
      </div>
      <ol className="mt-3 space-y-1">
        {day.steps.map(([k, title, line], i) => {
          const on = done.includes(k);
          return (
            <li key={k}>
              <button type="button" onClick={() => onToggle(k)} className="flex w-full gap-3 rounded p-2 text-left hover:bg-editorial-cream">
                <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${on ? 'border-editorial-copper bg-editorial-copper text-editorial-cream' : 'border-editorial-navy/30 text-editorial-navy/50'}`}>
                  {on ? <Check className="h-3 w-3" /> : <span className="text-[9px]">{i + 1}</span>}
                </span>
                <span>
                  <span className={`block font-body text-[13px] font-semibold ${on ? 'text-editorial-navy/50 line-through' : 'text-editorial-navy'}`}>{title}</span>
                  <span className="block font-body text-[11.5px] leading-snug text-editorial-navy/60">{line}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
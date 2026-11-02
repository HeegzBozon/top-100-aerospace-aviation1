import { useState } from 'react';
import { Check, ChevronDown, Paperclip, StickyNote } from 'lucide-react';
import StepEvidence from './StepEvidence';

// One day of the itinerary: a module of agenda items, each completed and evidenced however the team works.
export default function PlanningDay({ day, records, canEdit, onSave }) {
  const [open, setOpen] = useState(null);
  const count = day.steps.filter(([k]) => records[k]?.done).length;
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
          const r = records[k] || {};
          const on = !!r.done;
          const files = r.attachments?.length || 0;
          return (
            <li key={k} className="rounded hover:bg-editorial-cream/60">
              <div className="flex gap-3 p-2">
                <button type="button" disabled={!canEdit} onClick={() => onSave(k, { done: !on })} aria-label={on ? 'Mark not done' : 'Mark done'}
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border ${on ? 'border-editorial-copper bg-editorial-copper text-editorial-cream' : 'border-editorial-navy/30 text-editorial-navy/50'}`}>
                  {on ? <Check className="h-3 w-3" /> : <span className="text-[9px]">{i + 1}</span>}
                </button>
                <button type="button" onClick={() => setOpen(open === k ? null : k)} className="flex-1 text-left">
                  <span className={`block font-body text-[13px] font-semibold ${on ? 'text-editorial-navy/50 line-through' : 'text-editorial-navy'}`}>{r.title || title}</span>
                  <span className="block font-body text-[11.5px] leading-snug text-editorial-navy/60">{r.detail || line}</span>
                  {(r.notes || files > 0) && (
                    <span className="mt-1 flex gap-3 font-body text-[10px] text-editorial-label">
                      {r.notes && <span className="flex items-center gap-1"><StickyNote className="h-3 w-3" />Notes</span>}
                      {files > 0 && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{files}</span>}
                    </span>
                  )}
                </button>
                <ChevronDown className={`mt-1 h-4 w-4 flex-none text-editorial-navy/40 transition-transform ${open === k ? 'rotate-180' : ''}`} />
              </div>
              {open === k && <StepEvidence record={r} defaults={{ title, detail: line }} canEdit={canEdit} onSave={(patch) => onSave(k, patch)} />}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
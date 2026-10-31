import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChecklistField from './ChecklistField';
import { recordUrl } from './recordMenu';

const ADD_LINK =
  'mt-2 inline-flex items-center gap-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-editorial-copper transition-colors hover:text-editorial-navy';

// One surface of the record, as a checklist. The measure is the surface's own: how
// many lines of it are in place, never how it compares with another Fellow's.
export default function RecordChecklist({ surface, onSave }) {
  return (
    <section aria-labelledby={`record-surface-${surface.key}`}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-editorial-copper pb-3">
        <div className="min-w-0">
          <p className="pd-label">Section {surface.index}</p>
          <h2
            id={`record-surface-${surface.key}`}
            className="mt-2 font-heading text-[26px] leading-tight text-editorial-navy"
          >
            {surface.label}
          </h2>
          <p className="mt-1 font-body text-[13px] text-editorial-navy/65">{surface.hint}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-[26px] leading-none tabular-nums text-editorial-navy">
            {surface.percent}%
          </p>
          <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/60 tabular-nums">
            {surface.done} of {surface.total} in place
          </p>
        </div>
      </div>

      <div
        className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-editorial-navy/10"
        role="progressbar"
        aria-valuenow={surface.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${surface.label} completion`}
      >
        <span
          className="block h-full rounded-full bg-editorial-copper transition-[width] duration-500"
          style={{ width: `${surface.percent}%` }}
        />
      </div>

      <ul className="mt-4">
        {surface.items.map((entry) => (
          <li key={entry.key} className="flex items-start gap-3.5 border-b border-editorial-navy/10 py-4">
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                entry.done
                  ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                  : 'border-editorial-navy/30 text-transparent'
              }`}
            >
              <Check className="h-[11px] w-[11px]" strokeWidth={3.5} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={`font-body text-[14px] ${
                  entry.done ? 'text-editorial-navy/55' : 'font-medium text-editorial-navy'
                }`}
              >
                {entry.label}
              </p>
              {entry.hint && (
                <p className="mt-0.5 font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
                  {entry.hint}
                </p>
              )}

              {entry.editor ? (
                <ChecklistField
                  value={entry.editor.value}
                  placeholder={entry.editor.placeholder}
                  multiline={entry.editor.multiline}
                  maxLength={entry.editor.maxLength}
                  onSave={(next) => onSave(entry.editor, next)}
                />
              ) : entry.done && entry.value ? (
                <p className="mt-1 font-body text-[13px] capitalize text-editorial-navy/70">{entry.value}</p>
              ) : null}

              {!entry.done && !entry.editor && entry.to && (entry.to === recordUrl(surface.key) ? (
                /* The editor for this line stands on this surface, under the list:
                   the key takes the reader down to it rather than off the page. */
                <a href={`#record-editor-${surface.key}`} className={ADD_LINK}>
                  Add it
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              ) : (
                <Link to={entry.to} className={ADD_LINK}>
                  Add it
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
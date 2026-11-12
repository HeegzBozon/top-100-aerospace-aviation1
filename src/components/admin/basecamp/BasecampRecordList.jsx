import { AlertCircle, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { excerpt, formatDay, isOverdue, kindMeta, recordMeta, recordTitle } from './basecampConfig';

// One rack of records inside the chosen project: what is filed, what is late, and the key
// that files something new. The rack is only ever what the account already holds.
export default function BasecampRecordList({ kind, records, state, error, onOpen, onCompose, onRetry }) {
  const meta = kindMeta(kind);

  if (state === 'error') {
    return (
      <div className="desk-plate flex items-start gap-2 px-3 py-4">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-editorial-cream">
            {meta.label} could not be read.
          </p>
          <p className="mt-0.5 break-words text-[11px] text-editorial-cream/65">{error}</p>
          <button type="button" onClick={onRetry} className="desk-key mt-2">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded" style={{ background: '#111d2a' }} />
        ))}
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="desk-plate px-4 py-10 text-center">
        <p className="text-[13px] font-semibold text-editorial-cream">
          Nothing filed under {meta.label.toLowerCase()} here.
        </p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-editorial-cream/55">
          {meta.writable
            ? `This project has no ${meta.label.toLowerCase()} on the account yet. ${meta.writable ? 'File the first one from this desk.' : ''}`
            : `This project holds no ${meta.label.toLowerCase()} the account can read.`}
        </p>
        {meta.writable && (
          <button type="button" onClick={onCompose} className="desk-key desk-key-primary mt-3">
            <Plus className="h-3 w-3" /> New {meta.one}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {records.map((record) => {
        const overdue = isOverdue(record);
        return (
          <button
            key={record.id}
            type="button"
            onClick={() => onOpen(record)}
            className="desk-plate flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors"
          >
            <span className="mt-0.5 flex-shrink-0">
              {record.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300/80" />
              ) : (
                <span
                  className="mt-1 block h-2 w-2 rounded-full"
                  style={{ background: overdue ? '#e8a1a1' : 'rgba(201,168,124,0.6)' }}
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[12.5px] font-semibold text-editorial-cream">
                  {recordTitle(record)}
                </span>
                {record.due_on && (
                  <span
                    className="text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: overdue ? '#e8a1a1' : 'rgba(239,233,220,0.5)' }}
                  >
                    {overdue ? 'Due ' : 'Due '}
                    {formatDay(record.due_on)}
                  </span>
                )}
              </span>
              {recordMeta(record, kind) && (
                <span className="mt-0.5 block truncate text-[10.5px] text-editorial-cream/45">
                  {recordMeta(record, kind)}
                </span>
              )}
              {record.content && (
                <span className="mt-1 block text-[11px] leading-relaxed text-editorial-cream/65">
                  {excerpt(record.content)}
                </span>
              )}
            </span>

            <ChevronRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-editorial-cream/30" />
          </button>
        );
      })}
    </div>
  );
}
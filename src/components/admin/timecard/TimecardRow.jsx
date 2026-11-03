import { Clock, Pencil, Receipt, Trash2 } from 'lucide-react';
import { TC, STATUS_TONE, amountOf, dayLabel, money } from '@/components/admin/timecard/timecardConfig';

// One line of the ledger. The kind sets the glyph and the figure; the status is a lamp
// in its own colour, so the desk can be read down the column at a glance.
export default function TimecardRow({ entry, onEdit, onDelete }) {
  const isTime = entry.kind === 'time';
  const Glyph = isTime ? Clock : Receipt;
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-3 py-2.5"
      style={{ background: TC.surface, border: `1px solid ${TC.line}` }}
    >
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'rgba(255,255,255,0.05)', color: isTime ? TC.gold : '#8fd3e8' }}
      >
        <Glyph className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="truncate text-sm font-semibold" style={{ color: TC.ink }}>{entry.description}</p>
          {entry.project && (
            <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>{entry.project}</span>
          )}
        </div>
        <p className="mt-0.5 text-[11px]" style={{ color: TC.soft }}>
          {dayLabel(entry.entry_date)}
          {entry.payee ? ` · ${entry.payee}` : ''}
          {isTime ? ` · ${(entry.hours || 0).toFixed(2)} h` : ` · ${entry.category || 'other'}`}
          {entry.billable ? ' · billable' : ''}
          {entry.reimbursable ? ' · reimbursable' : ''}
        </p>
        {entry.notes && <p className="mt-1 text-[11px] italic" style={{ color: '#4e677d' }}>{entry.notes}</p>}
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-bold tabular-nums" style={{ color: TC.ink }}>{money(amountOf(entry))}</p>
        <span className="text-[9px] uppercase tracking-[0.16em]" style={{ color: STATUS_TONE[entry.status] || TC.soft }}>
          {entry.status}
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit(entry)}
          title="Edit entry"
          className="rounded-md p-1.5 transition-colors hover:bg-white/10"
          style={{ color: TC.soft }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(entry)}
          title="Delete entry"
          className="rounded-md p-1.5 transition-colors hover:bg-white/10"
          style={{ color: TC.soft }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
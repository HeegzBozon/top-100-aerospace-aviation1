import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Pencil, Receipt, Trash2 } from 'lucide-react';
import { TC, STATUS_TONE, amountOf, dayLabel, money } from '@/components/admin/timecard/timecardConfig';
import { minutesLabel } from '@/components/admin/timecard/worklogConfig';
import { roomLabel } from '@/components/admin/timecard/scheduleConfig';

const clockOf = (value) => (value ? String(value).slice(11, 16) : '');

// One line of the ledger. The kind sets the glyph and the figure; the status is a lamp
// in its own colour, so the desk can be read down the column at a glance. A session
// imported from a work log opens to the jobs it was made of and what it produced.
export default function TimecardRow({ entry, onEdit, onDelete }) {
  const isTime = entry.kind === 'time';
  const Glyph = isTime ? Clock : Receipt;
  const tasks = Array.isArray(entry.task_lines) ? entry.task_lines : [];
  const deliverables = Array.isArray(entry.deliverables) ? entry.deliverables : [];
  const rooms = Array.isArray(entry.rooms_worked) ? entry.rooms_worked : [];
  const hasDetail = tasks.length > 0 || deliverables.length > 0 || rooms.length > 0 || !!entry.source_label;
  const [open, setOpen] = useState(false);

  const start = clockOf(entry.session_start);
  const end = clockOf(entry.session_end);
  const range = start && end ? `${start} – ${end}` : '';

  return (
    <div className="desk-plate overflow-hidden">
      <div className="flex items-start gap-3 px-3 py-2.5">
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
            {entry.source === 'worklog' && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                style={{ color: TC.gold, border: `1px solid rgba(201,168,124,0.4)` }}
              >
                session
              </span>
            )}
            {entry.event_title && (
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
                style={{ color: '#8fd3e8', border: '1px solid rgba(143,211,232,0.35)' }}
              >
                {entry.event_title}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px]" style={{ color: TC.soft }}>
            {dayLabel(entry.entry_date)}
            {range ? ` · ${range}` : ''}
            {entry.payee ? ` · ${entry.payee}` : ''}
            {isTime ? ` · ${(entry.hours || 0).toFixed(2)} h` : ` · ${entry.category || 'other'}`}
            {entry.billable ? ' · billable' : ''}
            {entry.reimbursable ? ' · reimbursable' : ''}
            {rooms.length > 0 ? ` · ${rooms.map((room) => roomLabel(room.room_key)).join(', ')}` : ''}
          </p>
          {entry.notes && <p className="mt-1 text-[11px] italic" style={{ color: TC.dim }}>{entry.notes}</p>}
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <p className="font-heading text-[15px] leading-none tabular-nums" style={{ color: '#f5efe4' }}>
            {money(amountOf(entry))}
          </p>
          <span className="desk-stamp" style={{ color: STATUS_TONE[entry.status] || TC.soft }}>
            {entry.status}
          </span>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {hasDetail && (
            <button
              onClick={() => setOpen((v) => !v)}
              title={open ? 'Hide the session detail' : 'Show the session detail'}
              className="rounded-md p-1.5 transition-colors hover:bg-white/10"
              style={{ color: open ? TC.gold : TC.soft }}
            >
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
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

      {open && hasDetail && (
        <div className="space-y-2 px-3 pb-3 pl-[3.25rem]">
          {tasks.length > 0 && (
            <ul className="space-y-1">
              {tasks.map((task, index) => (
                <li key={index} className="flex items-baseline gap-2 text-[11px]">
                  <span className="tabular-nums" style={{ color: TC.soft }}>{minutesLabel(task.minutes)}</span>
                  <span className="min-w-0 flex-1" style={{ color: '#a8bed2' }}>{task.label || 'Job'}</span>
                  <span
                    className="text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: task.estimated === false ? '#7ec89a' : TC.dim }}
                    title={task.estimated === false ? 'Minutes taken from the log' : 'Allocated across the session'}
                  >
                    {task.estimated === false ? 'logged' : 'est.'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {rooms.length > 0 && (
            <ul className="space-y-0.5">
              {rooms.map((room, index) => (
                <li key={index} className="flex items-baseline gap-2 text-[11px]">
                  <span className="tabular-nums" style={{ color: TC.soft }}>{minutesLabel(room.minutes)}</span>
                  <span className="min-w-0 flex-1" style={{ color: '#a8bed2' }}>{roomLabel(room.room_key)}</span>
                </li>
              ))}
            </ul>
          )}

          {deliverables.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: TC.dim }}>Produced</p>
              <p className="text-[11px]" style={{ color: '#a8bed2' }}>{deliverables.join(' · ')}</p>
            </div>
          )}

          {entry.source_label && (
            <p className="text-[10px]" style={{ color: TC.dim }}>
              Read from {entry.source_label}
              {entry.timezone ? ` · times in ${entry.timezone}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
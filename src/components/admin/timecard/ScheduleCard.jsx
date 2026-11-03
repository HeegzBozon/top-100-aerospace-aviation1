import { CalendarClock, MapPin, Pencil, Trash2 } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import { KINDS, minutesBetween, roomLabel, timeLabel } from '@/components/admin/timecard/scheduleConfig';
import { minutesLabel } from '@/components/admin/timecard/worklogConfig';

// One row on the board: who is on, in which room, for how long, and under what event.
// An absence is drawn in its own tone so the gap it leaves reads at a glance.
export default function ScheduleCard({ row, onEdit, onDelete }) {
  const kind = KINDS[row.kind] || KINDS.shift;
  const minutes = minutesBetween(row.start_time, row.end_time);
  const isShift = row.kind === 'shift';

  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${TC.line}`, borderLeft: `2px solid ${kind.tone}` }}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold" style={{ color: TC.ink }}>{row.person}</p>
          <p className="text-[10px] tabular-nums" style={{ color: TC.soft }}>
            {isShift ? timeLabel(row) : kind.label}
            {minutes ? ` · ${minutesLabel(minutes)}` : ''}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-0.5">
          <button
            onClick={() => onEdit(row)}
            title="Edit row"
            className="rounded p-1 hover:bg-white/10"
            style={{ color: TC.soft }}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(row)}
            title="Remove row"
            className="rounded p-1 hover:bg-white/10"
            style={{ color: TC.soft }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {row.room_key && (
        <p className="mt-1 flex items-center gap-1 truncate text-[10px]" style={{ color: TC.gold }}>
          <MapPin className="h-2.5 w-2.5" /> {roomLabel(row.room_key)}
        </p>
      )}
      {row.event_title && (
        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px]" style={{ color: '#8fd3e8' }}>
          <CalendarClock className="h-2.5 w-2.5" /> {row.event_title}
        </p>
      )}
      {row.status === 'cancelled' && (
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em]" style={{ color: '#f2a1a1' }}>called off</p>
      )}
      {row.note && <p className="mt-1 text-[10px] italic" style={{ color: '#4e677d' }}>{row.note}</p>}
    </div>
  );
}
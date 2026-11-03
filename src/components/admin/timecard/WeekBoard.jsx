import { Plus } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import { awayOn, dayNum, dayShort, shiftsOn } from '@/components/admin/timecard/scheduleConfig';
import ScheduleCard from '@/components/admin/timecard/ScheduleCard';

// The week as a board: one column per day, today marked, every shift and absence in the
// day it falls on. A day with nothing on it stays visible — the gap is the point.
export default function WeekBoard({ days, rows, today, onAdd, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((iso) => {
        const shifts = shiftsOn(rows, iso);
        const away = awayOn(rows, iso);
        const isToday = iso === today;

        return (
          <div
            key={iso}
            className="flex flex-col gap-1.5 rounded-xl p-2"
            style={{
              background: isToday ? 'rgba(184,115,51,0.10)' : TC.surface,
              border: `1px solid ${isToday ? 'rgba(184,115,51,0.45)' : TC.line}`,
            }}
          >
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: isToday ? TC.gold : TC.soft }}>
                  {dayShort(iso)}
                </p>
                <p className="text-sm font-bold tabular-nums" style={{ color: TC.ink }}>{dayNum(iso)}</p>
              </div>
              <button
                onClick={() => onAdd(iso)}
                title="Add a shift or an absence"
                className="rounded p-1 hover:bg-white/10"
                style={{ color: TC.soft }}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {shifts.length === 0 && away.length === 0 && (
              <p className="rounded-md px-1.5 py-3 text-center text-[10px]" style={{ color: '#3f5568', border: `1px dashed ${TC.line}` }}>
                Uncovered
              </p>
            )}

            {shifts.map((row) => (
              <ScheduleCard key={row.id} row={row} onEdit={onEdit} onDelete={onDelete} />
            ))}
            {away.map((row) => (
              <ScheduleCard key={row.id} row={row} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, addMonths, subMonths,
} from 'date-fns';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MonthCalendar({ accent }) {
  const [cursor, setCursor] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor)),
    end: endOfWeek(endOfMonth(cursor)),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          {format(cursor, 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="p-1 rounded-full transition-colors hover:bg-black/5"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: B.navy }} />
          </button>
          <button
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="p-1 rounded-full transition-colors hover:bg-black/5"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" style={{ color: B.navy }} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DOW.map((d, i) => (
          <span key={i} className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: B.muted }}>
            {d}
          </span>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <span
              key={day.toISOString()}
              className="text-[11px] tabular-nums py-0.5 rounded-full"
              style={{
                color: today ? '#fff' : outside ? `${B.navy}33` : B.navy,
                background: today ? accent : 'transparent',
                fontWeight: today ? 700 : 400,
              }}
            >
              {format(day, 'd')}
            </span>
          );
        })}
      </div>
    </div>
  );
}
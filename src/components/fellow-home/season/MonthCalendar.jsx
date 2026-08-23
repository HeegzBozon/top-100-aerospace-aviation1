import { useState, useEffect } from 'react';
import { ChevronDown, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday,
} from 'date-fns';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Dot color is lifecycle-derived (never transactional). Upcoming = accent, live = gold, done = navy.
const colorForStatus = (status, accent) => {
  if (status === 'live') return B.gold;
  if (['closed', 'archived'].includes(status)) return B.navy;
  return accent;
};

export default function MonthCalendar({ accent }) {
  const [cursor, setCursor] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    base44.entities.ConferenceRoom.list('-start_date', 200)
      .then((data) => { if (mounted) setRooms(data || []); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor)),
    end: endOfWeek(endOfMonth(cursor)),
  });

  // Mark every day in a room's [start, end] span. Caps stored dots at 3; tracks overflow.
  const byDay = new Map();
  rooms.forEach((r) => {
    if (!r.start_date) return;
    const start = new Date(r.start_date);
    const rawEnd = r.end_date ? new Date(r.end_date) : start;
    const end = rawEnd < start ? start : rawEnd;
    const color = colorForStatus(r.status, accent);
    eachDayOfInterval({ start, end }).forEach((d) => {
      const key = format(d, 'yyyy-MM-dd');
      if (!byDay.has(key)) byDay.set(key, { colors: [], count: 0 });
      const cell = byDay.get(key);
      cell.count += 1;
      if (cell.colors.length < 3) cell.colors.push(color);
    });
  });

  const year = cursor.getFullYear();
  const today = new Date();

  return (
    <div className="rounded-xl p-3" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {/* Header bar — month pill (left), today chip (right) */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: B.sand }}>
          <span className="text-xs font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {format(cursor, 'MMMM')}
          </span>
          <ChevronDown className="w-3 h-3" style={{ color: B.muted }} />
        </div>
        <button
          type="button"
          onClick={() => setCursor(new Date())}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full transition-opacity hover:opacity-70"
          style={{ background: B.sand }}
          aria-label="Jump to today"
        >
          <CalendarDays className="w-3 h-3" style={{ color: B.navy }} />
          <span className="text-[10px] font-bold tabular-nums" style={{ color: B.navy }}>{format(today, 'd')}</span>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center leading-none">
        {DOW.map((d, i) => (
          <span key={i} className="text-[8px] font-semibold uppercase pb-1" style={{ color: B.muted }}>{d}</span>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, cursor);
          const isTodayCell = isToday(day);
          const key = format(day, 'yyyy-MM-dd');
          const cell = byDay.get(key);
          return (
            <div key={key} className="flex flex-col items-center py-[2px]">
              <span
                className="text-[10px] tabular-nums w-5 h-5 flex items-center justify-center rounded-full"
                style={{
                  color: isTodayCell ? '#fff' : outside ? `${B.navy}33` : B.navy,
                  background: isTodayCell ? B.navy : 'transparent',
                  fontWeight: isTodayCell ? 700 : 400,
                }}
              >
                {format(day, 'd')}
              </span>
              <div className="h-2 flex items-center gap-[2px] mt-[1px]">
                {loading ? (
                  <span className="w-1 h-1 rounded-full" style={{ background: `${B.navy}22` }} />
                ) : cell ? (
                  <>
                    {cell.colors.map((c, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ background: c }} />
                    ))}
                    {cell.count > 3 && (
                      <span className="text-[7px] leading-none" style={{ color: B.muted }}>+</span>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Month selector strip + year stepper */}
      <div
        className="mt-2 pt-2 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
        style={{ borderColor: `${B.navy}14` }}
      >
        {MONTH_ABBR.map((label, m) => {
          const active = m === cursor.getMonth();
          return (
            <button
              key={m}
              type="button"
              onClick={() => setCursor(new Date(year, m, 1))}
              className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors"
              style={{
                background: active ? `${accent}22` : '#fff',
                color: active ? accent : B.navy,
                border: `1px solid ${active ? accent : B.border}`,
              }}
            >
              {label}
            </button>
          );
        })}
        <div className="shrink-0 ml-auto flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(year - 1, c.getMonth(), 1))}
            className="p-0.5 rounded-full transition-colors hover:bg-black/5"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-3 h-3" style={{ color: B.muted }} />
          </button>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: B.navy }}>{year}</span>
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(year + 1, c.getMonth(), 1))}
            className="p-0.5 rounded-full transition-colors hover:bg-black/5"
            aria-label="Next year"
          >
            <ChevronRight className="w-3 h-3" style={{ color: B.muted }} />
          </button>
        </div>
      </div>
    </div>
  );
}
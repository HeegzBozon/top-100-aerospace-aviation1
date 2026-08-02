import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function HeroMonthCalendar({ events = [] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Map yyyy-mm-dd -> count of events that day
  const dayCounts = useMemo(() => {
    const map = {};
    for (const e of events) {
      if (!e?.event_date) continue;
      const d = new Date(e.event_date);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return arr;
  }, [cursor]);

  const monthEvents = useMemo(() => {
    const m = cursor.getMonth();
    const y = cursor.getFullYear();
    return events.filter((e) => {
      if (!e?.event_date) return false;
      const d = new Date(e.event_date);
      return d.getMonth() === m && d.getFullYear() === y;
    }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events, cursor]);

  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#07111f]/60 p-5 backdrop-blur-xl shadow-[0_0_40px_rgba(201,168,124,0.10)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
          {MONTHS[cursor.getMonth()]} <span className="text-white/40">{cursor.getFullYear()}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-[#c9a87c]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white/55 transition-colors hover:text-[#c9a87c]"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-colors hover:text-[#c9a87c]"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-bold uppercase tracking-widest text-white/30">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const count = dayCounts[key] || 0;
          const isToday = isSameDay(d, today);
          return (
            <Link
              key={i}
              to="/events"
              className="group relative flex h-9 items-center justify-center rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: isToday ? 'linear-gradient(135deg, #c9a87c, #d8b98d)' : count ? 'rgba(201,168,124,0.10)' : 'transparent',
                color: isToday ? '#07111f' : count ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            >
              {d.getDate()}
              {count > 0 && !isToday && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#c9a87c]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Upcoming this month */}
      <div className="mt-4 min-h-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">This month</p>
        <div className="mt-2 space-y-1.5">
          {monthEvents.length === 0 ? (
            <p className="text-[11px] text-white/35">No chamber events scheduled.</p>
          ) : monthEvents.slice(0, 3).map((e) => (
            <Link key={e.id} to="/events" className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/5">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 text-center leading-none">
                <span className="text-[10px] font-bold text-[#c9a87c]">{new Date(e.event_date).getDate()}</span>
              </span>
              <span className="truncate text-[11px] font-medium text-white/75">{e.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
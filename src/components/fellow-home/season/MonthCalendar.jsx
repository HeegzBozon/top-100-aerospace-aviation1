import { useState, useEffect } from 'react';
import { ChevronDown, CalendarDays, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday,
} from 'date-fns';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const STATUS_LABEL = { draft: 'Upcoming', open: 'Upcoming', live: 'In progress', closed: 'Concluded', archived: 'Archived' };

const colorForStatus = (status, accent) => {
  if (status === 'live') return B.gold;
  if (['closed', 'archived'].includes(status)) return B.navy;
  return accent;
};

export default function MonthCalendar({ accent }) {
  const [cursor, setCursor] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);

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

  const byDay = new Map();
  rooms.forEach((r) => {
    if (!r.start_date) return;
    const start = new Date(r.start_date);
    const rawEnd = r.end_date ? new Date(r.end_date) : start;
    const end = rawEnd < start ? start : rawEnd;
    eachDayOfInterval({ start, end }).forEach((d) => {
      const key = format(d, 'yyyy-MM-dd');
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(r);
    });
  });

  const year = cursor.getFullYear();
  const today = new Date();
  const selectedRooms = selectedKey ? byDay.get(selectedKey) || [] : [];

  return (
    <div className="rounded-xl p-2.5" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {/* Header bar — month pill (left), today chip (right) */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: B.sand }}>
          <span className="text-[11px] font-bold" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {format(cursor, 'MMMM')}
          </span>
          <ChevronDown className="w-3 h-3" style={{ color: B.muted }} />
        </div>
        <button
          type="button"
          onClick={() => { setCursor(new Date()); setSelectedKey(null); }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-opacity hover:opacity-70"
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
          <span key={i} className="text-[8px] font-semibold uppercase pb-0.5" style={{ color: B.muted }}>{d}</span>
        ))}
        {days.map((day) => {
          const outside = !isSameMonth(day, cursor);
          const isTodayCell = isToday(day);
          const key = format(day, 'yyyy-MM-dd');
          const dayRooms = byDay.get(key);
          const hasEvents = !!dayRooms?.length;
          const selected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!hasEvents}
              onClick={() => setSelectedKey(selected ? null : key)}
              className="flex flex-col items-center py-[1px] rounded-md transition-colors"
              style={{ cursor: hasEvents ? 'pointer' : 'default' }}
            >
              <span
                className="text-[10px] tabular-nums w-5 h-5 flex items-center justify-center rounded-full"
                style={{
                  color: isTodayCell ? '#fff' : outside ? `${B.navy}33` : B.navy,
                  background: isTodayCell ? B.navy : 'transparent',
                  fontWeight: isTodayCell ? 700 : 400,
                  outline: selected ? `1.5px solid ${accent}` : 'none',
                  outlineOffset: '1px',
                }}
              >
                {format(day, 'd')}
              </span>
              <div className="h-1.5 flex items-center gap-[2px] mt-[1px]">
                {loading ? (
                  <span className="w-1 h-1 rounded-full" style={{ background: `${B.navy}22` }} />
                ) : dayRooms ? (
                  <>
                    {dayRooms.slice(0, 3).map((r, i) => (
                      <span key={i} className="w-1 h-1 rounded-full" style={{ background: colorForStatus(r.status, accent) }} />
                    ))}
                    {dayRooms.length > 3 && (
                      <span className="text-[7px] leading-none" style={{ color: B.muted }}>+</span>
                    )}
                  </>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Event popover — expands below the grid for the selected day */}
      {selectedKey && (
        <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: `${B.navy}14` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: B.navy }}>
              {format(new Date(selectedKey), 'EEEE, MMMM d')}
            </span>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="p-0.5 rounded-full transition-colors hover:bg-black/5"
              aria-label="Close"
            >
              <X className="w-3 h-3" style={{ color: B.muted }} />
            </button>
          </div>
          <ul className="space-y-1">
            {selectedRooms.map((r) => (
              <li key={r.id} className="flex items-start gap-1.5">
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colorForStatus(r.status, accent) }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold truncate" style={{ color: B.navy }}>{r.conference_name}</p>
                  <p className="text-[9px] flex items-center gap-1" style={{ color: B.muted }}>
                    {(r.city || r.country) && (
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{[r.city, r.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span>· {STATUS_LABEL[r.status] || r.status}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Month selector strip + year stepper */}
      <div
        className="mt-1.5 pt-1.5 border-t flex items-center gap-1 overflow-x-auto scrollbar-hide"
        style={{ borderColor: `${B.navy}14` }}
      >
        {MONTH_ABBR.map((label, m) => {
          const active = m === cursor.getMonth();
          return (
            <button
              key={m}
              type="button"
              onClick={() => { setCursor(new Date(year, m, 1)); setSelectedKey(null); }}
              className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-semibold transition-colors"
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
            onClick={() => { setCursor(new Date(year - 1, cursor.getMonth(), 1)); setSelectedKey(null); }}
            className="p-0.5 rounded-full transition-colors hover:bg-black/5"
            aria-label="Previous year"
          >
            <ChevronLeft className="w-3 h-3" style={{ color: B.muted }} />
          </button>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: B.navy }}>{year}</span>
          <button
            type="button"
            onClick={() => { setCursor(new Date(year + 1, cursor.getMonth(), 1)); setSelectedKey(null); }}
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
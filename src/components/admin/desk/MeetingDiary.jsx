import { useMemo } from 'react';
import { Check, MapPin, X } from 'lucide-react';
import { roomLabel } from '@/components/admin/timecard/scheduleConfig';
import { MEETING_KINDS, dayLabelOf, rangeLabel } from './meetingConfig';

const STAMP = {
  booked: { label: 'Booked', tone: '#c9a87c' },
  done: { label: 'Held', tone: '#8fd3a8' },
  cancelled: { label: 'Called off', tone: '#e8a1a1' },
};

// The diary itself: the days ahead, one plate per meeting, with the two keys that move it.
export default function MeetingDiary({ meetings, onDone, onCancel }) {
  const { ahead, behind } = useMemo(() => {
    const now = Date.now();
    const sorted = [...meetings].sort((a, b) => String(a.start_at).localeCompare(String(b.start_at)));
    return {
      ahead: sorted.filter((m) => m.status === 'booked' && new Date(m.start_at).getTime() >= now - 3600000),
      behind: sorted
        .filter((m) => m.status !== 'booked' || new Date(m.start_at).getTime() < now - 3600000)
        .reverse()
        .slice(0, 6),
    };
  }, [meetings]);

  const groups = useMemo(() => {
    const map = new Map();
    ahead.forEach((meeting) => {
      const key = dayLabelOf(meeting.start_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(meeting);
    });
    return [...map.entries()];
  }, [ahead]);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: '#c9a87c' }}>
          In the diary
        </p>
        <span className="text-[10px]" style={{ color: '#a7bccd' }}>{ahead.length} ahead</span>
      </div>

      {ahead.length === 0 && (
        <div className="desk-plate px-4 py-8 text-center">
          <p className="font-heading text-[15px]" style={{ color: '#f5efe4' }}>The diary is clear.</p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed" style={{ color: '#b3c6d6' }}>
            Book the first meeting against the left-hand page and it prints here.
          </p>
        </div>
      )}

      {groups.map(([day, rows]) => (
        <div key={day}>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#a7bccd' }}>{day}</p>
          <div className="space-y-1.5">
            {rows.map((meeting) => {
              const meta = MEETING_KINDS[meeting.kind] || MEETING_KINDS.other;
              const stamp = STAMP[meeting.status] || STAMP.booked;
              return (
                <div key={meeting.id} className="desk-plate px-3 py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold" style={{ color: '#f5efe4' }}>
                        {meeting.title}
                      </p>
                      <p className="mt-0.5 text-[11px]" style={{ color: '#b3c6d6' }}>
                        {rangeLabel(meeting)} · {meta.label}
                        {meeting.room_key ? (
                          <>
                            {' · '}
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="inline h-3 w-3" /> {roomLabel(meeting.room_key)}
                            </span>
                          </>
                        ) : null}
                      </p>
                      {meeting.attendees?.length > 0 && (
                        <p className="mt-1 truncate text-[11px]" style={{ color: '#a7bccd' }}>
                          {meeting.attendees.join(' · ')}
                        </p>
                      )}
                    </div>
                    <span className="desk-stamp flex-shrink-0" style={{ color: stamp.tone }}>{stamp.label}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDone(meeting)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ border: '1px solid rgba(143,211,168,0.45)', color: '#8fd3a8' }}
                    >
                      <Check className="h-3 w-3" /> Held
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancel(meeting)}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ border: '1px solid rgba(255,255,255,0.16)', color: '#b3c6d6' }}
                    >
                      <X className="h-3 w-3" /> Call off
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {behind.length > 0 && (
        <div className="pt-1">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: '#a7bccd' }}>Filed</p>
          <div className="space-y-1">
            {behind.map((meeting) => {
              const stamp = STAMP[meeting.status] || STAMP.booked;
              return (
                <div key={meeting.id} className="flex items-baseline justify-between gap-3 border-b py-1.5" style={{ borderColor: 'rgba(201,168,124,0.14)' }}>
                  <span className="min-w-0 truncate text-[11px]" style={{ color: '#b3c6d6' }}>
                    {dayLabelOf(meeting.start_at)} · {meeting.title}
                  </span>
                  <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: stamp.tone }}>
                    {stamp.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
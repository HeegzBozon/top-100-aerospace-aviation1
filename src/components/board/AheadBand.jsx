import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Radar, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useRoomsAhead from '@/components/aerosync/useRoomsAhead';
import { roomCountdown } from '@/components/conference-room/conferenceRoomConfig';
import { formatDay } from '@/components/crm/crmConfig';
import { BRAND } from './boardConfig';

const isPublicEvent = (event) =>
  event.moderation_status === 'approved' || event.is_official || event.source === 'official';

const label = 'text-[7.5px] font-bold uppercase tracking-[0.24em]';

// What the board is standing in front of: the next room Fellows have opened, and the next
// two shows on the chamber calendar — read here rather than one surface away, because a
// Fellow checks the board to know what is coming. Each row opens the surface that holds the
// whole of it; the band only ever carries the next of each.
export default function AheadBand() {
  const rooms = useRoomsAhead();
  const [events, setEvents] = useState(null);
  const [eventsFailed, setEventsFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.entities.Event
      .list('event_date', 200)
      .then((all = []) => {
        if (!alive) return;
        const now = Date.now();
        setEvents(
          (all || [])
            .filter((event) => isPublicEvent(event) && new Date(event.event_date).getTime() >= now)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
            .slice(0, 2),
        );
      })
      .catch(() => {
        if (alive) setEventsFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const room = rooms.nextRoom;
  const standing = room ? rooms.attendeesFor(room).length : 0;
  const countdown = room ? roomCountdown(room) : null;
  const where = [room?.city, room?.country].filter(Boolean).join(', ');

  const reading = rooms.state.loading || events === null;

  return (
    <div
      className="rounded-[10px] px-2.5 py-2"
      style={{ background: '#FFFFFF', border: '1px solid rgba(30,58,90,0.14)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={label} style={{ color: BRAND.copper }}>
          Ahead
        </span>
        {rooms.state.failed && eventsFailed ? (
          <button
            type="button"
            onClick={rooms.retry}
            className={`flex items-center gap-1 ${label}`}
            style={{ color: BRAND.navy }}
          >
            <RotateCcw className="h-[9px] w-[9px]" /> Read again
          </button>
        ) : null}
      </div>

      {reading ? (
        <p className="mt-1.5 text-[10px]" style={{ color: 'rgba(30,58,90,0.5)' }}>
          Reading what is ahead…
        </p>
      ) : (
        <div className="mt-1.5 space-y-1.5">
          <Link to="/aerosync/rooms" className="block">
            <span className="flex items-center gap-1.5">
              <Radar className="h-3 w-3 shrink-0" style={{ color: BRAND.copper }} />
              <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold" style={{ color: BRAND.navy }}>
                {room ? room.conference_name : 'No room open yet'}
              </span>
              <ArrowRight className="h-3 w-3 shrink-0" style={{ color: 'rgba(30,58,90,0.4)' }} />
            </span>
            <span className="mt-0.5 block text-[9px] leading-snug" style={{ color: 'rgba(26,26,26,0.62)' }}>
              {room
                ? [where, countdown?.label || (room.start_date ? formatDay(room.start_date) : null)]
                    .filter(Boolean)
                    .join(' · ').concat(standing ? ` · ${standing} standing` : '')
                : 'Fellows open rooms as the shows approach.'}
            </span>
          </Link>

          <div style={{ borderTop: '1px solid rgba(30,58,90,0.1)' }} />

          {(events || []).map((event) => (
            <Link key={event.id} to="/events" className="block">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 shrink-0" style={{ color: BRAND.copper }} />
                <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold" style={{ color: BRAND.navy }}>
                  {event.title}
                </span>
                <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.copper }}>
                  {formatDay(event.event_date)}
                </span>
              </span>
            </Link>
          ))}

          {events && events.length === 0 ? (
            <Link to="/events" className="block">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3 w-3 shrink-0" style={{ color: BRAND.copper }} />
                <span className="min-w-0 flex-1 text-[10.5px] font-semibold" style={{ color: BRAND.navy }}>
                  The calendar is clear
                </span>
                <ArrowRight className="h-3 w-3 shrink-0" style={{ color: 'rgba(30,58,90,0.4)' }} />
              </span>
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
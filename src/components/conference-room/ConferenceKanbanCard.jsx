import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Users, CheckCircle2, Clock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta } from './conferenceRoomConfig';
import RsvpControl from './RsvpControl';

// Compact card for the Conference Room Kanban. phase tunes the footer:
// discovery/attending render the RSVP control; post renders the reconnect roster.
export default function ConferenceKanbanCard({ room, attendees, user, accent, phase, onRsvpChanged }) {
  const list = attendees || [];
  const myRsvp = list.find((a) => a.fellow_email === user?.email);
  const meta = statusMeta(room.status);
  const dateRange = room.start_date
    ? `${format(parseISO(room.start_date), 'MMM d')}${room.end_date ? `–${format(parseISO(room.end_date), 'MMM d')}` : ''}`
    : '';
  const city = [room.city, room.country].filter(Boolean).join(', ');

  return (
    <div
      className="rounded-xl p-3 flex flex-col"
      style={{ background: '#fff', border: `1px solid ${phase === 'attending' ? `${accent}55` : B.border}` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
        <h4 className="text-xs font-bold leading-tight truncate" style={{ color: B.navy }}>{room.conference_name}</h4>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5 text-[10px]" style={{ color: B.muted }}>
        {dateRange && <span className="inline-flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{dateRange}</span>}
        {city && <span className="inline-flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{city}</span>}
      </div>

      <div className="inline-flex items-center gap-1 text-[10px] font-semibold mb-1" style={{ color: B.navy }}>
        <Users className="w-3 h-3" style={{ color: accent }} />{list.length} attending
      </div>

      {phase === 'attending' && myRsvp?.focus_area && (
        <span className="inline-block self-start text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5" style={{ background: `${accent}12`, color: accent }}>
          {myRsvp.focus_area}
        </span>
      )}

      {phase === 'post' && (
        <>
          <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: room.attendance_verified ? B.gold : B.muted }}>
            {room.attendance_verified ? <><CheckCircle2 className="w-3 h-3" />Verified</> : <><Clock className="w-3 h-3" />Pending</>}
          </div>
          {list.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {list.slice(0, 5).map((a) => (
                <span key={a.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: B.cream, color: B.navy }}>{a.fellow_name || a.fellow_email}</span>
              ))}
              {list.length > 5 && <span className="text-[9px] self-center" style={{ color: B.muted }}>+{list.length - 5}</span>}
            </div>
          )}
        </>
      )}

      {phase !== 'post' && (
        <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
      )}
    </div>
  );
}
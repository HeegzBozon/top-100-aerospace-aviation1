import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, ExternalLink, Users, Crown } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta, disciplineLabel } from './conferenceRoomConfig';
import RsvpControl from './RsvpControl';

// One Mission Room card. Attendance is derived from RSVPs (display only,
// never measurement) until attendance_verified flips true.
export default function ConferenceRoomCard({ room, attendees, user, accent, onRsvpChanged }) {
  const meta = statusMeta(room.status);
  const myRsvp = (attendees || []).find((a) => a.fellow_email === user?.email);

  const dateRange =
    room.start_date && room.end_date
      ? `${format(parseISO(room.start_date), 'MMM d')}–${format(parseISO(room.end_date), 'MMM d, yyyy')}`
      : room.start_date
        ? format(parseISO(room.start_date), 'MMM d, yyyy')
        : '';

  const attendeeNames = (attendees || []).slice(0, 4).map((a) => a.fellow_name || a.fellow_email);

  return (
    <article
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: '#fff', border: `1px solid ${B.border}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="text-sm font-bold leading-tight" style={{ color: B.navy }}>{room.conference_name}</h3>
        <span
          className="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[11px]" style={{ color: B.muted }}>
        {dateRange && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateRange}</span>}
        {(room.city || room.country) && (
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {[room.city, room.country].filter(Boolean).join(', ')}</span>
        )}
        {room.domain_focus && <span className="inline-flex items-center gap-1">· {disciplineLabel(room.domain_focus)}</span>}
      </div>

      {room.description && (
        <p className="text-xs leading-relaxed mb-2" style={{ color: B.navy }}>{room.description}</p>
      )}

      {(room.focus_areas || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(room.focus_areas || []).map((f) => (
            <span
              key={f.key}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${accent}12`, color: accent }}
            >
              {f.label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-1 mt-auto">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: B.navy }}>
          <Users className="w-3.5 h-3.5" style={{ color: accent }} />
          {(attendees || []).length} attending
        </span>
        {room.official_url && (
          <a
            href={room.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: B.muted }}
          >
            Official site <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {attendeeNames.length > 0 && (
        <p className="text-[11px] mb-1" style={{ color: B.muted }}>
          {attendeeNames.join(', ')}{attendees.length > 4 ? ` +${attendees.length - 4} more` : ''}
        </p>
      )}

      {room.facilitator_name && (
        <p className="text-[10px] mt-1" style={{ color: B.muted }}>Facilitator: {room.facilitator_name}</p>
      )}

      {room.patron_of_record_name && (
        <p className="inline-flex items-center gap-1 text-[10px] mt-1" style={{ color: B.gold }}>
          <Crown className="w-3 h-3" /> Patron of Record: {room.patron_of_record_name}
        </p>
      )}

      {!room.attendance_verified && (attendees || []).length > 0 && (
        <p className="text-[9px] italic mt-1" style={{ color: B.muted }}>
          Declared attendance · pending independent verification
        </p>
      )}

      <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
    </article>
  );
}
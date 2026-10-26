import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import AvatarCluster from '@/components/conference-room/AvatarCluster';
import RsvpControl from '@/components/conference-room/RsvpControl';
import { domainAccent, roomCountdown, statusMeta } from '@/components/conference-room/conferenceRoomConfig';

const dateRange = (room) => {
  if (!room?.start_date) return '';
  const start = parseISO(room.start_date);
  if (!room.end_date) return format(start, 'MMM d, yyyy');
  return `${format(start, 'MMM d')}–${format(parseISO(room.end_date), 'MMM d, yyyy')}`;
};

const Chip = ({ children, tone }) => (
  <span
    className="inline-flex items-center rounded-full px-2 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.16em]"
    style={{ background: `${tone}1F`, border: `1px solid ${tone}44`, color: tone }}
  >
    {children}
  </span>
);

// The room ahead: the next show on the calendar, the people already standing in
// it, and the Fellow's own declaration. Attendance here is a coordination
// signal — display only, never measurement.
export default function NetworkingHero({ room, attendees = [], myRsvp, user, onChanged }) {
  if (!room) return null;

  const meta = statusMeta(room.status);
  const accent = room.domain_focus ? domainAccent(room.domain_focus) : B.copper;
  const countdown = roomCountdown(room);
  const going = attendees.length;
  const place = [room.city, room.country].filter(Boolean).join(', ');

  return (
    <article
      className="rounded-2xl p-4 md:p-5"
      style={{ background: '#FFFFFF', border: B.border, borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip tone={meta.color}>{meta.label}</Chip>
        {countdown ? <Chip tone={B.navy}>{countdown.label}</Chip> : null}
        {room.conference_series ? <Chip tone={B.muted}>{room.conference_series}</Chip> : null}
      </div>

      <h2 className="mt-3 font-heading text-2xl leading-tight md:text-3xl" style={{ color: B.navy }}>
        {room.conference_name}
      </h2>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: B.muted }}>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" style={{ color: accent }} />
          {dateRange(room)}
        </span>
        {place ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: accent }} />
            {place}
            {room.venue ? ` · ${room.venue}` : ''}
          </span>
        ) : null}
        {room.facilitator_name ? (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" style={{ color: accent }} />
            Facilitated by {room.facilitator_name}
          </span>
        ) : null}
      </div>

      {room.description ? (
        <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed" style={{ color: B.navy }}>
          {room.description}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3.5" style={{ borderColor: B.border }}>
        <AvatarCluster items={attendees} max={6} size={26} accent={accent} />
        <span className="text-[11px] font-semibold" style={{ color: B.navy }}>
          {going > 0 ? `${going} Fellow${going === 1 ? '' : 's'} attending` : 'No one has declared yet. Be the first in the room.'}
        </span>
      </div>

      <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onChanged} />

      <Link
        to="/Profile?board=conference"
        className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
        style={{ color: B.copper }}
      >
        Open the full room board
        <ArrowRight className="h-3 w-3" />
      </Link>
    </article>
  );
}
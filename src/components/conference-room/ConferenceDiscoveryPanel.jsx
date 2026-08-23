import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Users, Telescope } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta, disciplineLabel } from './conferenceRoomConfig';
import RsvpControl from './RsvpControl';
import ConferencePhaseHeader from './ConferencePhaseHeader';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg px-2.5 py-1.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[9px] uppercase tracking-[0.12em] font-semibold" style={{ color: B.muted }}>{label}</p>
      <p className="text-sm font-bold leading-tight" style={{ color: B.navy }}>{value}</p>
    </div>
  );
}

function nextLabel(rooms) {
  const today = new Date();
  const upcoming = rooms
    .filter((r) => r.start_date && new Date(r.start_date) >= today)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  if (!upcoming.length) return '—';
  return format(parseISO(upcoming[0].start_date), 'MMM d');
}

function DiscoveryRow({ room, attendees, user, accent, onRsvpChanged }) {
  const meta = statusMeta(room.status);
  const dateRange = room.start_date
    ? `${format(parseISO(room.start_date), 'MMM d')}${room.end_date ? `–${format(parseISO(room.end_date), 'MMM d')}` : ''}`
    : '';
  const myRsvp = (attendees || []).find((a) => a.fellow_email === user?.email);

  return (
    <div className="rounded-xl p-3" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}18`, color: meta.color }}>{meta.label}</span>
            <h4 className="text-sm font-bold truncate" style={{ color: B.navy }}>{room.conference_name}</h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[10px]" style={{ color: B.muted }}>
            {dateRange && <span className="inline-flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{dateRange}</span>}
            {(room.city || room.country) && <span className="inline-flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{[room.city, room.country].filter(Boolean).join(', ')}</span>}
            {room.domain_focus && <span>· {disciplineLabel(room.domain_focus)}</span>}
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold" style={{ color: B.navy }}>
          <Users className="w-3 h-3" style={{ color: accent }} />{(attendees || []).length}
        </span>
      </div>
      <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
    </div>
  );
}

export default function ConferenceDiscoveryPanel({ rooms, rsvpsByRoom, user, accent, onRsvpChanged }) {
  const totalDeclared = Object.values(rsvpsByRoom || {}).reduce((n, a) => n + (a || []).length, 0);

  return (
    <section>
      <ConferencePhaseHeader
        num="01"
        icon={Telescope}
        label="Discovery"
        subtitle="Find your room across the calendar"
        count={rooms.length}
        accent={accent}
      />
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Rooms" value={rooms.length} />
        <Stat label="Declared" value={totalDeclared} />
        <Stat label="Next" value={nextLabel(rooms)} />
      </div>
      <div className="space-y-2">
        {rooms.map((r) => (
          <DiscoveryRow key={r.id} room={r} attendees={rsvpsByRoom[r.id] || []} user={user} accent={accent} onRsvpChanged={onRsvpChanged} />
        ))}
      </div>
    </section>
  );
}
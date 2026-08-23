import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Check, Clock, Radio, UserPlus } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta, domainAccent, roomCountdown } from './conferenceRoomConfig';
import AvatarCluster from './AvatarCluster';
import RsvpControl from './RsvpControl';

// Compact card for the Conference Room Kanban. phase tunes the footer:
// upcoming/in-progress render the RSVP control; done renders the reconnect roster.
export default function ConferenceKanbanCard({ room, attendees, user, accent, phase, onRsvpChanged, onOpen }) {
  const list = attendees || [];
  const myRsvp = list.find((a) => a.fellow_email === user?.email);
  const meta = statusMeta(room.status);
  const domainColor = domainAccent(room.domain_focus);
  const countdown = roomCountdown(room);
  const dateRange = room.start_date
    ? `${format(parseISO(room.start_date), 'MMM d')}${room.end_date ? `–${format(parseISO(room.end_date), 'MMM d')}` : ''}`
    : '';
  const city = [room.city, room.country].filter(Boolean).join(', ');
  const isLive = phase === 'live';
  const isDone = phase === 'done';
  const volunteers = list.filter((a) => a.volunteer).length;

  return (
    <div
      onClick={() => onOpen?.()}
      className="rounded-xl p-3 flex flex-col relative overflow-hidden cursor-pointer"
      style={{
        background: isDone ? B.cream : '#fff',
        border: `1px solid ${isLive ? `${domainColor}55` : B.border}`,
        borderLeft: `3px solid ${domainColor}`,
        opacity: isDone ? 0.85 : 1,
      }}
    >
      {/* You're-in stamp */}
      {myRsvp && !isDone && (
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.1em] px-1 py-0.5 rounded-full"
          style={{ background: B.navy, color: '#fff' }}
        >
          <Check className="w-2 h-2" /> {myRsvp.status === 'waitlist' ? 'Waitlist' : 'In'}
        </span>
      )}

      <div className="flex items-center gap-1.5 mb-1 pr-10">
        <span
          className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
          style={{ background: `${meta.color}18`, color: meta.color }}
        >
          {isLive && <Radio className="w-2.5 h-2.5" />}{meta.label}
        </span>
        {room.conference_series && (
          <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: domainColor }}>{room.conference_series}</span>
        )}
        <h4 className="text-xs font-bold leading-tight truncate" style={{ color: B.navy }}>{room.conference_name}</h4>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5 text-[10px]" style={{ color: B.muted }}>
        {dateRange && <span className="inline-flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{dateRange}</span>}
        {countdown && (
          <span
            className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-full"
            style={{ background: countdown.kind === 'live' ? `${B.gold}22` : `${domainColor}14`, color: countdown.kind === 'live' ? B.gold : domainColor }}
          >
            {countdown.kind === 'live' ? <Radio className="w-2 h-2" /> : <Clock className="w-2 h-2" />}{countdown.label}
          </span>
        )}
        {city && <span className="inline-flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{city}</span>}
      </div>

      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <AvatarCluster items={list} accent={domainColor} size={18} max={4} />
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: B.navy }}>
            {list.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isDone && myRsvp?.focus_area && (
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${domainColor}12`, color: domainColor }}>
              {myRsvp.focus_area}
            </span>
          )}
          {volunteers > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${accent}14`, color: accent }}>
              <UserPlus className="w-2.5 h-2.5" />{volunteers}
            </span>
          )}
        </div>
      </div>

      {isDone && (
        <>
          <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: room.attendance_verified ? B.gold : B.muted }}>
            {room.attendance_verified ? <><Check className="w-3 h-3" />Verified</> : <><Clock className="w-3 h-3" />Pending</>}
          </div>
          {list.length > 0 && <AvatarCluster items={list} accent={domainColor} size={20} max={6} />}
        </>
      )}

      {!isDone && (
        <div onClick={(e) => e.stopPropagation()}>
          <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
        </div>
      )}
    </div>
  );
}
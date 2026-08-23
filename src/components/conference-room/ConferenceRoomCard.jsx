import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, ExternalLink, Crown, Check, Clock, Radio } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { statusMeta, disciplineLabel, domainAccent, roomCountdown, phaseForStatus } from './conferenceRoomConfig';
import AvatarCluster from './AvatarCluster';
import RsvpControl from './RsvpControl';

const hostLabel = (url) => {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

// One Mission Room card. Attendance is derived from RSVPs (display only,
// never measurement) until attendance_verified flips true.
export default function ConferenceRoomCard({ room, attendees, user, accent, onRsvpChanged }) {
  const [expanded, setExpanded] = useState(false);
  const meta = statusMeta(room.status);
  const phase = phaseForStatus(room.status);
  const myRsvp = (attendees || []).find((a) => a.fellow_email === user?.email);
  const domainColor = domainAccent(room.domain_focus);
  const countdown = roomCountdown(room);

  const dateRange =
    room.start_date && room.end_date
      ? `${format(parseISO(room.start_date), 'MMM d')}–${format(parseISO(room.end_date), 'MMM d, yyyy')}`
      : room.start_date
        ? format(parseISO(room.start_date), 'MMM d, yyyy')
        : '';

  const focusCounts = {};
  (attendees || []).forEach((a) => { if (a.focus_area) focusCounts[a.focus_area] = (focusCounts[a.focus_area] || 0) + 1; });
  const host = hostLabel(room.official_url);

  return (
    <article
      className="rounded-2xl p-4 flex flex-col relative overflow-hidden"
      style={{
        background: phase === 'done' ? B.cream : '#fff',
        border: `1px solid ${phase === 'live' ? `${domainAccent(room.domain_focus)}55` : B.border}`,
        borderLeft: `3px solid ${domainColor}`,
        opacity: phase === 'done' ? 0.85 : 1,
      }}
    >
      {/* You're-in stamp */}
      {myRsvp && (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
          style={{ background: B.navy, color: '#fff' }}
        >
          <Check className="w-2.5 h-2.5" /> {myRsvp.status === 'waitlist' ? 'Waitlist' : "You're in"}
        </span>
      )}

      <div className="flex items-start gap-2 mb-1 pr-16">
        <div className="flex flex-col gap-1 min-w-0">
          {room.conference_series && (
            <span className="self-start text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: domainColor }}>
              {room.conference_series}
            </span>
          )}
          <h3 className="text-sm font-bold leading-tight" style={{ color: B.navy }}>{room.conference_name}</h3>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[11px]" style={{ color: B.muted }}>
        {dateRange && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateRange}</span>}
        {countdown && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: countdown.kind === 'live' ? `${B.gold}22` : `${domainColor}14`, color: countdown.kind === 'live' ? B.gold : domainColor }}
          >
            {countdown.kind === 'live' ? <Radio className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />} {countdown.label}
          </span>
        )}
        {(room.city || room.country) && (
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {[room.city, room.country].filter(Boolean).join(', ')}</span>
        )}
        {room.domain_focus && <span className="inline-flex items-center gap-1">· {disciplineLabel(room.domain_focus)}</span>}
      </div>

      {room.description && (
        <p
          className="text-xs leading-relaxed mb-2"
          style={{ color: B.navy, display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {room.description}
          {!expanded && room.description.length > 90 && (
            <button type="button" onClick={() => setExpanded(true)} className="ml-1 text-[10px] font-semibold" style={{ color: domainColor }}>Read</button>
          )}
          {expanded && (
            <button type="button" onClick={() => setExpanded(false)} className="ml-1 text-[10px] font-semibold" style={{ color: B.muted }}>Less</button>
          )}
        </p>
      )}

      {(room.focus_areas || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(room.focus_areas || []).map((f) => (
            <span
              key={f.key}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${domainColor}12`, color: domainColor }}
            >
              {f.label}{focusCounts[f.key] ? ` · ${focusCounts[f.key]}` : ''}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2 mt-auto">
        <div className="flex items-center gap-2">
          <AvatarCluster items={attendees || []} accent={domainColor} size={22} />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: B.navy }}>
            {(attendees || []).length} attending
          </span>
        </div>
        {host && (
          <a
            href={room.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: B.muted }}
          >
            {host} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {room.facilitator_name && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: B.sand, color: B.navy }}>
            {room.facilitator_name[0]}
          </span>
          <span className="text-[10px]" style={{ color: B.muted }}>{room.facilitator_name} · facilitating</span>
        </div>
      )}

      {room.patron_of_record_name && (
        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 mb-1" style={{ background: `${B.gold}12`, border: `1px solid ${B.gold}33` }}>
          <Crown className="w-3 h-3 shrink-0" style={{ color: B.gold }} />
          <span className="text-[10px] font-semibold" style={{ color: B.gold }}>Patron of Record</span>
          <span className="text-[10px]" style={{ color: B.navy }}>{room.patron_of_record_name}</span>
        </div>
      )}

      {!room.attendance_verified && (attendees || []).length > 0 && (
        <p className="text-[9px] italic mb-1" style={{ color: B.muted }}>
          Declared attendance · pending independent verification
        </p>
      )}

      <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
    </article>
  );
}
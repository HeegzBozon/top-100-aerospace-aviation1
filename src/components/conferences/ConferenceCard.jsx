import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import AvatarCluster from '@/components/conference-room/AvatarCluster';
import {
  B, circuitLabel, conferenceHref, coverFor, dateRangeLabel, disciplineLabel,
  domainAccent, placeLabel,
} from './conferenceConfig';

// One conference on the circuit, read as a printed entry: the series in copper small caps,
// the name in the house serif, the dates and the place beneath it, and the Fellows already
// standing in the room. Nothing on the card is placed by payment or availability — it is an
// index, and the reader walks it in date order.
export default function ConferenceCard({ room, attendees = [], attending = false, hostView = false }) {
  if (!room) return null;
  const accent = domainAccent(room.domain_focus) || B.copper;
  const cover = coverFor(room.cover_key);
  const dateLabel = dateRangeLabel(room);
  const place = placeLabel(room);
  const standing = attendees.length;

  return (
    <Link
      to={conferenceHref(room.id)}
      className="group block overflow-hidden rounded-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2"
      style={{ background: '#fff', border: `1px solid ${B.border}`, borderTop: `2px solid ${accent}` }}
    >
      {cover && (
        <div className="relative h-24 overflow-hidden">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(30,58,90,0.15), rgba(30,58,90,0.82))' }}
          />
          <span
            className="absolute bottom-2 left-3 text-[9px] font-bold uppercase tracking-[0.24em]"
            style={{ color: B.gold }}
          >
            {room.conference_series || 'Conference'}
          </span>
        </div>
      )}

      <div className="px-3.5 py-3">
        {!cover && (room.conference_series || room.organizer) && (
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
            {room.conference_series || room.organizer}
          </p>
        )}

        <h3 className="mt-1 font-heading text-[17px] leading-snug" style={{ color: B.navy }}>
          {room.conference_name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]" style={{ color: B.muted }}>
          {dateLabel && <span>{dateLabel}</span>}
          {place && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {place}
            </span>
          )}
        </div>

        {room.domain_focus && (
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
            {disciplineLabel(room.domain_focus)}
          </p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2 border-t pt-2.5" style={{ borderColor: B.border }}>
          <div className="flex min-w-0 items-center gap-1.5">
            <AvatarCluster items={attendees} accent={accent} size={20} max={3} />
            <span className="truncate text-[10.5px]" style={{ color: B.muted }}>
              {standing === 0
                ? 'No one declared yet'
                : `${standing} ${standing === 1 ? 'Fellow' : 'Fellows'} going`}
            </span>
          </div>

          <span className="flex shrink-0 items-center gap-1.5">
            {attending && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                style={{ background: `${B.copper}14`, color: B.copper }}
              >
                You're going
              </span>
            )}
            <span className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: hostView ? B.navy : B.muted }}>
              {hostView ? room.status : circuitLabel(room)}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: accent }} />
          </span>
        </div>
      </div>
    </Link>
  );
}
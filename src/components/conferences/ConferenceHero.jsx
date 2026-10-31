import { CalendarDays, ExternalLink, MapPin, ShieldCheck, Ticket } from 'lucide-react';
import AvatarCluster from '@/components/conference-room/AvatarCluster';
import {
  B, circuitLabel, coverFor, dateRangeLabel, disciplineLabel, domainAccent, placeLabel,
} from './conferenceConfig';

// The conference as a masthead: the series, the name, the dates and the place, over the
// governed cover from the asset library. Everything printed here is the host's own record —
// nothing is placed by payment, availability or sponsorship.
export default function ConferenceHero({ room, attendees = [], host }) {
  const accent = domainAccent(room.domain_focus) || B.copper;
  const cover = coverFor(room.cover_key);
  const dateLabel = dateRangeLabel(room);
  const place = placeLabel(room);

  return (
    <header className="overflow-hidden rounded-sm" style={{ border: `1px solid ${B.border}`, background: B.navy }}>
      {cover ? (
        <div className="relative h-32 md:h-44">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(30,58,90,0.30) 0%, rgba(22,41,63,0.94) 100%)' }}
          />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 md:px-6">
            <HeroText room={room} dateLabel={dateLabel} place={place} accent={accent} light />
          </div>
        </div>
      ) : (
        <div className="px-4 pb-4 pt-5 md:px-6 md:pt-6">
          <HeroText room={room} dateLabel={dateLabel} place={place} accent={accent} />
        </div>
      )}

      <div
        className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 md:px-6"
        style={{ borderColor: 'rgba(250,248,245,0.14)', background: 'rgba(9,20,33,0.45)' }}
      >
        <div className="flex shrink-0 items-center gap-2">
          <AvatarCluster items={attendees} accent={accent} size={20} max={4} />
          <span className="text-[10.5px]" style={{ color: 'rgba(250,248,245,0.72)' }}>
            {attendees.length === 0
              ? 'No one declared yet'
              : `${attendees.length} ${attendees.length === 1 ? 'Fellow' : 'Fellows'} declared`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {room.registration_url && (
            <a
              href={room.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: B.gold }}
            >
              <Ticket className="h-3 w-3" /> Registration
            </a>
          )}
          {room.official_url && (
            <a
              href={room.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: 'rgba(250,248,245,0.62)' }}
            >
              Official site <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {host && (
            <span className="inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'rgba(250,248,245,0.62)' }}>
              <ShieldCheck className="h-3 w-3" /> {host}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroText({ room, dateLabel, place, accent, light = false }) {
  const ink = light ? '#faf8f5' : B.navy;
  const soft = light ? 'rgba(250,248,245,0.72)' : B.muted;

  return (
    <>
      <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: light ? B.gold : B.copper }}>
        {room.conference_series || room.organizer || 'Conference'}
      </p>
      <h1 className="mt-1 font-heading text-[26px] leading-tight md:text-4xl" style={{ color: ink }}>
        {room.conference_name}
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]" style={{ color: soft }}>
        {dateLabel && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {dateLabel}
          </span>
        )}
        {place && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {place}
          </span>
        )}
        {room.venue && <span className="truncate">{room.venue}</span>}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {room.domain_focus && (
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]"
            style={{ background: `${accent}22`, color: light ? B.cream : accent }}
          >
            {disciplineLabel(room.domain_focus)}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: soft }}>
          {circuitLabel(room)} · {room.status === 'draft' ? 'Draft' : 'Published'}
        </span>
      </div>

      {room.description && (
        <p className="mt-2.5 max-w-2xl text-[12px] leading-relaxed" style={{ color: light ? 'rgba(250,248,245,0.86)' : B.navy }}>
          {room.description}
        </p>
      )}
    </>
  );
}
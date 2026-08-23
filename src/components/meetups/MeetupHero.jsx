import React from 'react';
import { MapPin, Users, ShieldCheck } from 'lucide-react';
import moment from 'moment';
import { B, formatLabel, tierLabel, DEFAULT_COVER } from './meetupConfig';
import LiveCountdownChip from '@/components/event-energy/LiveCountdownChip';
import WhosGoing from '@/components/event-energy/WhosGoing';

// Partiful-grade full-bleed invite hero. The page IS the invite.
export default function MeetupHero({ event, attendees }) {
  const cover = event.cover_image_url || DEFAULT_COVER;
  const date = event.event_date ? moment(event.event_date) : null;
  const count = (attendees || []).length;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative h-[52vh] min-h-[380px] sm:h-[60vh] w-full">
        <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, rgba(22,41,63,0.30) 0%, rgba(22,41,63,0.72) 55%, ${B.navyDeep} 100%)` }}
        />
        <div className="relative h-full flex flex-col justify-end px-5 pb-7 sm:px-8 max-w-3xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className="inline-flex items-center text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              {formatLabel(event.experience_type)}
            </span>
            <span
              className="inline-flex items-center text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(201,168,124,0.22)', color: B.gold, border: `1px solid ${B.gold}55` }}
            >
              <ShieldCheck size={12} className="mr-1" />
              {tierLabel(event.member_tier)}
            </span>
            <LiveCountdownChip start={event.event_date} end={event.event_end_date} accent={B.gold} />
          </div>
          <h1 className="font-heading text-white text-3xl sm:text-5xl leading-tight tracking-tight">{event.title}</h1>
          {date && <p className="text-white/85 mt-2 text-sm sm:text-base">{date.format('dddd, MMMM D · h:mm A')}</p>}
          {event.location && (
            <p className="text-white/70 mt-1 text-sm flex items-center">
              <MapPin size={13} className="mr-1.5" />
              {event.location}
            </p>
          )}
          <div className="mt-3">
            <WhosGoing items={attendees} count={count} hostName={event.host_name} accent={B.gold} tone="light" borderColor={B.navyDeep} />
          </div>
        </div>
      </div>
    </div>
  );
}
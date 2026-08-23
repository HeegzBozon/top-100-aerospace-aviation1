import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import moment from 'moment';
import { B, formatLabel, tierLabel, DEFAULT_COVER } from './meetupConfig';

export default function MeetupCard({ event }) {
  const cover = event.cover_image_url || DEFAULT_COVER;
  const date = event.event_date ? moment(event.event_date) : null;
  const count = (event.attendees || []).length;

  return (
    <Link
      to={`/meetups/${event.id}`}
      className="group block rounded-2xl overflow-hidden transition hover:shadow-lg"
      style={{ border: `1px solid ${B.border}`, background: B.cream }}
    >
      <div className="relative h-36 w-full overflow-hidden">
        <img
          src={cover}
          alt=""
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, rgba(22,41,63,0.20) 0%, ${B.navyDeep} 100%)` }}
        />
        <div className="absolute bottom-3 left-3 right-3">
          <span
            className="inline-block text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full mb-1.5"
            style={{ background: 'rgba(201,168,124,0.25)', color: B.gold, border: `1px solid ${B.gold}55` }}
          >
            {formatLabel(event.experience_type)}
          </span>
          <h3 className="font-heading text-white text-lg leading-snug line-clamp-2">{event.title}</h3>
        </div>
      </div>
      <div className="p-3.5">
        {date && <p className="text-xs mb-1" style={{ color: B.navy }}>{date.format('MMM D · h:mm A')}</p>}
        {event.location && (
          <p className="text-xs flex items-center mb-1.5" style={{ color: B.muted }}>
            <MapPin size={11} className="mr-1" />
            {event.location}
          </p>
        )}
        <p className="text-xs flex items-center" style={{ color: B.muted }}>
          <Users size={11} className="mr-1" />
          {count} attending · {tierLabel(event.member_tier)}
        </p>
      </div>
    </Link>
  );
}
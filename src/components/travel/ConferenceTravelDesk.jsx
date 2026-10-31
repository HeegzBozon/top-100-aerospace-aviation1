import { BedDouble, Plane } from 'lucide-react';
import { B, dateRangeLabel } from '@/components/conferences/conferenceConfig';
import { EXPEDIA_AFFILIATE_URL } from './travelConfig';

// The travel desk on a conference page: the venue and dates set out plainly, and one
// way through to plan the stay. A utility, never a listing; it is read by nothing else.
export default function ConferenceTravelDesk({ room, accent = B.copper }) {
  const where = [room.venue, room.city, room.country].filter(Boolean).join(' · ');
  return (
    <section className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>
        Travel desk
      </p>
      <p className="mt-1 font-heading text-[16px] leading-snug" style={{ color: B.navy }}>
        Plan your stay
      </p>
      <dl className="mt-2 space-y-1 text-[11.5px]" style={{ color: B.navy }}>
        <div className="flex gap-2"><dt style={{ color: B.muted }}>Dates</dt><dd>{dateRangeLabel(room)}</dd></div>
        {where && <div className="flex gap-2"><dt style={{ color: B.muted }}>Venue</dt><dd className="min-w-0">{where}</dd></div>}
      </dl>
      <a
        href={EXPEDIA_AFFILIATE_URL}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
        style={{ background: accent }}
      >
        <BedDouble className="h-3.5 w-3.5" /> Find stays & flights <Plane className="h-3 w-3" />
      </a>
      <p className="mt-2 text-[9.5px] leading-relaxed" style={{ color: B.muted }}>
        Opens Expedia. TOP 100 may earn a commission on bookings, at no cost to you.
        Expedia is not affiliated with this conference.
      </p>
    </section>
  );
}
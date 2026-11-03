import { Link } from 'react-router-dom';
import { ArrowLeft, BedDouble, Plane } from 'lucide-react';
import { B } from '@/components/attendee-journey/journeyConfig';
import { EXPEDIA_AFFILIATE_URL } from '@/components/travel/travelConfig';
import ForaWaitlist from '@/components/travel/ForaWaitlist';

// Field Notes: the travel section, and the advisory desk behind it. The guides are
// not written yet and the desk is not open, so this page is a teaser with exactly one
// action on it — the waitlist — beside the booking link a reader can use today.
export default function TravelAdvisory() {
  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5 md:px-8 md:pt-10">
        <Link
          to="/conferences/plan"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: B.copper }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> The travel desk
        </Link>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
          Coming soon
        </p>
        <h1 className="mt-2 font-heading text-[34px] leading-[1.05] md:text-[44px]" style={{ color: B.navy }}>
          Field Notes
        </h1>
        <p className="mt-3 max-w-xl font-heading text-[16px] italic leading-relaxed" style={{ color: B.copper }}>
          A travel section from the road.
        </p>

        <div className="mt-5 space-y-3 text-[13.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.82)' }}>
          <p>
            Field Notes will carry short guides from the road: the shows, launches and aerospace cities worth
            the trip, the people I meet there, where to stay and what locals know.
          </p>
          <p>
            TOP 100 has joined the Expedia Group Travel Creator Program, so these guides will include booking
            links. Some of those links earn us a commission, and we will mark them. Picks are not for sale, and
            none of this touches selection.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            href={EXPEDIA_AFFILIATE_URL}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
            style={{ background: B.copper }}
          >
            <Plane className="h-3.5 w-3.5" /> Search on Expedia
          </a>
          <span className="text-[10px] leading-relaxed" style={{ color: B.muted }}>
            TOP 100 may earn a commission on bookings, at no cost to you.
          </span>
        </div>

        <section className="mt-9 rounded-sm p-5 md:p-6" style={{ background: B.navy }}>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.24em]" style={{ color: B.gold }}>
            Coming next
          </p>
          <h2 className="mt-2 flex items-center gap-2 font-heading text-[24px] leading-snug text-white">
            <BedDouble className="h-5 w-5" style={{ color: B.gold }} />
            Fora Travel Advisory
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.78)' }}>
            For bigger trips — the launch you have waited years for, the show that sells out, the itinerary with
            three cities in it — we are opening access to a Fora travel advisor. Someone who does this for a
            living, working from the short list we would give a friend.
          </p>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.6)' }}>
            I will tell you exactly how it works and how I get paid before it opens. Nothing here touches
            selection.
          </p>
          <ForaWaitlist surface="travel_advisory" />
        </section>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, Compass, Landmark, Plane } from 'lucide-react';
import ConferenceAppBar from '@/components/conferences/os/ConferenceAppBar';
import useConferenceMenus from '@/components/conferences/os/useConferenceMenus';
import { EXPEDIA_AFFILIATE_URL } from '@/components/travel/travelConfig';
import { B } from '@/components/attendee-journey/journeyConfig';

const Card = ({ to, icon: Icon, kicker, title, body }) => (
  <Link to={to} className="flex items-start gap-3 rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
    <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: B.copper }} />
    <span className="min-w-0 flex-1">
      <span className="block text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>{kicker}</span>
      <span className="mt-0.5 block font-heading text-[16px]" style={{ color: B.navy }}>{title}</span>
      <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: B.muted }}>{body}</span>
    </span>
    <ArrowUpRight className="h-4 w-4 shrink-0" style={{ color: B.muted }} />
  </Link>
);

// Stage 01 — Plan. Half the stage is choosing the show (discover one, or host one);
// half is getting there.
export default function ConferencePlanHub() {
  useConferenceMenus();
  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <ConferenceAppBar app="plan" />
      <div className="mx-auto grid w-full max-w-3xl gap-4 px-4 pb-24 pt-4 md:grid-cols-2 md:px-8 md:pt-8">
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>01 · Choose the show</p>
          <div className="mt-2 space-y-2">
            <Card to="/conferences/discover" icon={Compass} kicker="Discover" title="Find a conference" body="Every show the network holds rooms in, in date order." />
            <Card to="/conferences/host" icon={Landmark} kicker="Host" title="Stage a conference" body="Set the run of show and open rooms for Fellows." />
          </div>
        </section>
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>02 · Get there</p>
          <div className="mt-2 rounded-sm p-4" style={{ background: B.navy }}>
            <BedDouble className="h-6 w-6" style={{ color: B.gold }} />
            <p className="mt-2 font-heading text-[19px] leading-snug text-white">Book your stay and flights</p>
            <p className="mt-1 text-[11.5px] leading-snug" style={{ color: 'rgba(250,248,245,0.7)' }}>
              Hotels near the venue, flights and packages, in one search.
            </p>
            <a
              href={EXPEDIA_AFFILIATE_URL}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ background: B.copper }}
            >
              <Plane className="h-3.5 w-3.5" /> Search on Expedia
            </a>
            <p className="mt-3 text-[9.5px] leading-relaxed" style={{ color: 'rgba(250,248,245,0.55)' }}>
              TOP 100 may earn a commission on bookings, at no cost to you.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
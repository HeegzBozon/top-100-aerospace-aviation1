import { Link } from 'react-router-dom';
import { ArrowRight, Users } from 'lucide-react';
import { PARTY, launchLine } from './partyConfig';
import { stampOf, timeOf } from '@/components/theatre/theatreConfig';

// One party on the board: the mission, the hour, the host, and how many seats are taken.
export default function PartyCard({ party, going = false, guests = 0 }) {
  return (
    <Link
      to={`/launch-party/${party.invite_code}`}
      className="block rounded-lg p-4 transition-shadow hover:shadow-md"
      style={{ background: PARTY.paper, border: `1px solid ${PARTY.ruleOnPaper}`, boxShadow: '0 6px 18px -14px rgba(30,58,90,0.55)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: PARTY.copper }}>
            {party.status === 'live' ? 'On the air' : 'Invitation'}
          </p>
          <h3 className="mt-1 truncate font-heading text-lg leading-tight" style={{ color: PARTY.inkOnPaper }}>{party.title}</h3>
          <p className="mt-1 truncate text-xs" style={{ color: PARTY.bodyOnPaper }}>{party.launch_name}</p>
        </div>
        {going && (
          <span className="flex-none rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]" style={{ background: 'rgba(143,211,168,0.28)', color: '#2f6b4f' }}>
            You are in
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: PARTY.bodyOnPaper }}>
        <span>{stampOf(party.opens_at)}</span>
        <span aria-hidden>·</span>
        <span>lift-off {timeOf(party.net)}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {guests} {guests === 1 ? 'seat' : 'seats'}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[10px] uppercase tracking-[0.14em]" style={{ color: PARTY.bodyOnPaper }}>
          {party.host_name ? `Hosted by ${party.host_name}` : launchLine(party)}
        </p>
        <span className="inline-flex flex-none items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: PARTY.copper }}>
          Enter <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
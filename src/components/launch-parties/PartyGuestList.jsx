import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { GUEST_TONE, PARTY } from './partyConfig';

// The door list. Names and answers only: an address never prints on the door. Every other
// seat can be asked for time through AeroSync, which is where the conversation goes next.
export default function PartyGuestList({ guests = [], me }) {
  if (!guests.length) {
    return (
      <p className="rounded-lg px-4 py-6 text-center text-xs leading-relaxed" style={{ background: PARTY.paper, border: `1px dashed ${PARTY.ruleOnPaper}`, color: PARTY.bodyOnPaper }}>
        Nobody has taken a seat yet. Send the invitation and the door fills.
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-lg" style={{ background: PARTY.paper, border: `1px solid ${PARTY.ruleOnPaper}` }}>
      {guests.map((guest) => {
        const tone = GUEST_TONE[guest.status] || GUEST_TONE.going;
        const mine = me && guest.guest_email === me.email;
        return (
          <li key={guest.id} className="flex items-center justify-between gap-3 px-3 py-2.5" style={{ borderTop: `1px solid ${PARTY.ruleOnPaper}` }}>
            <div className="min-w-0">
              <p className="truncate text-sm" style={{ color: PARTY.inkOnPaper }}>
                {guest.guest_name || 'Fellow'}{mine ? ' (you)' : ''}
              </p>
              <span className="mt-0.5 inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ background: tone.plate, color: tone.ink }}>
                {tone.label}
              </span>
            </div>
            {!mine && (
              <Link
                to={`/aerosync/meetings?with=${encodeURIComponent(guest.guest_name || '')}&from=launch%20party`}
                className="inline-flex flex-none items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: PARTY.copper }}
              >
                <CalendarDays className="h-3 w-3" /> Ask for time
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
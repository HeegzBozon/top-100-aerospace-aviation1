import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { THEATRE } from './theatreConfig';
import TheatreChat from './TheatreChat';

// The room beside the bill: who is hosting this mission, the way into their party, and the
// chat itself. A mission nobody has hosted still keeps an open room, so the theatre is never
// a place without a voice.
export default function TheatreRoom({ launch }) {
  // undefined while the question is open, null when there is no party for this mission.
  const [party, setParty] = useState(undefined);

  useEffect(() => {
    if (!launch?.id) return undefined;
    let alive = true;
    setParty(undefined);
    base44.entities.LaunchParty
      .filter({ launch_id: launch.id }, '-created_date', 1)
      .then((rows) => alive && setParty(rows[0] || null))
      .catch(() => alive && setParty(null));
    return () => {
      alive = false;
    };
  }, [launch?.id]);

  if (!launch) return null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2"
        style={{ background: THEATRE.plate, border: `1px solid ${THEATRE.line}` }}
      >
        <p className="min-w-0 truncate text-[10px]" style={{ color: THEATRE.body }}>
          {party === undefined && 'Finding the room…'}
          {party === null && 'No party on the books for this mission.'}
          {party && (
            <>
              <span className="font-semibold" style={{ color: THEATRE.ink }}>{party.title}</span>
              {party.host_name ? ` · hosted by ${party.host_name}` : ''}
            </>
          )}
        </p>
        <Link
          to={party ? `/launch-party/${party.invite_code}` : `/launch-parties?launch=${launch.id}`}
          className="inline-flex flex-none items-center gap-1.5 rounded px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
          style={{ background: 'rgba(184,115,51,0.18)', color: THEATRE.gold, border: `1px solid ${THEATRE.line}` }}
        >
          <Ticket className="h-3 w-3" /> {party ? 'Open the party' : 'Host a party'}
        </Link>
      </div>
      <div className="h-64">
        <TheatreChat
          launchId={launch.id}
          partyId={party?.id || ''}
          title={party ? 'Party chat' : 'Room chat'}
          hint={party ? 'Seats talking' : 'Open room'}
        />
      </div>
    </div>
  );
}
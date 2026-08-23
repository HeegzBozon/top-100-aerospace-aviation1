import { Network, CheckCircle2, Clock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConferencePhaseHeader from './ConferencePhaseHeader';

function DebriefRow({ room, attendees, accent }) {
  const list = attendees || [];
  return (
    <div className="rounded-xl p-3" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy }}>{room.conference_name}</h4>
        {room.attendance_verified ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: B.gold }}>
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: B.muted }}>
            <Clock className="w-3 h-3" /> Pending
          </span>
        )}
      </div>

      <p className="text-[10px] mb-2" style={{ color: B.muted }}>{list.length} declared attendees · reconnect below</p>

      {list.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {list.slice(0, 8).map((a) => (
            <span key={a.id} className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: B.cream, color: B.navy }}>
              {a.fellow_name || a.fellow_email}
            </span>
          ))}
          {list.length > 8 && <span className="text-[10px] self-center" style={{ color: B.muted }}>+{list.length - 8}</span>}
        </div>
      ) : (
        <p className="text-[10px]" style={{ color: B.muted }}>No declared attendees on record.</p>
      )}

      {!room.attendance_verified && (
        <p className="text-[9px] italic mt-2" style={{ color: B.muted }}>
          Declared attendance · pending independent verification for Flightography
        </p>
      )}
    </div>
  );
}

export default function ConferencePostEventPanel({ pastRooms, rsvpsByRoom, accent }) {
  return (
    <section>
      <ConferencePhaseHeader
        num="03"
        icon={Network}
        label="Post-Event"
        subtitle="Reconnect and verify attendance for the record"
        count={pastRooms.length}
        accent={accent}
      />
      {pastRooms.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ background: '#fff', border: `1px dashed ${B.border}` }}>
          <Network className="mx-auto mb-2" size={20} style={{ color: B.muted }} />
          <p className="text-xs font-semibold" style={{ color: B.navy }}>No past rooms yet.</p>
          <p className="text-[11px] mt-0.5" style={{ color: B.muted }}>Closed rooms land here for follow-up and verification.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pastRooms.map((r) => (
            <DebriefRow key={r.id} room={r} attendees={rsvpsByRoom[r.id] || []} accent={accent} />
          ))}
        </div>
      )}
    </section>
  );
}
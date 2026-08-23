import { CalendarCheck, Compass } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import RsvpControl from './RsvpControl';
import ConferencePhaseHeader from './ConferencePhaseHeader';

function AttendanceCard({ room, myRsvp, attendees, user, accent, onRsvpChanged }) {
  const focus = myRsvp?.focus_area;
  const subRoom = focus ? (attendees || []).filter((a) => a.focus_area === focus) : attendees || [];
  const others = subRoom.filter((a) => a.fellow_email !== user?.email);

  return (
    <div className="rounded-xl p-3" style={{ background: '#fff', border: `1px solid ${accent}33` }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold leading-tight" style={{ color: B.navy }}>{room.conference_name}</h4>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
          <CalendarCheck className="w-3 h-3" /> Declared
        </span>
      </div>

      {focus && (
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5" style={{ background: `${accent}12`, color: accent }}>
          {focus}
        </span>
      )}
      {myRsvp?.notes && (
        <p className="text-[11px] italic leading-relaxed mb-2" style={{ color: B.muted }}>“{myRsvp.notes}”</p>
      )}

      <div className="mt-1 mb-2">
        <p className="text-[9px] uppercase tracking-[0.12em] font-semibold mb-1.5" style={{ color: B.muted }}>
          {focus ? 'In your focus sub-room' : 'Declared attendees'}
        </p>
        {others.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {others.slice(0, 6).map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: B.cream, color: B.navy }}>
                {a.fellow_name || a.fellow_email}
              </span>
            ))}
            {others.length > 6 && <span className="text-[10px] self-center" style={{ color: B.muted }}>+{others.length - 6}</span>}
          </div>
        ) : (
          <p className="text-[10px]" style={{ color: B.muted }}>You're the first in this sub-room. Invite a Fellow.</p>
        )}
      </div>

      <RsvpControl room={room} myRsvp={myRsvp} user={user} accent={accent} onChanged={onRsvpChanged} />
    </div>
  );
}

export default function ConferenceAttendancePanel({ myRooms, user, accent, onRsvpChanged }) {
  return (
    <section>
      <ConferencePhaseHeader
        num="02"
        icon={CalendarCheck}
        label="Attendance"
        subtitle="Your declared rooms and focus sub-rooms"
        count={myRooms.length}
        accent={accent}
      />
      {myRooms.length === 0 ? (
        <div className="rounded-xl p-5 text-center" style={{ background: '#fff', border: `1px dashed ${B.border}` }}>
          <Compass className="mx-auto mb-2" size={20} style={{ color: B.muted }} />
          <p className="text-xs font-semibold" style={{ color: B.navy }}>You haven't declared attendance yet.</p>
          <p className="text-[11px] mt-0.5" style={{ color: B.muted }}>Find a room above and declare to coordinate.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {myRooms.map(({ room, myRsvp, attendees }) => (
            <AttendanceCard key={room.id} room={room} myRsvp={myRsvp} attendees={attendees} user={user} accent={accent} onRsvpChanged={onRsvpChanged} />
          ))}
        </div>
      )}
    </section>
  );
}
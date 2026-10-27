import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Radar, RotateCcw } from 'lucide-react';
import ConferenceRoomCard from '@/components/conference-room/ConferenceRoomCard';
import NetworkingHero from '@/components/networking/NetworkingHero';
import { BTN, BTN_BASE, C } from '@/components/crm/crmConfig';

// The shows on the calendar, the rooms Fellows have opened in each one, and who is already
// standing in them. The loading, failed and empty states are all designed: a room that
// could not be read says so and offers to read again, and an empty calendar says what will
// land here rather than going quiet.
export default function RoomsAheadBoard({ rooms }) {
  const { state, ahead, nextRoom, laterRooms, attendeesFor, myRsvpFor, me, refresh, retry } = rooms;

  if (state.failed) {
    return (
      <div className="mt-5 rounded-lg p-5 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <p className="font-heading text-lg" style={{ color: C.navy }}>
          The rooms could not be read. Nothing is lost.
        </p>
        <button type="button" onClick={retry} className={`${BTN_BASE} mt-3`} style={BTN.navy}>
          <RotateCcw className="h-3 w-3" /> Read them again
        </button>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="mt-5 flex items-center gap-2.5 rounded-lg p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: C.copper }} />
        <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
          Reading the rooms
        </span>
      </div>
    );
  }

  if (ahead.length === 0) {
    return (
      <div className="mt-5 rounded-lg p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <Radar className="h-5 w-5" style={{ color: C.copper }} />
        <h3 className="mt-3 font-heading text-xl" style={{ color: C.navy }}>
          No room is open yet.
        </h3>
        <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: C.muted }}>
          When the next show opens its room, it lands here first — with the Fellows already declared, and
          the focus areas they are standing in for. Until then, the calendar holds everything the chamber
          has running.
        </p>
        <Link
          to="/events"
          className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: C.copper }}
        >
          Open the calendar
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-8">
      <NetworkingHero
        room={nextRoom}
        attendees={attendeesFor(nextRoom)}
        myRsvp={myRsvpFor(nextRoom)}
        user={me}
        onChanged={refresh}
      />

      {laterRooms.length ? (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: C.copper }}>
            Further out
          </p>
          <h3 className="mt-1.5 font-heading text-xl" style={{ color: C.navy }}>
            {laterRooms.length} more room{laterRooms.length === 1 ? '' : 's'} on the calendar.
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {laterRooms.map((room) => (
              <ConferenceRoomCard
                key={room.id}
                room={room}
                attendees={attendeesFor(room)}
                user={me}
                accent={C.navy}
                onRsvpChanged={refresh}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
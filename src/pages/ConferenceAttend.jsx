import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, LogIn, Radar, RotateCcw, Signal, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ConferenceAppBar from '@/components/conferences/os/ConferenceAppBar';
import StandingReadout from '@/components/conferences/os/StandingReadout';
import NetworkPersonRow from '@/components/conferences/os/NetworkPersonRow';
import ConferenceCard from '@/components/conferences/ConferenceCard';
import useConferences from '@/components/conferences/useConferences';
import { useConnectionMap } from '@/components/fellow-home/useConnections';
import { phaseForRoom } from '@/components/conference-room/conferenceRoomConfig';
import { B, DISCOVER_HREF } from '@/components/conferences/conferenceConfig';

// ATTEND & NETWORK — the room, and the people standing in it.
//
// What this Fellow has declared for, read in date order, and then the one thing a
// conference is actually for: the people in the same rooms. Every person is reachable
// on the same row they are listed on, so the roster is where a meeting is made rather
// than a list of counts. Declarations are coordination only and are never read by
// discovery, ranking, or scoring.
export default function ConferenceAttend() {
  const { user } = useAuth();
  const { state, mine, attendeesFor, me, retry } = useConferences();
  const { map, connect, accept, decline, disconnect } = useConnectionMap(user?.email);
  const [busyEmail, setBusyEmail] = useState(null);

  const people = useMemo(() => {
    const byEmail = new Map();
    mine.forEach((room) => {
      attendeesFor(room).forEach((rsvp) => {
        const email = rsvp.fellow_email;
        if (!email || email === me?.email) return;
        const entry = byEmail.get(email) || {
          email,
          name: rsvp.fellow_name,
          avatar: rsvp.fellow_avatar_url,
          rooms: [],
        };
        if (room.conference_name && !entry.rooms.includes(room.conference_name)) {
          entry.rooms.push(room.conference_name);
        }
        byEmail.set(email, entry);
      });
    });
    return [...byEmail.values()].sort((a, b) => b.rooms.length - a.rooms.length);
  }, [mine, attendeesFor, me]);

  const run = useCallback(async (email, action) => {
    setBusyEmail(email);
    try {
      await action();
    } catch {
      // The pill reports its own state; a failed request simply leaves it as it was.
    } finally {
      setBusyEmail(null);
    }
  }, []);

  const ahead = mine.filter((room) => phaseForRoom(room) !== 'done').length;
  const cells = [
    { label: 'Declared', value: mine.length },
    { label: 'Ahead', value: ahead },
    { label: 'People', value: people.length },
  ];

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <ConferenceAppBar app="attend" />

      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5 md:px-8 md:pb-16 md:pt-8">
        <header data-hh-module="Attend and network">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
            AeroSync · Attend &amp; Network
          </p>
          <h1 className="mt-1 font-heading text-[28px] leading-tight md:text-4xl" style={{ color: B.navy }}>
            Stand in the room
          </h1>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
            Your declarations, the conference ahead of you, and the Fellows already in the
            same rooms — each one reachable from the row they are standing on.
          </p>
        </header>

        <div className="mt-4">
          <StandingReadout cells={cells} />
        </div>

        {state.failed ? (
          <div className="mt-6 rounded-sm px-5 py-6 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <Signal className="mx-auto h-5 w-5" style={{ color: B.copper }} />
            <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>Your rooms could not be read.</p>
            <p className="mt-1 text-[11.5px]" style={{ color: B.muted }}>Nothing is lost. It is only the line.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              <RotateCcw className="h-3 w-3" /> Read it again
            </button>
          </div>
        ) : state.loading ? (
          <div className="mt-8 flex flex-col items-center gap-2 py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
              Reading your rooms
            </p>
          </div>
        ) : !user ? (
          <div className="mt-6 rounded-sm px-5 py-8" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <LogIn className="h-5 w-5" style={{ color: B.copper }} />
            <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>Your standing is your own.</h2>
            <p className="mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              A declaration, a room, and the people you stood beside belong to the Fellow who
              made them. Sign in and the circuit answers with yours.
            </p>
            <button
              type="button"
              onClick={() => base44.auth.redirectToLogin('/conferences/attend')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              <LogIn className="h-3 w-3" /> Sign in
            </button>
          </div>
        ) : mine.length === 0 ? (
          <div className="mt-6 rounded-sm px-5 py-8" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <Radar className="h-5 w-5" style={{ color: B.copper }} />
            <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>No room yet.</h2>
            <p className="mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              Nothing is declared. Find the conference you are going to and declare it — the
              roster, the focus areas and everyone else in it open the moment you do.
            </p>
            <Link
              to={DISCOVER_HREF}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.copper, color: '#fff' }}
            >
              Discover the circuit
            </Link>
          </div>
        ) : (
          <>
            <section data-hh-module="You're going" className="mt-7">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
                  You're going
                </h2>
                <span className="text-[10px]" style={{ color: B.muted }}>{mine.length}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {mine.map((room) => (
                  <ConferenceCard
                    key={room.id}
                    room={room}
                    attendees={attendeesFor(room)}
                    attending
                  />
                ))}
              </div>
            </section>

            <section data-hh-module="People in your rooms" className="mt-9">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
                  People in your rooms
                </h2>
                <span className="text-[10px]" style={{ color: B.muted }}>{people.length}</span>
              </div>

              {people.length === 0 ? (
                <div className="mt-3 rounded-sm px-4 py-6" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
                  <Users className="h-4 w-4" style={{ color: B.copper }} />
                  <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>
                    You are the first one in.
                  </p>
                  <p className="mt-1 max-w-md text-[12px] leading-relaxed" style={{ color: B.muted }}>
                    No one else has declared for these rooms yet. The roster fills as they do —
                    and every one of them becomes someone to meet from here.
                  </p>
                </div>
              ) : (
                <div className="mt-3 flex flex-col gap-1.5">
                  {people.map((person) => (
                    <NetworkPersonRow
                      key={person.email}
                      person={person}
                      viewer={user}
                      record={map[person.email]}
                      busy={busyEmail === person.email}
                      accent={B.copper}
                      onConnect={(target) => run(person.email, () => connect(target))}
                      onAccept={(record, target) => run(target, () => accept(record, target))}
                      onDecline={(record, target) => run(target, () => decline(record, target))}
                      onDisconnect={(record, target) => run(target, () => disconnect(record, target))}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Radar, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConferenceRoomCard from '@/components/conference-room/ConferenceRoomCard';
import { phaseForRoom } from '@/components/conference-room/conferenceRoomConfig';
import NetworkingHero from '@/components/networking/NetworkingHero';
import BeforeYouGo from '@/components/networking/BeforeYouGo';
import HomeDock from '@/components/home-v3/HomeDock';

const ROOM_STATUSES = ['open', 'live'];

// Networking. A conferencing layer inside the platform: the shows on the
// calendar, the rooms the Fellows have opened in them, who is standing in each
// one, and what to have in place before you go. One canonical entity behind it
// — ConferenceRoom, with ConferenceRsvp for the declarations.
export default function Networking() {
  const [state, setState] = useState({ loading: true, failed: false });
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ loading: true, failed: false });

    (async () => {
      const me = await base44.auth.me().catch(() => null);
      const email = me?.email;

      const results = await Promise.allSettled([
        base44.entities.ConferenceRoom.list('-start_date', 60),
        base44.entities.ConferenceRsvp.list('-declared_at', 300),
        email ? base44.entities.Service.count({ provider_user_email: email, is_active: true }) : 0,
        email ? base44.entities.Connection.count({ recipient_email: email, status: 'pending' }) : 0,
        email ? base44.entities.Nominee.filter({ nominee_email: email }, { limit: 1 }) : [],
      ]);
      if (!alive) return;

      if (results.every((result) => result.status === 'rejected')) {
        setState({ loading: false, failed: true });
        return;
      }

      const rows = (index) => {
        const value = results[index].status === 'fulfilled' ? results[index].value : null;
        return Array.isArray(value) ? value : value?.items || [];
      };
      const num = (index) => {
        const value = results[index].status === 'fulfilled' ? results[index].value : 0;
        return typeof value === 'number' ? value : 0;
      };

      setData({
        me,
        rooms: rows(0),
        rsvps: rows(1),
        availability: num(2),
        pendingIntros: num(3),
        nominee: rows(4)[0] || null,
      });
      setState({ loading: false, failed: false });
    })();

    return () => {
      alive = false;
    };
  }, [attempt, refreshKey]);

  // Rooms that are still ahead of us, in the order they arrive. A room that has
  // already closed belongs to the archive, not here.
  const ahead = useMemo(() => {
    return (data?.rooms || [])
      .filter((room) => ROOM_STATUSES.includes(room.status) && phaseForRoom(room) !== 'done')
      .sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
  }, [data]);

  const nextRoom = useMemo(() => ahead.find((room) => phaseForRoom(room) === 'live') || ahead[0] || null, [ahead]);
  const laterRooms = ahead.filter((room) => room.id !== nextRoom?.id);

  const rsvpsByRoom = useMemo(() => {
    const map = {};
    (data?.rsvps || []).forEach((rsvp) => {
      (map[rsvp.room_id] = map[rsvp.room_id] || []).push(rsvp);
    });
    return map;
  }, [data]);

  const me = data?.me || null;
  const attendeesFor = (room) => (room ? rsvpsByRoom[room.id] || [] : []);
  const myRsvpFor = (room) => attendeesFor(room).find((rsvp) => rsvp.fellow_email === me?.email) || null;

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-14">
        <header>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            AeroSync CRM
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.24em]" style={{ color: B.muted }}>
            Community Relationship Manager
          </p>
          <h1 className="mt-2 font-heading text-3xl leading-tight md:text-5xl" style={{ color: B.navy }}>
            The rooms ahead.
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed" style={{ color: B.muted }}>
            The shows on the calendar, the rooms Fellows have opened in each one, and who is already
            standing in them. Declare your attendance, and the introductions follow.
          </p>
        </header>

        {state.failed ? (
          <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: '#FFFFFF', border: B.border }}>
            <p className="font-heading text-lg" style={{ color: B.navy }}>
              The rooms could not be read. Nothing is lost.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ background: B.navy, color: B.cream }}
            >
              <RotateCcw className="h-3 w-3" /> Read them again
            </button>
          </div>
        ) : state.loading ? (
          <div className="mt-8 flex items-center gap-2.5 rounded-2xl p-5" style={{ background: '#FFFFFF', border: B.border }}>
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: B.copper }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
              Reading the rooms
            </span>
          </div>
        ) : ahead.length === 0 ? (
          <div className="mt-8 rounded-2xl p-6" style={{ background: '#FFFFFF', border: B.border }}>
            <Radar className="h-5 w-5" style={{ color: B.copper }} />
            <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>
              No room is open yet.
            </h2>
            <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              When the next show opens its room, it lands here first — with the Fellows already
              declared, and the focus areas they are standing in for. Until then, the calendar holds
              everything the chamber has running.
            </p>
            <Link
              to="/events"
              className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: B.copper }}
            >
              Open the calendar
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <NetworkingHero
              room={nextRoom}
              attendees={attendeesFor(nextRoom)}
              myRsvp={myRsvpFor(nextRoom)}
              user={me}
              onChanged={() => setRefreshKey((key) => key + 1)}
            />

            {laterRooms.length ? (
              <section>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
                  Further out
                </p>
                <h2 className="mt-1.5 font-heading text-xl" style={{ color: B.navy }}>
                  {laterRooms.length} more room{laterRooms.length === 1 ? '' : 's'} on the calendar.
                </h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {laterRooms.map((room) => (
                    <ConferenceRoomCard
                      key={room.id}
                      room={room}
                      attendees={attendeesFor(room)}
                      user={me}
                      accent={B.navy}
                      onRsvpChanged={() => setRefreshKey((key) => key + 1)}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}

        <BeforeYouGo
          nominee={data?.nominee}
          availability={data?.availability || 0}
          pendingIntros={data?.pendingIntros || 0}
          user={me}
        />

        <div className="h-24" />
      </div>
      <HomeDock />
    </div>
  );
}
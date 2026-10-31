import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw, ShieldCheck, Signal, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ConferenceHero from '@/components/conferences/ConferenceHero';
import ConferenceModeSwitcher from '@/components/conferences/ConferenceModeSwitcher';
import ConferencePeople from '@/components/conferences/ConferencePeople';
import useConferenceRoom from '@/components/conferences/useConferenceRoom';
import RunOfShow from '@/components/conferences/RunOfShow';
import ConferenceLinks from '@/components/conferences/ConferenceLinks';
import RsvpControl from '@/components/conference-room/RsvpControl';
import FocusAreaBoard from '@/components/conference-room/FocusAreaBoard';
import NowFacilitatingRibbon from '@/components/conference-room/NowFacilitatingRibbon';
import { B, CONFERENCES_HREF, HOST_HREF, dateRangeLabel, domainAccent, placeLabel } from '@/components/conferences/conferenceConfig';

// One conference, held end to end: the record as a masthead, the declaration of attendance,
// the rooms inside it, and the people — with the connection and the note filed from the same
// place they were made. A host landing here is offered the way into the workspace that owns
// the record.
export default function ConferenceDetail() {
  const { id } = useParams();
  const { state, room, attendees, met, me, refresh, retry } = useConferenceRoom(id);

  // A conference that does not exist is answered as a missing page, not as a failed load —
  // and only once the read has finished, so a slow record is never served as a 404.
  const missing = !state.loading && state.missing;
  useEffect(() => {
    if (!missing) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, [missing]);

  const accent = domainAccent(room?.domain_focus) || B.copper;
  const myRsvp = room ? attendees.find((row) => row.fellow_email === me?.email) || null : null;
  const isHost = !!me && !!room && (me.role === 'admin' || room.facilitator_email === me.email);

  if (state.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2" style={{ background: B.cream }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
        <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          Reading the conference
        </p>
      </div>
    );
  }

  if (state.failed) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-5 text-center" style={{ background: B.cream }}>
        <Signal className="h-5 w-5" style={{ color: B.copper }} />
        <h1 className="mt-2 font-heading text-2xl" style={{ color: B.navy }}>This conference could not be read.</h1>
        <p className="mt-1 text-[12px]" style={{ color: B.muted }}>Nothing is lost. It is only the line.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: B.navy, color: '#fff' }}
        >
          <RotateCcw className="h-3 w-3" /> Try again
        </button>
      </div>
    );
  }

  if (missing || !room) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-5 text-center" style={{ background: B.cream }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>Not on the circuit</p>
        <h1 className="mt-2 font-heading text-2xl" style={{ color: B.navy }}>There is no conference at this address.</h1>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: B.muted }}>
          It may still be a draft with its host, or the address may have moved.
        </p>
        <Link
          to={CONFERENCES_HREF}
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: B.copper }}
        >
          <ArrowLeft className="h-3 w-3" /> Back to the circuit
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 md:px-8 md:pb-16 md:pt-8">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={CONFERENCES_HREF}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: B.muted }}
          >
            <ArrowLeft className="h-3 w-3" /> The circuit
          </Link>
          <ConferenceModeSwitcher mode="attend" />
        </div>

        <div className="mt-3">
          <ConferenceHero room={room} attendees={attendees} host={room.host_organization || room.facilitator_name} />
        </div>

        {isHost && (
          <Link
            to={HOST_HREF}
            className="mt-2 flex items-center justify-between gap-2 rounded-sm px-3 py-2"
            style={{ background: `${B.gold}14`, border: `1px solid ${B.gold}55` }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold" style={{ color: B.navy }}>
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: B.copper }} />
              You host this conference.
            </span>
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.copper }}>
              Open the workspace
            </span>
          </Link>
        )}

        {isHost && (
          <section className="mt-3">
            <RunOfShow room={room} accent={accent} onChanged={refresh} />
          </section>
        )}

        <NowFacilitatingRibbon room={room} accent={accent} className="mt-3" />

        <section className="mt-4 rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
          {me ? (
            <RsvpControl room={room} myRsvp={myRsvp} user={me} accent={accent} onChanged={refresh} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>
                  Attendance
                </p>
                <p className="mt-1 text-[12px] leading-relaxed" style={{ color: B.navy }}>
                  Declare your attendance to stand in the room and reach the Fellows in it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ background: B.navy, color: '#fff' }}
              >
                <UserPlus className="h-3 w-3" /> Sign in to attend
              </button>
            </div>
          )}
        </section>

        <div className="mt-3">
          <ConferenceLinks room={room} accent={accent} />
        </div>

        {me && (
          <section className="mt-3 rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <FocusAreaBoard room={room} attendees={attendees} myRsvp={myRsvp} user={me} accent={accent} onChanged={refresh} />
            {(room.focus_areas || []).length === 0 && (
              <p className="text-[12px] leading-relaxed" style={{ color: B.muted }}>
                This conference has not opened its rooms yet. The host sets them, and the
                people in each one organize from there.
              </p>
            )}
          </section>
        )}

        <section className="mt-3">
          <ConferencePeople
            room={room}
            attendees={attendees}
            met={met}
            user={me}
            accent={accent}
            onChanged={refresh}
          />
        </section>

        <footer className="mt-5 border-t pt-3" style={{ borderColor: B.border }}>
          <p className="text-[10.5px] leading-relaxed" style={{ color: B.muted }}>
            {dateRangeLabel(room)}{placeLabel(room) ? ` · ${placeLabel(room)}` : ''}
            {room.organizer ? ` · Staged by ${room.organizer}` : ''}
          </p>
          <p className="mt-1 text-[10px] italic" style={{ color: B.muted }}>
            Connections are mutual: information is exchanged only when both Fellows accept.
            Notes filed here are private to you.
          </p>
        </footer>
      </div>
    </div>
  );
}
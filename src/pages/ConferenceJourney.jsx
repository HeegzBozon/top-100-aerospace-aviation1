import { useCallback, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, LogIn, RotateCcw, Signal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ConferenceAppBar from '@/components/conferences/os/ConferenceAppBar';
import StandingReadout from '@/components/conferences/os/StandingReadout';
import useConferences from '@/components/conferences/useConferences';
import {
  ATTEND_HREF, B, circuitLabel, dateRangeLabel, disciplineLabel, placeLabel,
} from '@/components/conferences/conferenceConfig';
import useJourney from '@/components/attendee-journey/useJourney';
import { isListed } from '@/components/attendee-journey/journeyConfig';
import StageTracker from '@/components/attendee-journey/StageTracker';
import PackPanel from '@/components/attendee-journey/PackPanel';
import { stageProgress } from '@/components/attendee-journey/stageProgress';
import ConferenceTravelDesk from '@/components/travel/ConferenceTravelDesk';
import useConferenceMenus from '@/components/conferences/os/useConferenceMenus';
import { STAGE_KEYS } from '@/components/conferences/os/conferenceApps';
import PlanPanel from '@/components/attendee-journey/PlanPanel';
import TargetsPanel from '@/components/attendee-journey/TargetsPanel';
import CapturePanel from '@/components/attendee-journey/CapturePanel';
import DebriefPanel from '@/components/attendee-journey/DebriefPanel';
import FollowUpPanel from '@/components/attendee-journey/FollowUpPanel';

// THE ATTENDEE JOURNEY — one conference, worked from the inside.
//
// Plan who to meet, capture the people you do meet, close the day, and follow up while it
// still matters. Every record on this surface belongs to the Fellow who made it: plans,
// notes, promises and outcomes are scoped to their owner, are never published, and are
// never read by discovery, directory ordering, measurement, or scoring.
export default function ConferenceJourney() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const journey = useJourney(roomId);
  const { upcoming, myRoomIds, attendeesFor } = useConferences();
  const [params, setParams] = useSearchParams();
  const tab = STAGE_KEYS.includes(params.get('stage')) ? params.get('stage') : 'plan';
  const setTab = useCallback((key) => setParams({ stage: key }, { replace: true }), [setParams]);

  const { room, plan, contacts, roster, myRsvp, queued, state } = journey;
  const targets = plan?.targets || [];
  const progress = useMemo(() => stageProgress(plan, contacts), [plan, contacts]);
  useConferenceMenus({ room, contacts, onStage: setTab });

  // A resurface is only offered where both of them are listed in the show ahead. A private
  // declaration is not a shared show, and neither is one the Fellow has not declared for.
  const sharedShowsFor = useCallback((contact) => {
    if (!contact?.email) return [];
    return upcoming.filter((show) => (
      show.id !== roomId
      && myRoomIds.has(show.id)
      && attendeesFor(show).some((rsvp) => rsvp.fellow_email === contact.email && isListed(rsvp))
    ));
  }, [upcoming, myRoomIds, attendeesFor, roomId]);

  const cells = useMemo(() => ([
    { label: 'Targets met', value: `${targets.filter((t) => t.status === 'met').length}/${targets.length}` },
    { label: 'Captured', value: contacts.length },
    { label: 'To follow up', value: contacts.filter((c) => !c.follow_up_sent).length },
  ]), [targets, contacts]);

  const dateLine = room ? [dateRangeLabel(room), placeLabel(room)].filter(Boolean).join(' · ') : '';

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <ConferenceAppBar app={tab} />

      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 md:px-8 md:pb-16 md:pt-8">
        <Link
          to={ATTEND_HREF}
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: B.copper }}
        >
          <ArrowLeft className="h-3 w-3" /> Attend
        </Link>

        {state.failed ? (
          <div className="mt-4 rounded-sm px-5 py-6 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <Signal className="mx-auto h-5 w-5" style={{ color: B.copper }} />
            <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>This conference could not be read.</p>
            <p className="mt-1 text-[11.5px]" style={{ color: B.muted }}>Nothing is lost. It is only the line.</p>
            <button
              type="button"
              onClick={journey.retry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              <RotateCcw className="h-3 w-3" /> Read it again
            </button>
            <p className="mt-4 text-[11px]" style={{ color: B.muted }}>
              Or return to <Link to={ATTEND_HREF} style={{ color: B.copper }}>your rooms</Link>.
            </p>
          </div>
        ) : state.loading ? (
          <div className="mt-10 flex flex-col items-center gap-2 py-12">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: B.copper }} />
            <p className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
              Reading the room
            </p>
          </div>
        ) : !user ? (
          <div className="mt-4 rounded-sm px-5 py-8" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
            <LogIn className="h-5 w-5" style={{ color: B.copper }} />
            <h2 className="mt-3 font-heading text-xl" style={{ color: B.navy }}>The plan is yours alone.</h2>
            <p className="mt-2 max-w-md text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
              Who you mean to meet, what was said, and what you owe belong to the Fellow who
              wrote them. Sign in and this conference answers with yours.
            </p>
            <button
              type="button"
              onClick={() => base44.auth.redirectToLogin(`/conferences/attend/${roomId}`)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ background: B.navy, color: '#fff' }}
            >
              <LogIn className="h-3 w-3" /> Sign in
            </button>
          </div>
        ) : (
          <>
            <header data-hh-module="The conference" className="mt-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
                {[room?.conference_series || 'Conference', circuitLabel(room)].filter(Boolean).join(' · ')}
              </p>
              <h1 className="mt-1 font-heading text-[24px] leading-tight md:text-4xl" style={{ color: B.navy }}>
                {room?.conference_name}
              </h1>
              <p className="mt-1 text-[11px]" style={{ color: B.muted }}>
                {[dateLine, disciplineLabel(room?.domain_focus)].filter(Boolean).join(' · ')}
              </p>
            </header>

            <div className="mt-3">
              <StandingReadout cells={cells} />
            </div>

            <div data-hh-module="The journey" className="mt-3">
              <StageTracker active={tab} onChange={setTab} progress={progress} />
            </div>

            <div className="mt-3 space-y-3" data-hh-module="The surface">
              {tab === 'plan' && (
                <>
                  <PlanPanel
                    plan={plan}
                    onSave={journey.savePlan}
                    visibility={myRsvp?.visibility || 'listed'}
                    onVisibility={journey.setVisibility}
                    declared={!!myRsvp}
                  />
                  <TargetsPanel
                    roster={roster}
                    targets={targets}
                    onAdd={journey.addTarget}
                    onPatch={journey.setTarget}
                    onRemove={journey.removeTarget}
                  />
                  {room && <ConferenceTravelDesk room={room} />}
                  <label className="flex items-center gap-2 rounded-sm px-3 py-2.5 text-[12px]" style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}>
                    <input type="checkbox" checked={!!plan?.travel_planned} onChange={(e) => journey.savePlan({ travel_planned: e.target.checked })} />
                    My travel is booked
                  </label>
                </>
              )}
              {tab === 'pack' && <PackPanel plan={plan} onSave={journey.savePlan} />}
              {tab === 'lockin' && <CapturePanel onCapture={journey.addContact} />}
              {tab === 'follow' && (
                <DebriefPanel
                  contacts={contacts}
                  targets={targets}
                  queued={queued}
                  onPatchContact={journey.updateContact}
                  onTargetPatch={journey.setTarget}
                />
              )}
              {tab === 'follow' && (
                <FollowUpPanel
                  contacts={contacts}
                  fellowName={user.full_name}
                  sharedShowsFor={sharedShowsFor}
                  onPatch={journey.updateContact}
                  onDelete={journey.removeContact}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
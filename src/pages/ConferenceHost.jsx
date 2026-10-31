import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2, Plus, RotateCcw, Signal } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import ConferenceAppBar from '@/components/conferences/os/ConferenceAppBar';
import HostConferencePanel from '@/components/conferences/HostConferencePanel';
import ConferenceEditor from '@/components/conferences/ConferenceEditor';
import HostGate from '@/components/conferences/HostGate';
import useHostAccess from '@/components/conferences/useHostAccess';
import useHostConferences from '@/components/conferences/useHostConferences';
import { B, HOST_APPLY_HREF } from '@/components/conferences/conferenceConfig';

// The host workspace: the conferences this host owns, drafts included, and the one act that
// puts a new one on the circuit. An organizer without approval is sent to the door rather
// than shown a workspace that cannot save anything.
export default function ConferenceHost() {
  const { user } = useAuth();
  const { state, access, retry } = useHostAccess();
  const conferences = useHostConferences(user?.email, access.isAdmin);
  const [composing, setComposing] = useState(false);

  if (state.loading || state.signedOut || state.failed) {
    return <HostGate state={state} onRetry={retry} />;
  }

  if (!access.isHost && !access.isAdmin) {
    return <Navigate to={HOST_APPLY_HREF} replace />;
  }

  const empty = !conferences.state.loading && !conferences.state.failed && conferences.rooms.length === 0;

  return (
    <div className="min-h-screen" style={{ background: B.cream }}>
      <ConferenceAppBar app="host" />

      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5 md:px-8 md:pb-16 md:pt-8">
        <header data-hh-module="Your conferences">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: B.copper }}>
            AeroSync · Host &amp; Facilitate
          </p>
          <h1 className="mt-1 font-heading text-[26px] leading-tight md:text-4xl" style={{ color: B.navy }}>
            Your conferences
          </h1>
        </header>

        <p className="mt-2 text-[11.5px]" style={{ color: B.muted }}>
          {access.isAdmin && !access.isHost
            ? 'Oversight: every conference on the network, as an administrator.'
            : `Publishing as ${access.application?.organization || 'an approved host'}.`}
        </p>

        {!composing && (
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ background: B.copper, color: '#fff' }}
          >
            <Plus className="h-3.5 w-3.5" /> Open a conference
          </button>
        )}

        {composing && (
          <div className="mt-3">
            <ConferenceEditor
              onCancel={() => setComposing(false)}
              onSaved={(room) => {
                setComposing(false);
                conferences.replace(room);
              }}
            />
          </div>
        )}

        <div className="mt-4">
          {conferences.state.failed ? (
            <div className="rounded-sm px-4 py-5 text-center" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
              <Signal className="mx-auto h-4 w-4" style={{ color: B.copper }} />
              <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>Your conferences could not be read.</p>
              <button
                type="button"
                onClick={conferences.retry}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ background: B.navy, color: '#fff' }}
              >
                <RotateCcw className="h-3 w-3" /> Try again
              </button>
            </div>
          ) : conferences.state.loading ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: B.copper }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: B.copper }}>
                Reading your conferences
              </span>
            </div>
          ) : empty ? (
            <div className="rounded-sm px-4 py-6" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
              <h2 className="font-heading text-xl" style={{ color: B.navy }}>No conference opened yet.</h2>
              <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed" style={{ color: B.muted }}>
                A conference begins as a draft only you can see: its dates, its city, and the
                rooms you will run inside it. Open it to the circuit when the record is ready,
                and the Fellows who declare become the room.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conferences.rooms.map((room) => (
                <HostConferencePanel
                  key={room.id}
                  room={room}
                  attendees={conferences.attendeesFor(room)}
                  user={user}
                  onSaved={(saved) => conferences.replace(saved)}
                  onReload={conferences.reload}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
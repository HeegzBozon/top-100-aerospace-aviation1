import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, Radar } from 'lucide-react';
import ConnectionPill from '@/components/fellow-home/ConnectionPill';
import { useConnectionMap } from '@/components/fellow-home/useConnections';
import MeetingNoteForm from './MeetingNoteForm';
import { B, domainAccent } from './conferenceConfig';

// The people in the room, as people. Each row opens their profile, carries the one-tap
// connection, and holds the private note filed from the conference — so the roster is where
// a meeting is made and where it is remembered, not a list of counts.
export default function ConferencePeople({ room, attendees = [], met = [], user, accent, onChanged }) {
  const { map, connect, accept, decline, disconnect } = useConnectionMap(user?.email);
  const [openEmail, setOpenEmail] = useState(null);
  const [busyEmail, setBusyEmail] = useState(null);

  const colour = domainAccent(room?.domain_focus) || accent || B.copper;

  const notesByEmail = useMemo(() => {
    const byEmail = {};
    met.forEach((record) => {
      if (record.email) byEmail[record.email] = record;
    });
    return byEmail;
  }, [met]);

  const run = async (email, action) => {
    setBusyEmail(email);
    try {
      await action();
    } catch {
      // The pill reports its own state; a failed request simply leaves it as it was.
    } finally {
      setBusyEmail(null);
    }
  };

  if (attendees.length === 0) {
    return (
      <div className="rounded-sm p-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
        <Radar className="h-4 w-4" style={{ color: colour }} />
        <p className="mt-2 font-heading text-lg" style={{ color: B.navy }}>
          The room is still empty.
        </p>
        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: B.muted }}>
          Declare your attendance and the roster fills in. Everyone who does becomes
          reachable from here — and every one of them is someone to meet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: B.copper }}>
          People in the room
        </p>
        <span className="text-[10px]" style={{ color: B.muted }}>{attendees.length}</span>
      </div>

      {attendees.map((person) => {
        const email = person.fellow_email;
        const note = email ? notesByEmail[email] : null;
        const profileHref = email ? `/ProfileView?user=${encodeURIComponent(email)}` : null;
        const open = openEmail === email;

        return (
          <div
            key={person.id || email}
            className="rounded-sm px-2.5 py-2"
            style={{ background: '#fff', border: `1px solid ${B.border}`, borderLeft: `2px solid ${colour}` }}
          >
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full" style={{ background: B.cream }}>
                {person.fellow_avatar_url
                  ? <img src={person.fellow_avatar_url} alt="" className="h-full w-full object-cover" />
                  : (
                    <span className="flex h-full w-full items-center justify-center text-[11px] font-bold" style={{ color: colour }}>
                      {(person.fellow_name || email || '?')[0]}
                    </span>
                  )}
              </span>

              <div className="min-w-0 flex-1">
                {profileHref ? (
                  <Link to={profileHref} className="block truncate text-[12.5px] font-semibold hover:opacity-70" style={{ color: B.navy }}>
                    {person.fellow_name || email}
                  </Link>
                ) : (
                  <span className="block truncate text-[12.5px] font-semibold" style={{ color: B.navy }}>
                    {person.fellow_name || 'Fellow'}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[10px]" style={{ color: B.muted }}>
                  {person.focus_area && <span className="truncate" style={{ color: colour }}>{person.focus_area}</span>}
                  {person.volunteer && <span className="shrink-0 uppercase tracking-[0.08em]">· hosting</span>}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {user?.email && email && (
                  <button
                    type="button"
                    onClick={() => setOpenEmail(open ? null : email)}
                    aria-label={note ? 'Edit your note' : 'File a note'}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.1em]"
                    style={note
                      ? { background: `${B.copper}16`, color: B.copper }
                      : { background: `${B.navy}0a`, color: B.navy }}
                  >
                    <NotebookPen className="h-3 w-3" /> {note ? 'Noted' : 'Note'}
                  </button>
                )}
                <ConnectionPill
                  record={email ? map[email] : null}
                  otherEmail={email}
                  viewerEmail={user?.email}
                  viewerName={user?.full_name}
                  viewerAvatar={user?.avatar_url}
                  personName={person.fellow_name}
                  personAvatar={person.fellow_avatar_url}
                  accent={colour}
                  busy={busyEmail === email}
                  onConnect={(target) => run(email, () => connect(target))}
                  onAccept={(record, target) => run(target, () => accept(record, target))}
                  onDecline={(record, target) => run(target, () => decline(record, target))}
                  onDisconnect={(record, target) => run(target, () => disconnect(record, target))}
                />
              </div>
            </div>

            {note && !open && (
              <div className="mt-1.5 border-t pt-1.5" style={{ borderColor: B.border }}>
                <p className="text-[11.5px] leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{note.notes}</p>
                {note.next_step && (
                  <p className="mt-1 text-[10.5px]" style={{ color: B.copper }}>
                    Next · {note.next_step}
                  </p>
                )}
              </div>
            )}

            {open && (
              <MeetingNoteForm
                room={room}
                person={person}
                existing={note}
                user={user}
                onSaved={() => { setOpenEmail(null); onChanged?.(); }}
                onCancel={() => setOpenEmail(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
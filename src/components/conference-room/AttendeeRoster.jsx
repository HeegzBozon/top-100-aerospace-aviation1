import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Radar } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import ConnectionPill from '@/components/fellow-home/ConnectionPill';
import { useConnectionMap } from '@/components/fellow-home/useConnections';
import { domainAccent, phaseForRoom } from './conferenceRoomConfig';

// The people in a room, as people rather than an avatar stack. Each row opens
// the Fellow's profile, and the connection action sits right on the row, so a
// room is a place to meet someone rather than a list of attendance counts.
// Once the event is done the roster turns into continuation: the same people,
// the same one-tap connection, under a heading that says what it's for.
// One batch read covers the whole roster (useConnectionMap) — never a read per row.
export default function AttendeeRoster({ room, attendees, user, accent }) {
  const { map, connect, accept, decline, disconnect } = useConnectionMap(user?.email);
  const [busyEmail, setBusyEmail] = useState(null);
  const list = attendees || [];
  const done = phaseForRoom(room) === 'done';

  if (list.length === 0) {
    return (
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        <Radar className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accent }} />
        <p className="text-[11px] leading-relaxed" style={{ color: B.muted }}>
          No one has declared yet. Declare your attendance and the room fills in — everyone here becomes reachable from your profile.
        </p>
      </div>
    );
  }

  const run = async (email, fn) => {
    setBusyEmail(email);
    try {
      await fn();
    } catch {
    } finally {
      setBusyEmail(null);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: B.muted }}>
          {done ? 'Continue the conversation' : 'People in this room'}
        </p>
        <span className="text-[10px]" style={{ color: B.muted }}>{list.length}</span>
      </div>
      {done && (
        <p className="text-[10px] italic leading-relaxed" style={{ color: B.muted }}>
          The show is over. The relationships are not.
        </p>
      )}

      {list.map((a) => {
        const color = domainAccent(room.domain_focus);
        const profileHref = a.fellow_email ? `/ProfileView?user=${encodeURIComponent(a.fellow_email)}` : null;
        return (
          <div
            key={a.id || a.fellow_email}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5"
            style={{ background: '#fff', border: `1px solid ${B.border}`, borderLeft: `3px solid ${color}` }}
          >
            <span className="w-7 h-7 rounded-full overflow-hidden shrink-0" style={{ background: B.cream }}>
              {a.fellow_avatar_url
                ? <img src={a.fellow_avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ color }}>{(a.fellow_name || a.fellow_email || '?')[0]}</span>}
            </span>

            <div className="min-w-0 flex-1">
              {profileHref ? (
                <Link to={profileHref} className="block text-[11px] font-semibold truncate hover:opacity-70" style={{ color: B.navy }}>
                  {a.fellow_name || a.fellow_email}
                </Link>
              ) : (
                <span className="block text-[11px] font-semibold truncate" style={{ color: B.navy }}>{a.fellow_name || 'Fellow'}</span>
              )}
              <span className="flex items-center gap-1.5 min-w-0">
                {a.focus_area && <span className="text-[10px] truncate" style={{ color: color }}>{a.focus_area}</span>}
                {a.volunteer && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] shrink-0" style={{ color: accent }}>
                    <Flag className="w-2.5 h-2.5" /> Hosting
                  </span>
                )}
              </span>
            </div>

            <div className="shrink-0">
              <ConnectionPill
                record={map[a.fellow_email]}
                otherEmail={a.fellow_email}
                viewerEmail={user?.email}
                viewerName={user?.full_name}
                viewerAvatar={user?.avatar_url}
                personName={a.fellow_name}
                personAvatar={a.fellow_avatar_url}
                accent={accent}
                busy={busyEmail === a.fellow_email}
                onConnect={(target) => run(a.fellow_email, () => connect(target))}
                onAccept={(record, email) => run(email, () => accept(record, email))}
                onDecline={(record, email) => run(email, () => decline(record, email))}
                onDisconnect={(record, email) => run(email, () => disconnect(record, email))}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
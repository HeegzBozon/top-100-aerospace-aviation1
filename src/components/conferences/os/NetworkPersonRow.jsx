import { Link } from 'react-router-dom';
import ConnectionPill from '@/components/fellow-home/ConnectionPill';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// One Fellow standing in the same rooms as the reader. The row carries the profile
// link, how many conferences the two of you share, and the one-tap connection — so
// the roster is where a meeting is made rather than a list of names.
export default function NetworkPersonRow({
  person, viewer, record, busy, accent,
  onConnect, onAccept, onDecline, onDisconnect,
}) {
  const profileHref = `/ProfileView?user=${encodeURIComponent(person.email)}`;
  const shared = person.rooms.length;

  return (
    <div
      className="flex items-center gap-2 rounded-sm px-2.5 py-2"
      style={{ background: '#fff', border: `1px solid ${B.border}`, borderLeft: `2px solid ${accent}` }}
    >
      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full" style={{ background: B.cream }}>
        {person.avatar ? (
          <img src={person.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[12px] font-bold" style={{ color: accent }}>
            {(person.name || person.email || '?')[0]}
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <Link
          to={profileHref}
          className="block truncate text-[12.5px] font-semibold hover:opacity-70"
          style={{ color: B.navy }}
        >
          {person.name || person.email}
        </Link>
        <span className="block truncate text-[10px]" style={{ color: B.muted }}>
          {shared === 1 ? person.rooms[0] : `${shared} conferences together`}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ConnectionPill
          record={record || null}
          otherEmail={person.email}
          viewerEmail={viewer?.email}
          viewerName={viewer?.full_name}
          viewerAvatar={viewer?.avatar_url}
          personName={person.name}
          personAvatar={person.avatar}
          accent={accent}
          busy={busy}
          onConnect={onConnect}
          onAccept={onAccept}
          onDecline={onDecline}
          onDisconnect={onDisconnect}
        />
      </div>
    </div>
  );
}
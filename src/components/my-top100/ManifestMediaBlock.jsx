import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { MEDIA_ROOMS } from '@/components/media-hub/mediaRooms';

// The press floor, kept in the margin of the Manifest.
//
// Four rooms of the Media Hub, named the way the floor names them, each a door — the
// edition on the stand, the programming, the press kit, and the people behind the stories.
// It reads the one definition the Media Hub and the Colony map both read, so a room can
// never be called one thing here and another on the floor. Nothing is fetched: the margin
// stays quiet while the list is being worked.
const ROOM_KEYS = ['main-studio', 'podcast-studio', 'content-lab', 'media-lounge'];

export default function ManifestMediaBlock({ className = '' }) {
  const rooms = ROOM_KEYS.map((key) => MEDIA_ROOMS.find((room) => room.key === key)).filter(
    (room) => room && room.to,
  );

  return (
    <div className={className}>
      <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        The Media Hub
      </p>
      <div className="mt-2 h-[2px] w-10 bg-editorial-copper" aria-hidden="true" />

      <ul className="mt-1 border-b border-editorial-navy/10">
        {rooms.map((room) => (
          <li key={room.key} className="border-t border-editorial-navy/10 first:border-t-0">
            <Link
              to={room.to}
              className="group flex items-center justify-between gap-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-body text-[11px] font-semibold text-editorial-navy transition-colors group-hover:text-editorial-copper">
                  {room.label}
                </span>
                <span className="block truncate font-body text-[8.5px] uppercase tracking-[0.14em] text-editorial-navy/40">
                  {room.kicker}
                </span>
              </span>
              <ArrowUpRight
                className="h-3 w-3 shrink-0 text-editorial-copper/50 transition-colors group-hover:text-editorial-copper"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/media-hub"
        className="mt-2.5 inline-flex items-center gap-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-navy/55 transition-colors hover:text-editorial-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
      >
        The press floor <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
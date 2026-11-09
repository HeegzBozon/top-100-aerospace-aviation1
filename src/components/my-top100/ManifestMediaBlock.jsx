import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { MEDIA_ROOMS, mediaRoomPath } from '@/components/media-hub/mediaRooms';

// The press floor, kept in the margin of the Manifest.
//
// Four rooms of the Media Hub, named the way the floor names them. Each carries two doors:
// the PAGE the room publishes to — the Newsstand, the programming, the press kit, the people
// — and the ROOM itself, the hotspot on the floor plan. A reader who wants the work takes
// the page; a reader who wants to stand in the studio takes the room. Both read the one
// definition the Media Hub and the Colony map read, so a room can never be called one thing
// here and another on the floor. Nothing is fetched: the margin stays quiet while the list
// is being worked.
const ROOM_KEYS = ['main-studio', 'podcast-studio', 'content-lab', 'media-lounge'];

const KEY_CLASS =
  'inline-flex items-center gap-1 border border-editorial-copper/40 px-1.5 py-0.5 font-body text-[8.5px] font-bold uppercase tracking-[0.12em] text-editorial-navy transition-colors hover:bg-editorial-copper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50';

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
          <li key={room.key} className="border-t border-editorial-navy/10 py-2 first:border-t-0">
            <p className="truncate font-body text-[11px] font-semibold text-editorial-navy">
              {room.label}
            </p>
            <p className="truncate font-body text-[8.5px] uppercase tracking-[0.14em] text-editorial-navy/40">
              {room.kicker}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Link to={room.to} className={KEY_CLASS}>
                Page <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
              </Link>
              <Link to={mediaRoomPath(room.key)} className={KEY_CLASS}>
                Room <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
              </Link>
            </div>
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
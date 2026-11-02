import { Link } from 'react-router-dom';
import { MEDIA_ROOMS, mediaRoomPath } from '@/components/media-hub/mediaRooms';

// The press floor as a directory: the same nine rooms the Colony map opens.
export default function MediaRoomGrid() {
  return (
    <nav aria-label="Media Hub rooms" className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {MEDIA_ROOMS.map((r) => (
        <Link key={r.key} to={mediaRoomPath(r.key)}
          className="group min-h-[64px] border border-editorial-navy/15 bg-white p-3 transition-colors hover:border-editorial-copper">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-label">{r.to ? r.kicker : 'Planned room'}</p>
          <p className="mt-0.5 font-heading text-[15px] leading-tight text-editorial-navy group-hover:text-editorial-copper">{r.label}</p>
        </Link>
      ))}
    </nav>
  );
}
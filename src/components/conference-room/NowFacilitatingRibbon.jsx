import { Radio } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { phaseForRoom } from './conferenceRoomConfig';

// Live-room ribbon. Surfaces what's being coordinated right now — the focus area the host
// has put in session, or the facilitator standing in it. It reads the run of show, so a
// conference the host has explicitly started shows even before its calendar window opens.
export default function NowFacilitatingRibbon({ room, accent, className = '' }) {
  const live = !!room && (room.status === 'live' || phaseForRoom(room) === 'live');
  if (!live) return null;

  const areas = room.focus_areas || [];
  const current = areas.find((area) => area.key === room.live_focus_key) || areas[0];
  const subject = current?.label || room.facilitator_name || room.conference_name;

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${className}`}
      style={{ background: `${accent}12`, border: `1px solid ${accent}33` }}
    >
      <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" style={{ color: accent }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] shrink-0" style={{ color: accent }}>Now facilitating</span>
      <span className="text-xs font-semibold truncate" style={{ color: B.navy }}>{subject}</span>
    </div>
  );
}
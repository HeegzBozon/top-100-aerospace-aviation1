import { Radio } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { phaseForRoom } from './conferenceRoomConfig';

// Live-room ribbon. Surfaces what's being coordinated right now — the
// current focus area or facilitator — so the drawer reads as an active
// coordination surface, not a static record. Renders only while live.
export default function NowFacilitatingRibbon({ room, accent }) {
  if (phaseForRoom(room) !== 'live') return null;
  const focus = (room.focus_areas || [])[0];
  const subject = focus?.label || room.facilitator_name || room.conference_name;
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: `${accent}12`, border: `1px solid ${accent}33` }}>
      <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" style={{ color: accent }} />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] shrink-0" style={{ color: accent }}>Now facilitating</span>
      <span className="text-xs font-semibold truncate" style={{ color: B.navy }}>{subject}</span>
    </div>
  );
}
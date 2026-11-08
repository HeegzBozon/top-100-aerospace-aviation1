import { useRef, useState } from 'react';
import { ArrowRight, Share2 } from 'lucide-react';
import { shareZone } from './colonyShare';

// A slim banner for the door the player is standing at. Enter, the wheel's centre or A opens it.
// It sits clear of the call controls at the foot of the glass, and over them: a press on the
// door is never swallowed by the row of buttons underneath.
//
// The key at its right end sends that door to somebody: the link lands them at this hotspot,
// not merely somewhere in the room.
export default function ColonyZoneCard({ zone, room, onActivate }) {
  const [note, setNote] = useState('');
  const timer = useRef(null);

  if (!zone) return null;
  const verb = zone.room === 'hall' && zone.key !== 'enter-campus' ? 'Exit' : zone.panel ? 'Open' : 'Enter';

  const handleShare = async () => {
    const result = await shareZone(room, zone.key, zone.label);
    if (result === 'cancelled') return;
    setNote(result === 'copied' ? 'Link copied' : result === 'failed' ? 'Could not copy' : '');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(''), 2600);
  };

  return (
    <div
      className="absolute left-3 right-3 z-[60] mx-auto flex max-w-md items-center gap-1 rounded-full border border-editorial-copper/60 bg-editorial-navy/95 py-1.5 pl-3 pr-1.5 shadow-lg"
      style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={() => onActivate(zone)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span className="min-w-0 flex-1 truncate font-heading text-sm text-editorial-cream">{zone.label}</span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-editorial-copper px-2.5 py-0.5 text-[11px] font-semibold text-editorial-cream">
          {verb} <ArrowRight className="h-3 w-3" />
        </span>
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share a link to ${zone.label}`}
        className="relative shrink-0 rounded-full p-2 text-editorial-cream/60 transition-colors hover:text-editorial-cream"
      >
        <Share2 className="h-3.5 w-3.5" />
        {note && (
          <span
            role="status"
            className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded bg-slate-900/95 px-2 py-1 text-[10px] font-medium text-editorial-cream shadow"
          >
            {note}
          </span>
        )}
      </button>
    </div>
  );
}
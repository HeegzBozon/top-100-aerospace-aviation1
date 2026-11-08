import { useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { shareRoom } from './colonyShare';

// The key that hands this room to somebody else. It sits with the call controls, because
// sharing a room is the same kind of act as speaking in it.
export default function RoomShareKey({ room, label }) {
  const [note, setNote] = useState('');
  const timer = useRef(null);

  const say = (text) => {
    setNote(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(''), 2600);
  };

  const handleShare = async () => {
    const result = await shareRoom(room, label || 'The Colony');
    if (result === 'copied') say('Link copied');
    if (result === 'failed') say('Could not copy the link');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share a link to ${label || 'this room'}`}
        className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/80"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>
      {note && (
        <p
          role="status"
          className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/95 px-2 py-1 text-[10px] font-medium text-editorial-cream shadow"
        >
          {note}
        </p>
      )}
    </div>
  );
}
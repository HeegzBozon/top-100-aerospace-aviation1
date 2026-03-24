import { useState } from 'react';

const LIVE_CHANNELS = [
  { id: 'bbc',       name: 'BBC',        ytId: 'w_Ma8oQLmSM' },
  { id: 'aljazeera', name: 'AJ',         ytId: 'h3MuIUNCCLI' },
  { id: 'nasa',      name: 'NASA',       ytId: 'jn-LnY6k-h4' },
  { id: 'sky',       name: 'Sky',        ytId: '9Auq9mYxFEE' },
  { id: 'dw',        name: 'DW',         ytId: 'Z9FV6gu9vj4' },
];

export function LiveNewsPanel() {
  const [activeChannel, setActiveChannel] = useState('bbc');
  const ch = LIVE_CHANNELS.find(c => c.id === activeChannel);

  return (
    <div className="h-full flex flex-col">
      {/* Channel tabs */}
      <div className="flex gap-1 flex-wrap pb-1 shrink-0">
        {LIVE_CHANNELS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChannel(c.id)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
              activeChannel === c.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Embed */}
      <div className="flex-1 min-h-0 bg-black rounded overflow-hidden">
        <iframe
          key={ch.ytId}
          src={`https://www.youtube-nocookie.com/embed/${ch.ytId}?autoplay=1&mute=1&controls=1&rel=0`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={ch.name}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';

const LIVE_CHANNELS = [
  { id: 'aljazeera', name: 'AJ',         ytId: 'gCNeDWCI0vo' },
  { id: 'france24',  name: 'F24',        ytId: 'h3MuIUNCCLI' },
  { id: 'nasa',      name: 'NASA',       ytId: '21X5lGlDOfg' },
  { id: 'dw',        name: 'DW',         ytId: 'V1FNCH3yQcg' },
  { id: 'euronews',  name: 'Euro',       ytId: 'pykpO5kQJ98' },
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
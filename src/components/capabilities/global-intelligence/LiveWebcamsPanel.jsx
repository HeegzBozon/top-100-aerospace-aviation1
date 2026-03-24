import { useState } from 'react';

const WEBCAMS = [
  { id: 'nasa-tv',  name: 'NASA TV',     ytId: 'jn-LnY6k-h4' },
  { id: 'iss',      name: 'ISS Live',    ytId: '21X5lGlDOfg' },
  { id: 'spacex',   name: 'SpaceX',      ytId: '5artIbY-83k' },
  { id: 'ksc',      name: 'Kennedy SC',  ytId: 'bPE-mB3dFAM' },
];

export function LiveWebcamsPanel() {
  const [active, setActive] = useState('nasa-tv');
  const cam = WEBCAMS.find(c => c.id === active);

  return (
    <div className="h-full flex flex-col">
      {/* Cam tabs */}
      <div className="flex gap-1 flex-wrap pb-1 shrink-0">
        {WEBCAMS.map(c => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
              active === c.id
                ? 'bg-green-700 text-white'
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
          key={cam.ytId}
          src={`https://www.youtube-nocookie.com/embed/${cam.ytId}?autoplay=1&mute=1&controls=1&rel=0`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={cam.name}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

// The outdoor sky follows the player's own clock: a tint over the map for the hour,
// and now and then a cloud, bird or airplane shadow drifting across the grounds.
const PHASES = [
  { until: 5, name: 'Night', tint: 'rgba(10,18,48,0.55)' },
  { until: 7, name: 'Sunrise', tint: 'rgba(255,150,110,0.22)' },
  { until: 11, name: 'Morning', tint: 'rgba(255,240,200,0.08)' },
  { until: 16, name: 'Afternoon', tint: 'rgba(0,0,0,0)' },
  { until: 18, name: 'Evening', tint: 'rgba(255,170,90,0.18)' },
  { until: 20, name: 'Sunset', tint: 'rgba(200,80,90,0.28)' },
  { until: 24, name: 'Night', tint: 'rgba(10,18,48,0.55)' },
];
const KINDS = ['cloud', 'cloud', 'cloud', 'bird', 'plane'];
const SHAPE = { cloud: 'h-24 w-48 rounded-full blur-xl', bird: 'h-3 w-6 rounded-full blur-[2px]', plane: 'h-6 w-20 rounded-full blur-sm' };
const SPEED = { cloud: 26, bird: 9, plane: 7 };

const phaseNow = () => PHASES.find(p => new Date().getHours() < p.until);

export default function CampusSky() {
  const [phase, setPhase] = useState(phaseNow);
  const [drift, setDrift] = useState(null);
  useEffect(() => { const t = setInterval(() => setPhase(phaseNow()), 60000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let t;
    const next = () => {
      t = setTimeout(() => {
        const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
        setDrift({ kind, top: 10 + Math.random() * 70, key: Date.now() });
        next();
      }, 8000 + Math.random() * 14000);
    };
    next();
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" style={{ background: phase.tint, transition: 'background 3s' }}>
      {drift && (
        <div key={drift.key} className={`absolute bg-black/25 ${SHAPE[drift.kind]}`}
          style={{ top: `${drift.top}%`, left: '-25%', animation: `sky-drift ${SPEED[drift.kind]}s linear forwards` }} />
      )}
      <span className="absolute right-2 top-2 rounded bg-black/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-editorial-cream/80">{phase.name}</span>
    </div>
  );
}
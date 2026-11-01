import { useEffect, useState } from 'react';

// A title card each time the player walks into a room: the room's name, its mood, one line.
const MOODS = {
  lobby: { icon: '🛫', line: 'Doors open. Your journey starts here.', tint: 'from-[#1e3a5a] to-[#0e1829]' },
  hall: { icon: '🏛️', line: 'Six districts. One campus.', tint: 'from-[#2a4a6e] to-[#0e1829]' },
  'innovation-expo': { icon: '⚡', line: 'Where tomorrow gets prototyped.', tint: 'from-[#3b2a5c] to-[#0e1829]' },
  'space-pavilion': { icon: '🚀', line: 'The next frontier is calling.', tint: 'from-[#101a3d] to-[#04070f]' },
  'leadership-summit': { icon: '🎙️', line: 'The summit is in session.', tint: 'from-[#5a3a1e] to-[#0e1829]' },
  'media-hub': { icon: '📰', line: 'The presses are running.', tint: 'from-[#5a1e2e] to-[#0e1829]' },
  'career-center': { icon: '🧭', line: 'Your next mission awaits.', tint: 'from-[#1e5a4a] to-[#0e1829]' },
  'networking-lounge': { icon: '🥂', line: 'Your community is a few steps away.', tint: 'from-[#4a1e5a] to-[#0e1829]' },
};

export default function RoomSplash({ room, label }) {
  const [show, setShow] = useState(true);
  useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 1700); return () => clearTimeout(t); }, [room]);
  if (!show) return null;
  const m = MOODS[room] || MOODS.hall;
  return (
    <div onClick={() => setShow(false)} className={`as-veil absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b ${m.tint} text-center`}>
      <div className="as-rise text-5xl">{m.icon}</div>
      <p className="as-rise mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-gold">Now entering</p>
      <h2 className="as-title mt-1 font-heading text-3xl text-editorial-cream">{label}</h2>
      <div className="as-rule mt-3 h-px w-24 bg-editorial-copper" />
      <p className="as-rise mt-3 px-6 text-sm italic text-editorial-cream/80">{m.line}</p>
    </div>
  );
}
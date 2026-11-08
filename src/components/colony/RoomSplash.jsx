import { useEffect, useState } from 'react';

const IMG = 'https://media.base44.com/images/public/68996845be6727838fdb822e/';

// A title card each time the player walks into a room: its artwork, its name, one line.
const MOODS = {
  // The deck carries its own plate as the card (see SPLASH_ART), so it holds no art id.
  station: { art: '', line: 'Aboard TOP 100. The teleporter is lit.' },
  lobby: { art: '03b9d64b8', line: 'Doors open. Your journey starts here.' },
  hall: { art: '240a071a8', line: 'Fresh air. Six districts. One campus.' },
  'innovation-expo': { art: 'b99da8084', line: 'Where tomorrow gets prototyped.' },
  'space-pavilion': { art: '6100e0ff6', line: 'The next frontier is calling.' },
  'leadership-summit': { art: '5f349a404', line: 'The summit is in session.' },
  'media-hub': { art: '1ae4d1dc0', line: 'The presses are running.' },
  'career-center': { art: '6b6c4084c', line: 'Your next mission awaits.' },
  'networking-lounge': { art: '7bd6a449d', line: 'Your community is a few steps away.' },
};

// The deck's title card is its own illustrated plate; every other room has a drawn card.
const SPLASH_ART = {
  station: `${IMG}d75d4a36b_StationDeck_Top100Plate.png`,
};

export default function RoomSplash({ room, label }) {
  const [show, setShow] = useState(true);
  useEffect(() => { setShow(true); const t = setTimeout(() => setShow(false), 2000); return () => clearTimeout(t); }, [room]);
  if (!show) return null;
  const m = MOODS[room] || MOODS.hall;
  const art = SPLASH_ART[room] || `${IMG}${m.art}_generated_image.png`;
  return (
    <div onClick={() => setShow(false)} className="as-veil absolute inset-0 z-40 flex flex-col items-center justify-end overflow-hidden bg-editorial-navy pb-24 text-center">
      <img src={art} alt="" className="doc-still absolute inset-0 h-full w-full object-cover" style={{ imageRendering: 'pixelated' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070c16] via-[#070c16]/40 to-transparent" />
      <p className="as-rise relative text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-gold">Now entering</p>
      <h2 className="as-title relative mt-1 font-heading text-3xl text-editorial-cream">{label}</h2>
      <div className="as-rule relative mt-3 h-px w-24 bg-editorial-copper" />
      <p className="as-rise relative mt-3 px-6 text-sm italic text-editorial-cream/85">{m.line}</p>
    </div>
  );
}
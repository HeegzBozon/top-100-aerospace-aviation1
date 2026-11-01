import { useEffect, useState } from 'react';
import ColonySplash from './ColonySplash';

const KEY = 'colony-intro-seen';
const HOLD_MS = 2200;
const FADE_MS = 800;

// The cinematic title plate: held once per session, then dissolved into the lobby
// with a soft zoom and blur, like a dream lifting.
export default function ColonyIntro() {
  const [phase, setPhase] = useState(() => (sessionStorage.getItem(KEY) ? 'done' : 'hold'));

  useEffect(() => {
    if (phase === 'done') return undefined;
    sessionStorage.setItem(KEY, '1');
    const a = setTimeout(() => setPhase('fade'), HOLD_MS);
    const b = setTimeout(() => setPhase('done'), HOLD_MS + FADE_MS);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  if (phase === 'done') return null;
  return (
    <div
      className="fixed inset-0 z-[60] transition-all ease-out"
      style={{
        transitionDuration: `${FADE_MS}ms`,
        opacity: phase === 'fade' ? 0 : 1,
        transform: phase === 'fade' ? 'scale(1.08)' : 'scale(1)',
        filter: phase === 'fade' ? 'blur(8px) brightness(1.3)' : 'none',
      }}
    >
      <ColonySplash label="Going online…" />
    </div>
  );
}
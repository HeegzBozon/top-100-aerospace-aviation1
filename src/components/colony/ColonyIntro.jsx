import { useEffect, useState } from 'react';
import ColonySplash from './ColonySplash';
import useWheelConfirm from './useWheelConfirm';

const KEY = 'colony-intro-seen';
const HOLD_MS = 3000;
const FADE_MS = 800;

// The title plate: loads for 3s, then flashes PRESS START until tapped, a key or a pad button.
export default function ColonyIntro() {
  const [phase, setPhase] = useState(() => (sessionStorage.getItem(KEY) ? 'done' : 'hold'));

  useEffect(() => {
    if (phase !== 'hold') return undefined;
    sessionStorage.setItem(KEY, '1');
    const t = setTimeout(() => setPhase('start'), HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'start') return undefined;
    const go = () => setPhase('fade');
    window.addEventListener('keydown', go);
    let raf;
    const poll = () => {
      const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
      if (pad?.buttons.some((b) => b.pressed)) return go();
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { window.removeEventListener('keydown', go); cancelAnimationFrame(raf); };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fade') return undefined;
    const t = setTimeout(() => setPhase('done'), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useWheelConfirm(() => setPhase(p => (p === 'start' ? 'fade' : p)), phase === 'start', 'Start');

  if (phase === 'done') return null;
  return (
    <div
      onClick={() => phase === 'start' && setPhase('fade')}
      className="as-frame transition-all ease-out"
      style={{
        zIndex: 90,
        transitionDuration: `${FADE_MS}ms`,
        opacity: phase === 'fade' ? 0 : 1,
        transform: phase === 'fade' ? 'scale(1.08)' : 'scale(1)',
        filter: phase === 'fade' ? 'blur(8px) brightness(1.3)' : 'none',
      }}
    >
      <ColonySplash label={phase === 'hold' ? 'Going online…' : 'Ready to go online'} />
      {phase !== 'hold' && (
        <button type="button" className="absolute inset-x-0 bottom-20 z-10 mx-auto w-fit bg-slate-950 px-4 py-2 font-heading text-lg font-bold uppercase tracking-[0.3em] text-editorial-gold hh-blink">
          Press Start
        </button>
      )}
    </div>
  );
}
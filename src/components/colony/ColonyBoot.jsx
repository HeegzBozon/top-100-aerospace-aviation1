import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColonySplash from './ColonySplash';
import { registerPicker } from '@/components/handheld/handheldPicker';
import { isReturningVisitor } from '@/components/core/appOpening';

const KEY = 'colony-boot-seen';
const HOLD_MS = 1600;

// The first screen of every session: the Colony plate, then two paths —
// Start/Continue into the campus, or the Main Menu (the title screen).
export default function ColonyBoot({ onDone }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [sel, setSel] = useState(0);
  const [returning] = useState(() => isReturningVisitor() || !!localStorage.getItem('colony-room'));
  const options = [
    { label: returning ? 'Continue' : 'Press Start', to: '/colony' },
    { label: 'Main Menu', to: '/' },
  ];
  const ref = useRef({});
  const choose = (i) => {
    sessionStorage.setItem(KEY, '1');
    sessionStorage.setItem('colony-intro-seen', '1');
    navigate(options[i].to);
    onDone();
  };
  ref.current = { choose, sel };

  useEffect(() => {
    document.getElementById('boot-shell')?.remove();
    const t = setTimeout(() => setReady(true), HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const onKey = (e) => {
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) setSel(0);
      else if (['ArrowDown', 'ArrowRight'].includes(e.key)) setSel(1);
      else if (e.key === 'Enter' || e.key === ' ') ref.current.choose(ref.current.sel);
    };
    window.addEventListener('keydown', onKey);
    const off = registerPicker({
      modal: true,
      enterLabel: 'Select',
      labels: () => options.map((o) => o.label),
      index: () => ref.current.sel,
      step: (d) => { setSel((s) => Math.max(0, Math.min(1, s + d))); return true; },
      goTo: (i) => setSel(i),
      page: () => true,
      enter: () => { ref.current.choose(ref.current.sel); return true; },
      back: () => true,
    });
    return () => { window.removeEventListener('keydown', onKey); off(); };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="as-frame" style={{ zIndex: 95 }}>
      <ColonySplash label={ready ? 'Ready to go online' : 'Going online…'} />
      {ready && (
        <div className="absolute inset-x-0 bottom-20 z-10 flex flex-col items-center gap-3 as-rise">
          {options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              onClick={() => choose(i)}
              onMouseEnter={() => setSel(i)}
              className={`min-w-[200px] px-5 py-2.5 font-heading text-base font-bold uppercase tracking-[0.28em] transition-colors ${
                i === 0
                  ? 'bg-editorial-copper text-editorial-cream'
                  : 'bg-slate-950/85 text-editorial-gold ring-1 ring-editorial-gold/60'
              } ${sel === i ? 'ring-2 ring-editorial-cream' : ''} ${sel === i && i === 0 ? 'hh-blink' : ''}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const bootSeen = () => !!sessionStorage.getItem(KEY);
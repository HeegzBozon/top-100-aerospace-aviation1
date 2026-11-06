import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColonySplash from './ColonySplash';
import AdminQuickActions from '@/components/start/AdminQuickActions';
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
    // A word, not an order: the plate opens the floor rather than shouting at the reader.
    { label: returning ? 'Continue' : 'Enter', to: '/colony' },
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
      <ColonySplash ready={ready} label={ready ? 'Connected' : 'Connecting…'} />

      {/* The operator's key, in the corner of the plate: a way straight into the tools
          from the splash, for whoever runs the house. */}
      <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
        <AdminQuickActions
          variant="desk"
          onNavigate={() => {
            sessionStorage.setItem(KEY, '1');
            sessionStorage.setItem('colony-intro-seen', '1');
            onDone();
          }}
        />
      </div>
      {/* The two ways off the plate, set as a line of type rather than as keys: each
          choice is a word in the house face, and the one the ring is standing on is the
          one with a copper rule drawn under it. Nothing blinks, nothing is filled, and
          nothing is boxed — the plate stays the picture and the type stays on it. */}
      {ready && (
        <div className="absolute inset-x-0 bottom-20 z-10 flex items-center justify-center as-rise">
          {options.map((o, i) => {
            const on = sel === i;
            return (
              <div key={o.label} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-5 h-3 w-px md:mx-8"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent, rgb(var(--editorial-gold-rgb) / 0.5), transparent)',
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => choose(i)}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  className="group relative px-1 pb-2.5 pt-1.5 focus:outline-none"
                >
                  <span
                    className={`font-heading text-[13px] uppercase leading-none tracking-[0.36em] transition-colors duration-300 md:text-[15px] ${
                      on
                        ? 'text-editorial-cream'
                        : 'text-editorial-cream/50 group-hover:text-editorial-cream/75'
                    }`}
                  >
                    {o.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-center transition-transform duration-500 ease-out"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgb(var(--editorial-gold-rgb) / 0.85), rgb(var(--editorial-copper-rgb) / 0.9), transparent)',
                      transform: `scaleX(${on ? 1 : 0})`,
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const bootSeen = () => !!sessionStorage.getItem(KEY);
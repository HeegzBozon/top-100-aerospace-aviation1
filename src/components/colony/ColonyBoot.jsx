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
      {/* The two ways off the plate. Each choice is a word in the house face, set large
          enough to be read at arm's length, and each carries its own rule — faint while it
          is merely offered, copper and full once the ring is standing on it. Still nothing
          blinks, nothing is filled and nothing is boxed: the type is the control, so it
          has to carry the weight the box used to. The band under them is the plate's own
          navy, laid down so the words hold against the picture. */}
      {ready && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center bg-gradient-to-t from-editorial-navy/80 via-editorial-navy/30 to-transparent px-4 pb-4 pt-10 md:bottom-16 md:px-5 md:pb-5 as-rise">
          {options.map((o, i) => {
            const on = sel === i;
            return (
              <div key={o.label} className="flex items-center">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="mx-5 h-5 w-px md:mx-9"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent, rgb(var(--editorial-gold-rgb) / 0.65), transparent)',
                    }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => choose(i)}
                  onMouseEnter={() => setSel(i)}
                  onFocus={() => setSel(i)}
                  className="group relative px-1 pb-3 pt-2 focus:outline-none"
                >
                  <span
                    className={`font-heading text-[19px] uppercase leading-none tracking-[0.2em] transition-colors duration-300 md:text-[30px] ${
                      on
                        ? 'text-editorial-cream'
                        : 'text-editorial-cream/75 group-hover:text-editorial-cream'
                    }`}
                    style={{ textShadow: '0 1px 22px rgb(var(--editorial-navy-rgb) / 0.95)' }}
                  >
                    {o.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 origin-center transition-all duration-500 ease-out"
                    style={{
                      height: on ? 3 : 1,
                      background: on
                        ? 'linear-gradient(90deg, transparent, rgb(var(--editorial-gold-rgb)) 14%, rgb(var(--editorial-copper-rgb)) 86%, transparent)'
                        : 'linear-gradient(90deg, transparent, rgb(var(--editorial-cream-rgb) / 0.55), transparent)',
                      transform: `scaleX(${on ? 1 : 0.7})`,
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
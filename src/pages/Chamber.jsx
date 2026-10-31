import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hourPhase } from '@/components/core/appOpening';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import revealCursor from '@/components/handheld/revealCursor';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import ChamberKeys from '@/components/chamber/ChamberKeys';
import HouseOffices from '@/components/chamber/HouseOffices';
import { CHAMBER_COUNTERS, CHAMBER_OFFICES } from '@/components/chamber/chamberPrograms';

// The Chamber of Commerce. Two counters on it — the App Store and the Gift Shop — and
// behind them the offices the house does business from: its three practices, the
// accelerator, membership, partnership, and the round.
//
// It is drawn the way Review is, as a menu with keys, because that is the one shape both
// controls are good at: the ring walks every counter and every office in one list, the
// one under the cursor is lit and reads itself out below, and # opens it. The keypad's
// numbers work too, and an office that lives off the platform (the round) opens in its
// own window rather than pretending to be a page here.
export default function Chamber() {
  const navigate = useNavigate();
  const [phase] = useState(() => hourPhase());
  const programs = useMemo(() => [...CHAMBER_COUNTERS, ...CHAMBER_OFFICES], []);
  const [cursorKey, setCursorKey] = useState(programs[0].key);

  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  const land = useCallback((target) => {
    if (target < 0 || target >= programs.length) return null;
    cursorRef.current = programs[target].key;
    setCursorKey(programs[target].key);
    return programs[target].label;
  }, [programs]);

  const here = useCallback(
    () => Math.max(0, programs.findIndex((program) => program.key === cursorRef.current)),
    [programs],
  );

  const programsRef = useRef(programs);
  programsRef.current = programs;

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => programsRef.current.map((program) => program.label),
      index: here,
      // One counter or office to the left or the right, and the list stops at its ends.
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      code: () => programsRef.current[here()]?.index || null,
      // The number printed on an entry is what the keypad types: press 7 and Membership
      // is pressed, the cursor lands on it and it opens.
      goToCode: (code) => {
        const target = programsRef.current.findIndex((program) => program.index === String(code));
        if (target < 0) return null;
        const label = land(target);
        if (label) api.current.enter();
        return label;
      },
      enter: () => {
        const program = programsRef.current.find((item) => item.key === cursorRef.current);
        if (!program) return false;
        if (program.href) {
          window.open(program.href, "_blank", "noopener,noreferrer");
          return true;
        }
        if (!program.to) return false;
        navigate(program.to);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, programs.length]);

  // The ring can land on an office as easily as on a counter, so the reveal is done once
  // for the whole list: whichever entry is lit, the glass brings it into view.
  useEffect(() => {
    revealCursor(cursorKey);
  }, [cursorKey]);

  const active = programs.find((program) => program.key === cursorKey) || programs[0];

  return (
    /* The same window the other title surfaces are drawn in: on a phone this is a page
       the picture can scroll while the keys are up, on a desk it is the whole sheet. */
    <div className="hh-slide-window hh-scroll-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      <div
        className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-screen"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-5 pb-4 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          <div className="hh-title-block mt-4 shrink-0 md:mt-10">
            <div
              className="h-px w-24 md:w-56"
              style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }}
            />
            <h1 className="mt-3 font-heading text-[2.05rem] leading-[0.95] tracking-[-0.01em] text-editorial-cream md:text-7xl">
              Chamber of Commerce
            </h1>
            <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.34em] text-editorial-cream/60 md:text-[11px]">
              The counters &middot; The house&rsquo;s offices
            </p>
          </div>

          <div className="mt-5 md:mt-9">
            <p className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.3em] text-editorial-gold/70 md:mb-3 md:text-[9px]">
              The counters
            </p>
            <ChamberKeys programs={CHAMBER_COUNTERS} cursorKey={cursorKey} />
          </div>

          <div className="mt-5 md:mt-8">
            <p className="mb-2 text-[7.5px] font-bold uppercase tracking-[0.3em] text-editorial-gold/70 md:mb-3 md:text-[9px]">
              The house
            </p>
            <HouseOffices programs={CHAMBER_OFFICES} cursorKey={cursorKey} />
          </div>

          {/* The entry under the cursor reads itself out below the list, so the wheel can
              be turned without looking back up to know what it has landed on. */}
          {active ? (
            <p className="mt-3.5 min-h-[2.6em] text-[10.5px] leading-relaxed text-editorial-cream/72 md:mt-6 md:min-h-0 md:text-[13px]">
              {active.blurb}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.22em] text-editorial-cream/45 md:mt-8 md:text-[9.5px]">
            <span>Turn to walk</span>
            <span className="text-editorial-cream/25">/</span>
            <span># to open</span>
          </div>

          <div className="mt-8 hidden md:block">
            <StartMetaRow />
          </div>
        </div>
      </div>
    </div>
  );
}
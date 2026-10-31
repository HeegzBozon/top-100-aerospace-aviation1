import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import useConferences from '@/components/conferences/useConferences';
import { phaseForRoom } from '@/components/conference-room/conferenceRoomConfig';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import revealCursor from '@/components/handheld/revealCursor';
import ConferenceStage from './ConferenceStage';
import ConferenceScorecard from './ConferenceScorecard';
import ConferenceStageBar from './ConferenceStageBar';
import { CONFERENCE_APPS } from './conferenceApps';

// THE TITLE SCREEN OF THE CONFERENCES MACHINE.
//
// The circuit opens the way the platform does: the lights down, the masthead, one
// instrument band reading the season, and the three applications set out as
// cartridges. It is both things the launcher has to be at once — a unified reading of
// where the circuit stands, and the way into each of the three doors — because a
// Fellow arriving should never have to choose between seeing the state of things and
// doing something about it.
//
// It is a menu, so the console treats it as one: the cartridges are handed to the
// ring as a picker, the wheel walks them and stops at the ends of the row, A opens
// the one standing under the cursor, and on the radio face the printed number is
// what the keypad types. The cursor is held as a key, so the row can gain an
// application without the selection jumping.
export default function ConferenceLauncher() {
  const navigate = useNavigate();
  const { state, circuit, myRoomIds, retry } = useConferences();
  const [cursorKey, setCursorKey] = useState(null);

  // What the band reads, from the same records every other surface counts from.
  const counts = useMemo(() => {
    let ahead = 0;
    let live = 0;
    circuit.forEach((room) => {
      const phase = phaseForRoom(room);
      if (phase === 'live') live += 1;
      else if (phase === 'upcoming') ahead += 1;
    });
    return { ahead, live, declared: myRoomIds?.size || 0 };
  }, [circuit, myRoomIds]);

  const optionsRef = useRef(CONFERENCE_APPS);
  optionsRef.current = CONFERENCE_APPS;
  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  const land = useCallback((target) => {
    const list = optionsRef.current;
    if (target < 0 || target >= list.length) return null;
    cursorRef.current = list[target].key;
    setCursorKey(list[target].key);
    return list[target].label;
  }, []);

  const here = useCallback(
    () => Math.max(0, optionsRef.current.findIndex((option) => option.key === cursorRef.current)),
    [],
  );

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => optionsRef.current.map((option) => option.label),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      // The number printed on the cartridge's spine is the number the keypad types.
      code: () => optionsRef.current[here()]?.index || null,
      goToCode: (code) => {
        const wanted = String(code).padStart(2, '0');
        const target = optionsRef.current.findIndex((option) => option.index === wanted);
        if (target < 0) return null;
        const label = land(target);
        if (label) api.current.enter();
        return label;
      },
      enter: () => {
        const option = optionsRef.current.find((item) => item.key === cursorRef.current);
        if (!option?.to) return false;
        navigate(option.to);
        return true;
      },
      // Nothing of the console's own is opened over this surface, so the back key is
      // left to do what it always does.
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);
  useEffect(() => { touchPicker(); }, [cursorKey]);
  useEffect(() => { revealCursor(cursorKey); }, [cursorKey]);

  return (
    <div className="hh-scroll-window relative flex min-h-screen flex-col overflow-hidden">
      <ConferenceStage />

      <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-3 pt-6 md:mx-auto md:w-full md:max-w-5xl md:px-8 md:pb-12 md:pt-14">
        <header className="cfs-rise shrink-0">
          <h1 className="font-heading text-[40px] leading-[0.92] text-editorial-cream md:text-[68px]">
            Conferences
          </h1>
        </header>

        <div className="cfs-rise cfs-rise-1 mt-4 shrink-0">
          <ConferenceScorecard loading={state.loading} failed={state.failed} counts={counts} />

          {state.failed ? (
            <button
              type="button"
              onClick={retry}
              className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-editorial-gold"
            >
              <RotateCcw className="h-3 w-3" /> Read the circuit again
            </button>
          ) : null}
        </div>

        <div className="cfs-rise cfs-rise-2 mt-auto shrink-0 pt-4 md:pt-9">
          <ConferenceStageBar cursorKey={cursorKey} />
        </div>

      </div>
    </div>
  );
}
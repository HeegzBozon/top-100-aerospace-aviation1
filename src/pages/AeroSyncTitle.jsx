import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hourPhase } from '@/components/core/appOpening';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import HomeDock from '@/components/home-v3/HomeDock';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';
import AeroSyncActions from '@/components/aerosync/AeroSyncActions';
import AeroSyncMark from '@/components/aerosync/AeroSyncMark';
import AeroSyncStateLine from '@/components/aerosync/AeroSyncStateLine';
import { AEROSYNC_MENU } from '@/components/aerosync/aeroSyncMenuConfig';

// The AeroSync title screen. The CRM opens like a cartridge of its own, on the same machine
// as the platform's title screen: the hour's sky, the mark, the readings the rolodex stands
// on, the capture offered beside them, and the features as keys. The console treats it as a
// menu — the keys are handed to the ring as a picker and the cursor it walks is the
// selection drawn on the grid — and A opens what the cursor is standing on.
export default function AeroSyncTitle() {
  const navigate = useNavigate();
  const [phase] = useState(() => hourPhase());
  const [cursorKey, setCursorKey] = useState(AEROSYNC_MENU[0].key);

  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  // The cursor is held as a key, not a position, so the selection never jumps when the
  // grid changes shape around it.
  const land = useCallback((target) => {
    if (target < 0 || target >= AEROSYNC_MENU.length) return null;
    cursorRef.current = AEROSYNC_MENU[target].key;
    setCursorKey(AEROSYNC_MENU[target].key);
    return AEROSYNC_MENU[target].label;
  }, []);

  const here = useCallback(
    () => Math.max(0, AEROSYNC_MENU.findIndex((option) => option.key === cursorRef.current)),
    [],
  );

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => AEROSYNC_MENU.map((option) => option.label),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      enter: () => {
        const option = AEROSYNC_MENU.find((item) => item.key === cursorRef.current);
        if (!option?.to) return false;
        navigate(option.to);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey]);

  return (
    /* The same window the platform's title screen is drawn in: while the keys are up this
       surface stops being one glass tall and becomes a page the picture can scroll. */
    <div className="hh-slide-window hh-scroll-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      <div
        className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-screen"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-5 pb-3 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          <div className="hh-title-block mt-4 shrink-0 md:mt-10">
            <AeroSyncMark />
            <div className="mt-3 md:mt-4">
              <AeroSyncStateLine />
              <AeroSyncActions cursorKey={cursorKey} />
            </div>
          </div>

          <StartSurfaceKeys items={AEROSYNC_MENU} cursorKey={cursorKey} />

          {/* The stamp closes the screen on a desk. On the phone the same stamp is printed
              on the device itself, in the band across the foot of the glass. */}
          <div className="mt-8 hidden md:block">
            <StartMetaRow />
          </div>
        </div>

        <div className="hidden md:block">
          <div className="h-20" />
          <HomeDock />
        </div>
      </div>
    </div>
  );
}
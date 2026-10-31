import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hourPhase } from '@/components/core/appOpening';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import StartSky from '@/components/start/StartSky';
import StartSurfaceKeys from '@/components/start/StartSurfaceKeys';
import AppStoreMark from '@/components/appstore/AppStoreMark';
import DesktopAppStoreScreen from '@/components/appstore/DesktopAppStoreScreen';
import { storeCounts, storeMenuItems } from '@/components/appstore/storeMenuConfig';

// The App Store opens the way the platform opens: the hour's sky, the house's rule in
// copper, the store's mark, and the tools as keys. The same menu on both machines — the
// phone walks it with the ring, the desk lists it as modules on the cover.
export default function AppStore() {
  const navigate = useNavigate();
  const [phase] = useState(() => hourPhase());
  const items = useMemo(() => storeMenuItems(), []);
  const counts = useMemo(() => storeCounts(), []);
  const [cursorKey, setCursorKey] = useState(items[0].key);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  // The cursor is held as a key, so the selection survives a re-render of the shelf.
  const land = useCallback((target) => {
    const list = itemsRef.current;
    if (target < 0 || target >= list.length) return null;
    cursorRef.current = list[target].key;
    setCursorKey(list[target].key);
    return list[target].label;
  }, []);

  const here = useCallback(
    () => Math.max(0, itemsRef.current.findIndex((item) => item.key === cursorRef.current)),
    [],
  );

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => itemsRef.current.map((item) => item.label),
      index: here,
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      enter: () => {
        const item = itemsRef.current.find((entry) => entry.key === cursorRef.current);
        if (!item?.to) return false;
        navigate(item.to);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, items.length]);

  return (
    <>
      <div className="hidden md:block">
        <DesktopAppStoreScreen phase={phase} items={items} counts={counts} />
      </div>

      <div className="md:hidden">
        <div className="hh-slide-window hh-scroll-window relative flex flex-col">
          <div
            className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden"
            style={{ background: phase.sky }}
          >
            <StartSky phase={phase} />

            <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-5 pb-3 pt-5">
              <div className="hh-title-block mt-4 shrink-0">
                <AppStoreMark />
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-px w-8 shrink-0"
                    style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C)' }}
                  />
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-editorial-cream/60">
                    {counts.open} open
                    <span className="px-1.5 text-editorial-gold/60">·</span>
                    {counts.building} on the bench
                  </p>
                </div>
              </div>

              <StartSurfaceKeys items={items} cursorKey={cursorKey} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hourPhase } from '@/components/core/appOpening';
import { useAuth } from '@/lib/AuthContext';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import StartSky from '@/components/start/StartSky';
import StartMetaRow from '@/components/start/StartMetaRow';
import ReviewKeys from '@/components/review/ReviewKeys';
import { reviewTabsFor } from '@/components/review/reviewTabs';

// Review. One surface where the errands that used to stand as their own keys on the
// title screen now live as tabs: the FAQ, My Network, the Fellow's own record, and
// the archive of closed cycles.
//
// It is a menu with tabs, which is the one shape both controls are good at: the ring
// (or ▲ / ▼) walks the strip, the tab under it is lit and reads itself out below, and #
// opens it. The keypad's own numbers work too — 1, 2, 3 press the tab printed with that
// number, the way every other numbered key on this machine does.
export default function Review() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase] = useState(() => hourPhase());
  const tabs = reviewTabsFor(!!user);
  const [cursorKey, setCursorKey] = useState(() => tabs[0]?.key ?? null);

  const cursorRef = useRef(cursorKey);
  cursorRef.current = cursorKey;

  useEffect(() => {
    // A visitor has no record tab: if the cursor was standing on it when the tabs
    // changed shape, it falls back to the first tab rather than opening nothing.
    if (!tabs.some((tab) => tab.key === cursorRef.current) && tabs[0]) {
      cursorRef.current = tabs[0].key;
      setCursorKey(tabs[0].key);
    }
  }, [tabs]);

  const land = useCallback((target) => {
    if (target < 0 || target >= tabs.length) return null;
    cursorRef.current = tabs[target].key;
    setCursorKey(tabs[target].key);
    return tabs[target].label;
  }, [tabs]);

  const here = useCallback(
    () => Math.max(0, tabs.findIndex((tab) => tab.key === cursorRef.current)),
    [tabs],
  );

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => tabsRef.current.map((tab) => tab.label),
      index: here,
      // One tab to the left or the right, and the strip stops at its ends.
      step: (direction) => land(here() + direction),
      page: (direction) => land(here() + direction),
      goTo: (i) => land(i),
      code: () => tabsRef.current[here()]?.index || null,
      // The number printed on a tab is what the keypad types: press 2 and Edit profile
      // is pressed, the cursor lands on it and it opens.
      goToCode: (code) => {
        const target = tabsRef.current.findIndex((tab) => tab.index === String(code));
        if (target < 0) return null;
        const label = land(target);
        if (label) api.current.enter();
        return label;
      },
      enter: () => {
        const tab = tabsRef.current.find((item) => item.key === cursorRef.current);
        if (!tab?.to) return false;
        navigate(tab.to);
        return true;
      },
      back: () => false,
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursorKey, tabs.length]);

  const active = tabs.find((tab) => tab.key === cursorKey) || tabs[0];

  return (
    /* The same window the other title surfaces are drawn in: on a phone this stops
       being one glass tall and becomes a page the picture can scroll while the keys
       are up. */
    <div className="hh-slide-window hh-scroll-window relative flex flex-col md:block md:h-auto md:min-h-screen">
      <div
        className="hh-scroll-plane relative flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-screen"
        style={{ background: phase.sky }}
      >
        <StartSky phase={phase} />

        <div className="hh-scroll-page relative flex min-h-0 flex-1 flex-col px-5 pb-3 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-16 md:pb-14 md:pt-14">
          <div className="hh-title-block mt-4 shrink-0 md:mt-10">
            <div
              className="h-px w-24 md:w-56"
              style={{ background: 'linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)' }}
            />
            <h1 className="mt-3 font-heading text-[2.5rem] leading-[0.95] tracking-[-0.01em] text-editorial-cream md:text-7xl">
              Review
            </h1>
            <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.34em] text-editorial-cream/60 md:text-[11px]">
              FAQ &middot; My Network &middot; Your record &middot; The edition &middot; The archive
            </p>
          </div>

          <div className="mt-6 md:mt-10">
            <ReviewKeys tabs={tabs} cursorKey={cursorKey} />
          </div>

          {/* The tab under the cursor reads itself out below the strip, so the wheel can
              be turned without looking down at the keys to know what it has landed on. */}
          {active ? (
            <p className="mt-4 min-h-[3.4em] text-[10.5px] leading-relaxed text-editorial-cream/72 md:mt-6 md:min-h-0 md:text-[13px]">
              {active.blurb}
            </p>
          ) : null}

          <div className="mt-4 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.22em] text-editorial-cream/45 md:mt-8 md:text-[9.5px]">
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
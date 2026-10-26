import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ClickWheel from "./ClickWheel";
import HandheldMasthead from "./HandheldMasthead";
import HandheldScreenFrame from "./HandheldScreenFrame";
import HandheldMenu from "./HandheldMenu";
import HandheldBoot from "./HandheldBoot";
import useHandheldDestinations from "./useHandheldDestinations";
import { surfaceLabel } from "./handheldDestinations";
import { blip, buzz, isSoundOn, persistSound } from "./handheldSound";

// Chrome the device occupies: the masthead plus the viewer's status line above,
// and the control chin below. index.css consumes these to inset every surface,
// so nothing is ever hidden behind the hardware.
export const HANDHELD_TOP_CLEARANCE = 90;
export const HANDHELD_DECK_CLEARANCE = 188;

const BOOT_KEY = "top100-handheld-booted";

const faceStyle = (from, to, shadow) => ({
  background: `linear-gradient(180deg, ${from}, ${to})`,
  boxShadow: shadow,
});

const pillStyle = {
  background: "linear-gradient(180deg, #2A4E76, #1E3A5A)",
  boxShadow: "inset 0 1px 0 rgba(250,248,245,0.24), 0 2px 5px rgba(30,58,90,0.30)",
};

// The handheld. One body: a masthead bezel, a viewer the content renders in, and
// a chin carrying a click wheel, A/B, SELECT/START and the speaker. The wheel is
// the navigation instrument — rotating it scrolls the picture, or walks the
// cartridge menu when one is loaded.
export default function HandheldDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn } = useHandheldDestinations();

  const [soundOn, setSoundOn] = useState(() => isSoundOn());
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [booting, setBooting] = useState(() => {
    try {
      return sessionStorage.getItem(BOOT_KEY) !== "1";
    } catch {
      return false;
    }
  });

  const flat = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);
  const railItems = useMemo(() => groups.find((group) => group.key === "rail")?.items || [], [groups]);

  // Reserve the hardware's space, and hand it back when the console is put away.
  useEffect(() => {
    document.body.classList.add("hh-shell");
    const root = document.documentElement.style;
    root.setProperty("--hh-top", `${HANDHELD_TOP_CLEARANCE}px`);
    root.setProperty("--hh-bottom", `${HANDHELD_DECK_CLEARANCE}px`);
    return () => {
      document.body.classList.remove("hh-shell");
      root.setProperty("--hh-top", "0px");
      root.setProperty("--hh-bottom", "0px");
    };
  }, []);

  const finishBoot = useCallback(() => {
    setBooting(false);
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      // Storage unavailable — the sequence simply plays again next visit.
    }
  }, []);

  const go = useCallback(
    (destination, tone = "select") => {
      if (!destination) return;
      blip(tone);
      buzz();
      setMenuOpen(false);

      if (destination.action === "signin") return base44.auth.redirectToLogin(window.location.href);
      if (destination.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
      if (destination.href) {
        window.open(destination.href, "_blank", "noopener");
        return;
      }
      if (destination.to) navigate(destination.to);
    },
    [navigate],
  );

  const openMenu = useCallback(() => {
    const current = flat.findIndex((item) => item.to && item.to === locationKey);
    setCursor(current >= 0 ? current : 0);
    setMenuOpen(true);
    finishBoot();
    blip("open");
    buzz();
  }, [flat, locationKey, finishBoot]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    blip("back");
  }, []);

  const toggleMenu = useCallback(() => {
    if (booting) finishBoot();
    if (menuOpen) closeMenu();
    else openMenu();
  }, [booting, finishBoot, menuOpen, closeMenu, openMenu]);

  const goHome = useCallback(() => {
    blip("start");
    buzz();
    setMenuOpen(false);
    navigate("/");
  }, [navigate]);

  // Rotating the wheel: walk the menu, or scroll the picture like a scroll wheel.
  const rotate = useCallback(
    (step) => {
      finishBoot();
      if (menuOpen) {
        if (!flat.length) return;
        setCursor((prev) => (prev + step + flat.length) % flat.length);
        return;
      }
      const viewer = document.querySelector("[data-handheld-screen]");
      const delta = step * 54;
      if (viewer && viewer.scrollHeight > viewer.clientHeight + 4) {
        viewer.scrollTop += delta;
      } else {
        window.scrollBy(0, delta);
      }
    },
    [menuOpen, flat.length, finishBoot],
  );

  const jumpGroup = useCallback(
    (step) => {
      const starts = [];
      let running = 0;
      groups.forEach((group) => {
        starts.push(running);
        running += group.items.length;
      });
      if (!starts.length) return;
      const currentGroup = starts.filter((start) => start <= cursor).length - 1;
      const nextGroup = Math.min(Math.max(currentGroup + step, 0), starts.length - 1);
      setCursor(starts[nextGroup]);
      blip("move");
    },
    [groups, cursor],
  );

  const cycleRail = useCallback(
    (step) => {
      if (!railItems.length) return;
      const current = railItems.findIndex((item) => item.to && item.to.split("?")[0] === location.pathname);
      const next =
        current === -1
          ? step > 0
            ? 0
            : railItems.length - 1
          : (current + step + railItems.length) % railItems.length;
      go(railItems[next], "move");
    },
    [railItems, location.pathname, go],
  );

  const select = useCallback(() => {
    finishBoot();
    if (!menuOpen) return openMenu();
    const item = flat[cursor];
    if (item) go(item);
    else closeMenu();
  }, [finishBoot, menuOpen, openMenu, flat, cursor, go, closeMenu]);

  const back = useCallback(() => {
    blip("back");
    buzz();
    if (booting) return finishBoot();
    if (menuOpen) return closeMenu();
    navigate(-1);
  }, [booting, finishBoot, menuOpen, closeMenu, navigate]);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      persistSound(!prev);
      if (!prev) setTimeout(() => blip("toggle"), 0);
      return !prev;
    });
    buzz();
  }, []);

  return (
    <>
      <HandheldMasthead
        surface={surface}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onOpenMenu={toggleMenu}
      />

      <HandheldScreenFrame surface={surface} />

      {booting && <HandheldBoot onDone={finishBoot} />}

      {menuOpen && !booting && (
        <HandheldMenu
          groups={groups}
          cursor={cursor}
          locationKey={locationKey}
          onActivate={(item) => go(item)}
          onJump={() => jumpGroup(1)}
          onClose={closeMenu}
        />
      )}

      <nav
        aria-label="Handheld console controls"
        className="fixed bottom-0 left-0 right-0 z-40 select-none md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "linear-gradient(180deg, #F5EFE4 0%, #E9E0D0 55%, #D9CEBA 100%)",
          borderTop: "1px solid rgba(184,115,51,0.45)",
          boxShadow: "0 -10px 26px rgba(30,58,90,0.22), inset 0 1px 0 rgba(255,255,255,0.85)",
        }}
      >
        <div className="flex items-start gap-3 px-4 pt-3">
          <ClickWheel
            size={132}
            onRotate={rotate}
            onMenu={toggleMenu}
            onPrev={() => (menuOpen ? jumpGroup(-1) : cycleRail(-1))}
            onNext={() => (menuOpen ? jumpGroup(1) : cycleRail(1))}
            onHome={goHome}
            onSelect={select}
          />

          <div className="flex flex-1 flex-col items-end gap-2 pt-0.5">
            <div className="relative h-[72px] w-[106px]">
              <button
                type="button"
                onClick={select}
                aria-label="A — select"
                className="absolute right-0 top-0 flex h-[46px] w-[46px] items-center justify-center rounded-full text-[12px] font-bold text-[#0B1929] transition-transform active:scale-90"
                style={faceStyle("#E0AC73", "#B87333", "inset 0 1px 1px rgba(255,255,255,0.5), 0 4px 10px rgba(7,17,31,0.35)")}
              >
                A
              </button>

              <button
                type="button"
                onClick={back}
                aria-label="B — back"
                className="absolute bottom-0 left-0 flex h-[42px] w-[42px] items-center justify-center rounded-full text-[11px] font-bold text-[#FAF8F5]/85 transition-transform active:scale-90"
                style={faceStyle("#33495F", "#1B2E44", "inset 0 1px 1px rgba(250,248,245,0.24), 0 4px 10px rgba(7,17,31,0.35)")}
              >
                B
              </button>
            </div>

            {/* Speaker grille */}
            <div
              className="h-[30px] w-[106px] rounded-[9px]"
              style={{
                background:
                  "repeating-linear-gradient(112deg, rgba(184,115,51,0.55) 0 3px, rgba(184,115,51,0.08) 3px 10px)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.75)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-5 pb-2 pt-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Select — cartridge menu"
              className="rounded-full px-3 py-[6px] text-[7px] font-bold uppercase tracking-[0.22em] text-[#FAF8F5] transition-transform active:scale-95"
              style={pillStyle}
            >
              Select
            </button>
            <button
              type="button"
              onClick={goHome}
              aria-label="Start — home"
              className="rounded-full px-3 py-[6px] text-[7px] font-bold uppercase tracking-[0.22em] text-[#FAF8F5] transition-transform active:scale-95"
              style={pillStyle}
            >
              Start
            </button>
          </div>

          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#1E3A5A]/40">
            {isSignedIn ? "TOP 100 OS · HW-88" : "VISITOR MODE"}
          </span>
        </div>
      </nav>
    </>
  );
}
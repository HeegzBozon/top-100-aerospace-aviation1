import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ClickWheel from "./ClickWheel";
import FaceButtons from "./FaceButtons";
import HandheldMasthead from "./HandheldMasthead";
import HandheldScreenFrame from "./HandheldScreenFrame";
import HandheldMenu from "./HandheldMenu";
import HandheldBoot from "./HandheldBoot";
import ModuleRail from "./ModuleRail";
import useHandheldDestinations from "./useHandheldDestinations";
import useModuleNavigation, { getStage } from "./useModuleNavigation";
import { surfaceLabel } from "./handheldDestinations";
import { blip, buzz, isSoundOn, persistSound } from "./handheldSound";

// Chrome the device occupies: the masthead plus the viewer's status line above,
// and the control chin below. index.css consumes these to inset every surface,
// so nothing is ever hidden behind the hardware.
export const HANDHELD_TOP_CLEARANCE = 82;
export const HANDHELD_DECK_CLEARANCE = 176;

const BOOT_KEY = "top100-handheld-booted";

// The handheld. One body: a masthead bezel, a viewer the content renders in,
// and a chin carrying the click wheel, the face-button diamond and the grille.
// The wheel does it all — rotation scrolls the picture or walks the cartridge
// menu, MENU opens it, back and forward step the page's modules, play reads the
// page down the glass, and the centre goes home.
export default function HandheldDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn } = useHandheldDestinations();

  const [soundOn, setSoundOn] = useState(() => isSoundOn());
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [flash, setFlash] = useState("");
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

  const nav = useModuleNavigation(locationKey);
  const flashTimer = useRef(0);

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

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // The read-along: the wheel's play zone walks the page down the glass until
  // the bottom arrives or the reader takes over.
  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    const advance = () => {
      const stage = getStage();
      if (!stage) {
        setPlaying(false);
        return;
      }
      if (stage.scrollTop >= stage.scrollHeight - stage.clientHeight - 1) {
        setPlaying(false);
        return;
      }
      stage.scrollTop += 1;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const announce = useCallback((label) => {
    if (!label) return;
    setFlash(label);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(""), 1400);
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
      setPlaying(false);

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
    setPlaying(false);
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
    setPlaying(false);
    navigate("/");
  }, [navigate]);

  // Rotating the wheel: walk the menu, or scroll the picture like a scroll wheel.
  const rotate = useCallback(
    (step) => {
      finishBoot();
      setPlaying(false);
      if (menuOpen) {
        if (!flat.length) return;
        setCursor((prev) => (prev + step + flat.length) % flat.length);
        return;
      }
      const stage = getStage();
      const delta = step * 54;
      if (stage && stage.scrollHeight > stage.clientHeight + 4) stage.scrollTop += delta;
      else window.scrollBy(0, delta);
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

  // Back and forward on the ring: step a module where the surface declares any,
  // otherwise move a screenful. In the menu they hop whole groups.
  const stepSection = useCallback(
    (direction) => {
      finishBoot();
      setPlaying(false);
      if (menuOpen) return jumpGroup(direction);
      const target = nav.step(direction);
      if (target !== null) {
        blip("move");
        announce(nav.modules[target]?.label);
        return;
      }
      if (!nav.modules.length) {
        blip("move");
        nav.jump(direction);
        return;
      }
      blip("back");
    },
    [menuOpen, jumpGroup, nav, finishBoot, announce],
  );

  const jumpToModule = useCallback(
    (i) => {
      blip("move");
      setPlaying(false);
      if (nav.goTo(i) !== null) announce(nav.modules[i]?.label);
    },
    [nav, announce],
  );

  const togglePlay = useCallback(() => {
    if (menuOpen) return;
    blip("toggle");
    buzz();
    setPlaying((prev) => !prev);
    announce(playing ? "Paused" : "Reading");
  }, [menuOpen, playing, announce]);

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
      <HandheldMasthead surface={surface} soundOn={soundOn} onToggleSound={toggleSound} />

      <HandheldScreenFrame surface={surface} module={nav.modules[nav.index]?.label} />

      <ModuleRail modules={nav.modules} index={nav.index} onJump={jumpToModule} />

      {/* Section announcement — the page reports where the wheel just landed */}
      {flash && (
        <div
          className="pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 md:hidden"
          style={{ bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom) + 10px)" }}
        >
          <span
            className="hh-flash flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[8px] font-bold uppercase tracking-[0.2em] text-[#FAF8F5]"
            style={{ background: "rgba(7,17,31,0.88)", boxShadow: "0 4px 14px rgba(7,17,31,0.42)" }}
          >
            <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[#B87333]" />
            {flash}
          </span>
        </div>
      )}

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
          background: "linear-gradient(180deg, #F7F1E7 0%, #EDE4D6 58%, #DCD0BA 100%)",
          borderTop: "1px solid rgba(184,115,51,0.5)",
          boxShadow: "0 -12px 28px rgba(30,58,90,0.22), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-3">
          {/* Speaker grille — a punched dot matrix, and the left block that
              balances the face buttons so the wheel sits dead centre */}
          <div
            className="h-[76px] w-[76px] shrink-0 rounded-[14px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(184,115,51,0.55) 1px, rgba(184,115,51,0) 1.7px)",
              backgroundSize: "9px 9px",
              backgroundPosition: "4px 4px",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 3px rgba(30,58,90,0.12)",
            }}
          />

          <div className="flex min-w-0 flex-1 justify-center">
            <ClickWheel
              size={132}
              playing={playing}
              onRotate={rotate}
              onMenu={toggleMenu}
              onPrev={() => stepSection(-1)}
              onNext={() => stepSection(1)}
              onPlay={menuOpen ? null : togglePlay}
              onHome={goHome}
            />
          </div>

          <FaceButtons
            onConfirm={select}
            onBack={back}
            onPrev={menuOpen ? () => jumpGroup(-1) : () => cycleRail(-1)}
            onNext={menuOpen ? () => jumpGroup(1) : () => cycleRail(1)}
          />
        </div>

        {/* The chin seam and the model strip */}
        <div
          className="mt-1.5 flex items-center justify-between px-4 pb-1 pt-1.5"
          style={{ borderTop: "1px solid rgba(30,58,90,0.10)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
        >
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#1E3A5A]/35">HW-88</span>
          <span className="flex items-center gap-[4px]">
            <span className="h-[3px] w-[3px] rounded-full bg-[#B87333]/35" />
            <span className="h-[3px] w-[3px] rounded-full bg-[#B87333]/35" />
            <span className="h-[3px] w-[3px] rounded-full bg-[#B87333]/35" />
          </span>
          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#1E3A5A]/35">
            {isSignedIn ? "Fellow" : "Visitor"}
          </span>
        </div>
      </nav>
    </>
  );
}
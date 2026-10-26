import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Palette } from "lucide-react";
import ClickWheel from "./ClickWheel";
import FaceButtons from "./FaceButtons";
import HandheldMasthead from "./HandheldMasthead";
import HandheldScreenFrame from "./HandheldScreenFrame";
import HandheldMenu from "./HandheldMenu";
import HandheldBoot from "./HandheldBoot";
import ModuleRail from "./ModuleRail";
import useHandheldDestinations from "./useHandheldDestinations";
import useModuleNavigation, { getStage } from "./useModuleNavigation";
import { useHandheldDeck, getDeck } from "./handheldDeck";
import HandheldNotifications from "./HandheldNotifications";
import HandheldShareSheet from "./HandheldShareSheet";
import { surfaceLabel } from "./handheldDestinations";
import useHandheldFinish from "./useHandheldFinish";
import { blip, buzz, isSoundOn, persistSound } from "./handheldSound";
import { openingPlaysNow } from "@/components/core/appOpening";

// Chrome the device occupies: the shell lip above the glass, the brand bar that
// lives inside the glass, and the control chin below. index.css consumes these
// to inset every surface, so nothing is ever hidden behind the hardware.
export const HANDHELD_TOP_CLEARANCE = 12;
export const HANDHELD_BAR_CLEARANCE = 52;
export const HANDHELD_DECK_CLEARANCE = 176;

const BOOT_KEY = "top100-handheld-booted";

// The handheld. One body: a masthead bezel, a viewer the content renders in,
// and a chin carrying the click wheel, the face-button diamond and the grille.
// The wheel does it all — rotation scrolls the picture or walks the cartridge
// menu, MENU opens it, back and forward step the page's modules, the bottom key
// plays the page down the glass, and the centre goes home. Sharing sits on Y.
export default function HandheldDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn } = useHandheldDestinations();

  const [soundOn, setSoundOn] = useState(() => isSoundOn());
  const [menuMode, setMenuMode] = useState(null);
  const [cursor, setCursor] = useState(0);
  const menuOpen = menuMode !== null;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [flash, setFlash] = useState("");
  const [booting, setBooting] = useState(() => {
    // The app-wide title card is the power-on when it plays; the console's own
    // sequence only runs on a load that has already had its opening.
    if (openingPlaysNow()) return false;
    try {
      return sessionStorage.getItem(BOOT_KEY) !== "1";
    } catch {
      return false;
    }
  });

  const { finishKey, finish, finishes, chooseFinish } = useHandheldFinish();

  // The finish is hardware, so it lives on the menu beside the cartridges —
  // a drawer of mouldings, not a preference buried in a page.
  const finishItems = useMemo(
    () => finishes.map((option) => ({ label: option.label, finishKey: option.key, swatch: option.swatch })),
    [finishes],
  );

  const menuGroups = useMemo(
    () => [
      ...groups,
      {
        key: "hardware",
        label: "Hardware",
        items: [{ label: `Finish · ${finish.label}`, action: "finish", icon: Palette }],
      },
    ],
    [groups, finish.label],
  );

  const flat = useMemo(() => menuGroups.flatMap((group) => group.items), [menuGroups]);
  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);

  const nav = useModuleNavigation(locationKey);
  const flashTimer = useRef(0);

  // A surface that pages its sections (ModuleSlideDeck) hands the console a deck
  // to turn; everything else falls back to stepping the page's module marks.
  const deck = useHandheldDeck();
  const deckLabels = deck ? deck.labels() : [];
  const modules = deck ? deckLabels.map((label) => ({ label })) : nav.modules;
  const moduleIndex = deck ? deck.index() : nav.index;
  const sectionItems = modules.map((module, i) => ({
    label: module.label,
    sectionIndex: i,
    to: i === moduleIndex ? locationKey : undefined,
  }));

  // What the wheel walks, per drawer it happens to be in.
  const listFor = useCallback(
    (mode) => (mode === "sections" ? sectionItems : mode === "finish" ? finishItems : flat),
    [sectionItems, finishItems, flat],
  );

  // Reserve the hardware's space, and hand it back when the console is put away.
  useEffect(() => {
    document.body.classList.add("hh-shell");
    const root = document.documentElement.style;
    root.setProperty("--hh-top", `${HANDHELD_TOP_CLEARANCE}px`);
    root.setProperty("--hh-bar", `${HANDHELD_BAR_CLEARANCE}px`);
    root.setProperty("--hh-bottom", `${HANDHELD_DECK_CLEARANCE}px`);
    return () => {
      document.body.classList.remove("hh-shell");
      root.setProperty("--hh-top", "0px");
      root.setProperty("--hh-bar", "0px");
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
      const deckApi = getDeck();
      if (deckApi) {
        if (deckApi.atEnd()) {
          if (deckApi.index() >= deckApi.count() - 1) {
            setPlaying(false);
            return;
          }
          deckApi.next();
        } else {
          deckApi.scrollBy(1);
        }
        frame = requestAnimationFrame(advance);
        return;
      }
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
      setMenuMode(null);
      setNotificationsOpen(false);
      setShareOpen(false);

      // Not a cartridge: the hardware drawer opens where you stand.
      if (destination.action === "finish") {
        setCursor(Math.max(0, finishItems.findIndex((item) => item.finishKey === finishKey)));
        setMenuMode("finish");
        return;
      }
      if (destination.action === "signin") return base44.auth.redirectToLogin(window.location.href);
      if (destination.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
      if (destination.href) {
        window.open(destination.href, "_blank", "noopener");
        return;
      }
      if (destination.to) navigate(destination.to);
    },
    [navigate, finishItems, finishKey],
  );

  const openMenu = useCallback(() => {
    const current = flat.findIndex((item) => item.to && item.to === locationKey);
    setCursor(current >= 0 ? current : 0);
    setMenuMode("cartridges");
    setNotificationsOpen(false);
    setShareOpen(false);
    finishBoot();
    blip("open");
    buzz();
  }, [flat, locationKey, finishBoot]);

  // X lists what is on this surface: every slide of the deck, or the page's own
  // modules where the surface declares no deck.
  const openSections = useCallback(() => {
    if (!modules.length) {
      blip("back");
      return;
    }
    setCursor(Math.max(0, moduleIndex));
    setMenuMode("sections");
    setNotificationsOpen(false);
    setShareOpen(false);
    finishBoot();
    blip("open");
    buzz();
  }, [modules.length, moduleIndex, finishBoot]);

  const closeMenu = useCallback(() => {
    setMenuMode(null);
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
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(false);
    navigate("/");
  }, [navigate]);

  // Rotating the wheel: walk the menu, or scroll the picture like a scroll wheel.
  const rotate = useCallback(
    (step) => {
      finishBoot();
      if (menuOpen) {
        const list = listFor(menuMode);
        if (!list.length) return;
        setCursor((prev) => (prev + step + list.length) % list.length);
        return;
      }
      if (deck) {
        deck.scrollBy(step * 54);
        return;
      }
      // Depth first: a surface that scrolls inside its own section — a Board
      // column — gets the ring before the glass or the window does.
      nav.scrollBy(step * 54);
    },
    [menuOpen, menuMode, listFor, deck, finishBoot, nav],
  );

  const jumpGroup = useCallback(
    (step) => {
      const starts = [];
      let running = 0;
      menuGroups.forEach((group) => {
        starts.push(running);
        running += group.items.length;
      });
      if (!starts.length) return;
      const currentGroup = starts.filter((start) => start <= cursor).length - 1;
      const nextGroup = Math.min(Math.max(currentGroup + step, 0), starts.length - 1);
      setCursor(starts[nextGroup]);
      blip("move");
    },
    [menuGroups, cursor],
  );

  // Back and forward on the ring: step a module where the surface declares any,
  // otherwise move a screenful. In the menu they hop whole groups.
  const stepSection = useCallback(
    (direction) => {
      finishBoot();
      if (menuOpen) {
        if (menuMode === "sections" || menuMode === "finish") {
          const list = listFor(menuMode);
          setCursor((prev) => Math.max(0, Math.min(list.length - 1, prev + direction)));
          return;
        }
        return jumpGroup(direction);
      }
      if (deck) {
        const next = deck.index() + direction;
        if (next < 0 || next >= deck.count()) {
          blip("back");
          return;
        }
        if (direction > 0) deck.next();
        else deck.prev();
        blip("move");
        announce(deck.labels()[next]);
        return;
      }
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
    [menuOpen, menuMode, listFor, jumpGroup, deck, nav, finishBoot, announce],
  );

  const jumpToModule = useCallback(
    (i) => {
      blip("move");
      if (deck) {
        deck.goTo(i);
        announce(deck.labels()[i]);
        return;
      }
      if (nav.goTo(i) !== null) announce(nav.modules[i]?.label);
    },
    [deck, nav, announce],
  );

  // The bottom of the ring: the page reads itself down the glass, and the same
  // key stops it.
  const togglePlay = useCallback(() => {
    if (menuOpen || shareOpen || booting) return;
    blip("toggle");
    buzz();
    setPlaying((prev) => !prev);
    announce(playing ? "Paused" : "Reading");
  }, [menuOpen, shareOpen, booting, playing, announce]);

  // Y: the share drawer, opened in the glass — the link you are holding, the
  // code that opens it on a phone, and the ways out of it.
  const share = useCallback(() => {
    if (menuOpen || booting) return;
    blip("open");
    buzz();
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(true);
  }, [booting, menuOpen]);

  // You: the Fellow's own profile where they are signed in, the way in where not.
  const openProfile = useCallback(() => {
    blip("select");
    buzz();
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(false);
    if (!isSignedIn) return base44.auth.redirectToLogin(window.location.href);
    navigate("/Profile");
  }, [isSignedIn, navigate]);

  // What has come in — the same drawer rule as everything else: the way in where
  // there is an account to receive it.
  const openNotifications = useCallback(() => {
    blip("open");
    buzz();
    setMenuMode(null);
    setShareOpen(false);
    if (!isSignedIn) return base44.auth.redirectToLogin(window.location.href);
    setNotificationsOpen(true);
  }, [isSignedIn]);

  const select = useCallback(() => {
    finishBoot();
    if (menuMode === "sections") {
      const item = sectionItems[cursor];
      setMenuMode(null);
      if (item) jumpToModule(item.sectionIndex);
      return;
    }
    if (menuMode === "finish") {
      const item = finishItems[cursor];
      if (item) {
        chooseFinish(item.finishKey);
        blip("toggle");
        buzz();
        announce(`Finish · ${item.label}`);
      }
      return;
    }
    if (!menuOpen) return openMenu();
    const item = flat[cursor];
    if (item) go(item);
    else closeMenu();
  }, [finishBoot, menuMode, sectionItems, finishItems, cursor, jumpToModule, chooseFinish, announce, menuOpen, openMenu, flat, go, closeMenu]);

  const back = useCallback(() => {
    blip("back");
    buzz();
    if (booting) return finishBoot();
    if (shareOpen) return setShareOpen(false);
    if (notificationsOpen) return setNotificationsOpen(false);
    if (menuOpen) return setMenuMode(null);
    navigate(-1);
  }, [booting, finishBoot, menuOpen, notificationsOpen, shareOpen, navigate]);

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
        module={modules[moduleIndex]?.label}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onProfile={openProfile}
        onNotifications={openNotifications}
      />

      <HandheldScreenFrame />

      <ModuleRail modules={modules} index={moduleIndex} onJump={jumpToModule} />

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
          groups={
            menuMode === "sections"
              ? [{ key: "sections", label: "On this surface", items: sectionItems }]
              : menuMode === "finish"
                ? [{ key: "finish", label: "Hardware finish", items: finishItems }]
                : menuGroups
          }
          cursor={cursor}
          locationKey={locationKey}
          unit={menuMode === "sections" ? "sections" : menuMode === "finish" ? "finishes" : "cartridges"}
          hint={
            menuMode === "sections"
              ? "◀▶ Move · ● Go · B Back"
              : menuMode === "finish"
                ? "◀▶ Move · ● Apply · B Back"
                : undefined
          }
          onActivate={(item) => {
            if (menuMode === "finish") return select();
            if (menuMode !== "sections") return go(item);
            setMenuMode(null);
            jumpToModule(item.sectionIndex);
          }}
          onJump={menuMode === "cartridges" ? () => jumpGroup(1) : null}
          onClose={closeMenu}
        />
      )}

      <HandheldNotifications
        open={notificationsOpen && !booting}
        onClose={() => setNotificationsOpen(false)}
      />

      <HandheldShareSheet
        open={shareOpen && !booting}
        surface={surface}
        isSignedIn={isSignedIn}
        onClose={() => setShareOpen(false)}
      />

      <nav
        aria-label="Handheld console controls"
        className="hh-body hh-grain fixed bottom-0 left-0 right-0 z-40 select-none md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center gap-3 px-4 pt-3">
          {/* Speaker grille — a punched dot matrix, and the left block that
              balances the face buttons so the wheel sits dead centre */}
          <div className="hh-grille h-[76px] w-[76px] shrink-0 rounded-[14px]" />

          <div className="flex min-w-0 flex-1 justify-center">
            <ClickWheel
              size={132}
              onRotate={rotate}
              onMenu={toggleMenu}
              onPrev={() => stepSection(-1)}
              onNext={() => stepSection(1)}
              playing={playing}
              onPlay={menuOpen || shareOpen ? null : togglePlay}
              onHome={goHome}
            />
          </div>

          <FaceButtons
            onConfirm={select}
            onBack={back}
            onSections={openSections}
            onShare={share}
          />
        </div>

        {/* The chin seam, the case screws and the model strip */}
        <div
          className="hh-engrave mt-1.5 flex items-center justify-between gap-2 px-4 pb-1 pt-1.5"
          style={{
            borderTop: "1px solid rgb(var(--hh-ink-rgb) / 0.12)",
            boxShadow: "inset 0 1px 0 var(--hh-shell-spec)",
          }}
        >
          <span
            className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            <span className="hh-screw h-[7px] w-[7px] rounded-full" />
            HW-88
          </span>

          <span
            className="flex min-w-0 items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "var(--hh-metal)" }}
          >
            <span className="h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: "rgb(var(--hh-metal-rgb) / 0.5)" }} />
            <span className="truncate">{finish.label}</span>
            <span className="h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: "rgb(var(--hh-metal-rgb) / 0.5)" }} />
          </span>

          <span
            className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            {isSignedIn ? "Fellow" : "Visitor"}
            <span className="hh-screw h-[7px] w-[7px] rounded-full" />
          </span>
        </div>
      </nav>
    </>
  );
}
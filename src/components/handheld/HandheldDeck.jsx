import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Palette } from "lucide-react";
import ClickWheel from "./ClickWheel";
import FaceButtons from "./FaceButtons";
import HandheldMasthead from "./HandheldMasthead";
import ScreenTopBar from "./ScreenTopBar";
import HandheldScreenFrame from "./HandheldScreenFrame";
import HandheldBody from "./HandheldBody";
import HandheldMenu from "./HandheldMenu";
import HandheldBoot from "./HandheldBoot";
import ModuleRail from "./ModuleRail";
import useHandheldDestinations from "./useHandheldDestinations";
import useModuleNavigation, { getStage } from "./useModuleNavigation";
import { useHandheldDeck, getDeck } from "./handheldDeck";
import { useHandheldPicker } from "./handheldPicker";
import HandheldNotifications from "./HandheldNotifications";
import HandheldShareSheet from "./HandheldShareSheet";
import HandheldSpeaker from "./HandheldSpeaker";
import { stopPlaylist } from "./consoleMusic";
import { surfaceLabel } from "./handheldDestinations";
import useHandheldFinish from "./useHandheldFinish";
import { blip, buzz, isSoundOn, persistSound } from "./handheldSound";
import { openingPlaysNow } from "@/components/core/appOpening";
import { applyShellVars, releaseShellVars } from "./handheldGeometry";

// The device's space is measured in handheldGeometry — one set of numbers, applied
// by the console and by the loading chassis alike, so the hardware is never hidden
// behind a surface and the picture does not shift when the device changes hands.

const BOOT_KEY = "top100-handheld-booted";

// The handheld. One body: a legend band printed on the case, a viewer the content
// renders in below it, and a chin carrying the click wheel, the face buttons and the
// grille.
// The wheel does it all — rotation scrolls the picture or walks the menu, the centre
// selects what the ring landed on, MENU goes up a level and opens the cartridges from
// the top, back and forward step the page's modules, and the bottom key plays the page
// down the glass. Holding the centre, or tapping the mark on the case, goes home.
// Sharing sits on Y.
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

  // The finish is hardware, so it lives on the menu beside the cartridges — a
  // drawer of mouldings, not a preference buried in a page. The one the device
  // is wearing carries the same Now mark the list gives the surface you are on.
  const finishItems = useMemo(
    () =>
      finishes.map((option) => ({
        label: option.label,
        finishKey: option.key,
        swatch: option.swatch,
        to: option.key === finishKey ? locationKey : undefined,
      })),
    [finishes, finishKey, locationKey],
  );

  const nav = useModuleNavigation(locationKey);
  const flashTimer = useRef(0);

  // A surface that pages its sections (ModuleSlideDeck) hands the console a deck
  // to turn; everything else falls back to stepping the page's module marks.
  const deck = useHandheldDeck();
  // A surface whose options are discrete — the title screen's keys, the
  // profile's own panels — hands the console a picker, which outranks the
  // page's module marks: the ring walks what is actually on the screen.
  const picker = useHandheldPicker();
  const deckLabels = deck ? deck.labels() : [];
  const pickerLabels = picker ? picker.labels() : [];
  const modules = deck
    ? deckLabels.map((label) => ({ label }))
    : picker
      ? pickerLabels.map((label) => ({ label }))
      : nav.modules;
  const moduleIndex = deck ? deck.index() : picker ? picker.index() : nav.index;
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

  // Reserve the hardware's space, and hand it back when the console is put away
  // (a surface asking for the whole glass). A layout effect, so the hardware is
  // already in place on the frame the console appears in, and the same values the
  // loading chassis applied — so the hand-over between them is invisible.
  useLayoutEffect(() => {
    applyShellVars();
    return releaseShellVars;
  }, []);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // Putting the console away stops its music: the speaker key is gone once the
  // device is off the glass, so the loop must not keep playing with no hand on it.
  useEffect(() => () => stopPlaylist(), []);

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

  // The finish drawer. It opens from the wheel's Menu — and from the chin strip,
  // where the finish the device is wearing is written, so the device itself is
  // the way to change what it is wearing.
  // A finish is worn whole, never mixed. Choosing one puts it on the device and
  // steps the drawer aside, so the moulding you just picked is what you see.
  const applyFinish = useCallback(
    (item) => {
      if (!item) return;
      chooseFinish(item.finishKey);
      setMenuMode(null);
      blip("toggle");
      buzz();
      announce(`Finish · ${item.label}`);
    },
    [chooseFinish, announce],
  );

  const openFinish = useCallback(() => {
    if (booting) finishBoot();
    setCursor(Math.max(0, finishItems.findIndex((item) => item.finishKey === finishKey)));
    setMenuMode("finish");
    setNotificationsOpen(false);
    setShareOpen(false);
    blip("open");
    buzz();
  }, [booting, finishBoot, finishItems, finishKey]);

  const go = useCallback(
    (destination, tone = "select") => {
      if (!destination) return;
      blip(tone);
      buzz();
      setMenuMode(null);
      setNotificationsOpen(false);
      setShareOpen(false);

      // Not a cartridge: the hardware drawer opens where you stand.
      if (destination.action === "finish") return openFinish();
      if (destination.action === "signin") return base44.auth.redirectToLogin(window.location.href);
      if (destination.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
      if (destination.href) {
        window.open(destination.href, "_blank", "noopener");
        return;
      }
      if (destination.to) navigate(destination.to);
    },
    [navigate, openFinish],
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

  // MENU is the wheel's up-a-level key, the way the hardware always read: it puts
  // away whatever is open — the share drawer, the notifications, the panel a surface
  // has on the glass — and only opens the cartridges when there is nothing left to
  // close. So the drawer never lands on top of a Fellow's work.
  const upOneLevel = useCallback(() => {
    if (booting) return finishBoot();
    if (shareOpen) {
      blip("back");
      buzz();
      return setShareOpen(false);
    }
    if (notificationsOpen) {
      blip("back");
      buzz();
      return setNotificationsOpen(false);
    }
    if (menuOpen) return closeMenu();
    if (picker?.back?.()) {
      blip("back");
      buzz();
      return;
    }
    openMenu();
  }, [
    booting,
    finishBoot,
    shareOpen,
    notificationsOpen,
    menuOpen,
    closeMenu,
    picker,
    openMenu,
  ]);

  // Home: the front screen from anywhere, and the top of the page once you are there.
  // That is what the mark on the case and a hold of the wheel's centre both do.
  const goHome = useCallback(() => {
    blip("start");
    buzz();
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(false);
    if (location.pathname === "/") {
      getStage()?.scrollTo({ top: 0 });
      announce("Top");
      return;
    }
    navigate("/");
  }, [navigate, location.pathname, announce]);

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
      // A picker walks its own options; a turn it declines is a turn the glass
      // takes, which is how an open panel is read down.
      if (picker) {
        const label = picker.step(step);
        if (label) {
          announce(label);
          return;
        }
      }
      if (deck) {
        deck.scrollBy(step * 54);
        return;
      }
      // Depth first: a surface that scrolls inside its own section — a Board
      // column — gets the ring before the glass or the window does.
      nav.scrollBy(step * 54);
    },
    [menuOpen, menuMode, listFor, picker, deck, finishBoot, nav, announce],
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
      // Back and forward move to the neighbour. A picker owns these keys: at the
      // end of its options the press bumps instead of hunting for a section.
      if (picker) {
        const label = picker.page(direction);
        if (label) announce(label);
        else blip("back");
        return;
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
    [menuOpen, menuMode, listFor, jumpGroup, picker, deck, nav, finishBoot, announce],
  );

  const jumpToModule = useCallback(
    (i) => {
      blip("move");
      if (picker) {
        const label = picker.goTo(i);
        if (label) announce(label);
        return;
      }
      if (deck) {
        deck.goTo(i);
        announce(deck.labels()[i]);
        return;
      }
      if (nav.goTo(i) !== null) announce(nav.modules[i]?.label);
    },
    [picker, deck, nav, announce],
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
      // The wheel's centre wears what the cursor is standing on.
      applyFinish(finishItems[cursor]);
      return;
    }
    if (!menuOpen) {
      // The ring has chosen, so A opens what it is standing on. A surface with
      // nothing to open hands the key straight back.
      if (picker?.enter?.()) {
        blip("select");
        buzz();
        return;
      }
      return openMenu();
    }
    const item = flat[cursor];
    if (item) go(item);
    else closeMenu();
  }, [finishBoot, menuMode, sectionItems, finishItems, cursor, jumpToModule, applyFinish, announce, menuOpen, openMenu, flat, go, closeMenu, picker]);

  const back = useCallback(() => {
    blip("back");
    buzz();
    if (booting) return finishBoot();
    if (shareOpen) return setShareOpen(false);
    if (notificationsOpen) return setNotificationsOpen(false);
    if (menuOpen) return setMenuMode(null);
    // A surface that opened something of its own takes the press first.
    if (picker?.back?.()) return;
    navigate(-1);
  }, [booting, finishBoot, menuOpen, notificationsOpen, shareOpen, navigate, picker]);

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
      {/* One moulding behind everything: the display, the bezel and the deck are
          all set into the same body. */}
      <HandheldBody />

      {/* The case's own line: branding, and nothing else. */}
      <HandheldMasthead />

      <HandheldScreenFrame />

      {/* The bar inside the glass: the controls, where the surfaces are. */}
      <ScreenTopBar
        surface={surface}
        module={modules[moduleIndex]?.label}
        soundOn={soundOn}
        onHome={goHome}
        onProfile={openProfile}
        onNotifications={openNotifications}
        onToggleSound={toggleSound}
      />

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
            if (menuMode === "finish") return applyFinish(item);
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
        className="hh-chin fixed z-40 select-none md:hidden"
        style={{
          left: "var(--hh-frame, 0px)",
          right: "var(--hh-frame, 0px)",
          bottom: "var(--hh-frame, 0px)",
          borderRadius: "0 0 26px 26px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* The chin is pinned like a real moulding: a screw at each corner. */}
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, left: 5 }} aria-hidden="true" />
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, right: 5 }} aria-hidden="true" />

        <div className="flex items-center gap-2.5 px-4 pt-1.5">
          {/* The case speaker, and the console's own music: the punched well on
              the chin is the control — tap to unmute the onboard playlist, hold
              for the next loop. It also balances the face buttons, so the wheel
              sits dead centre. */}
          <HandheldSpeaker
            onAnnounce={announce}
            onSoundOn={() => {
              persistSound(true);
              setSoundOn(true);
            }}
          />

          <div className="flex min-w-0 flex-1 justify-center">
            <ClickWheel
              size={104}
              onRotate={rotate}
              onMenu={upOneLevel}
              onPrev={() => stepSection(-1)}
              onNext={() => stepSection(1)}
              playing={playing}
              onPlay={menuOpen || shareOpen ? null : togglePlay}
              onSelect={select}
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

        {/* The maker's plate, cut into the chin: the model mark, the finish the
            device is wearing — the name is the control that changes it — and who
            is holding it, with a machined hairline drawn out to either side. */}
        <div className="hh-plate mt-0.5 flex h-[20px] items-center gap-2 px-4">
          <span
            className="hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            <span className="hh-screw h-[6px] w-[6px] rounded-full" />
            HW-88
          </span>

          <span
            aria-hidden="true"
            className="h-px min-w-[8px] flex-1"
            style={{
              background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.04), rgb(var(--hh-metal-rgb) / 0.30))",
            }}
          />

          <button
            type="button"
            onClick={openFinish}
            aria-label={`Hardware finish, ${finish.label}. Choose another finish`}
            className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-[7px] px-2 py-[3px] text-[6px] font-bold uppercase tracking-[0.18em] transition-transform active:translate-y-[1px]"
            style={{
              color: "var(--hh-pad-ink)",
              background: "linear-gradient(180deg, var(--hh-pad-1) 0%, var(--hh-pad-2) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(3,6,13,0.30), 0 1px 0 rgba(3,6,13,0.34)",
            }}
          >
            <Palette className="h-[7px] w-[7px] shrink-0" style={{ color: "var(--hh-pad-ink)" }} />
            <span className="flex shrink-0 items-center gap-[3px]">
              {(finish.swatch || []).map((tone) => (
                <span
                  key={tone}
                  className="h-[6px] w-[6px] rounded-full"
                  style={{ background: tone, boxShadow: "inset 0 0 0 1px rgba(7,17,31,0.35)" }}
                />
              ))}
            </span>
            <span className="truncate">{finish.label}</span>
            <span className="shrink-0" style={{ color: "rgb(var(--hh-metal-rgb) / 0.8)" }}>
              ▲
            </span>
          </button>

          <span
            aria-hidden="true"
            className="h-px min-w-[8px] flex-1"
            style={{
              background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.30), rgb(var(--hh-metal-rgb) / 0.04))",
            }}
          />

          <span
            className="hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            {isSignedIn ? "Fellow" : "Visitor"}
            <span className="hh-screw h-[6px] w-[6px] rounded-full" />
          </span>
        </div>
      </nav>
    </>
  );
}
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Bell,
  Eye as EyeIcon,
  FolderOpen,
  Home as HomeIcon,
  List as ListIcon,
  Palette,
  PencilLine,
  Search,
  Share2,
} from "lucide-react";
import ClickWheel from "./ClickWheel";
import FaceButtons from "./FaceButtons";
import { pressFaceKey, useFaceKeysClaimed } from "./handheldKeys";
import TouchConsole from "./TouchConsole";
import HandheldMenu from "./HandheldMenu";
import HandheldSearch from "./HandheldSearch";
import HandheldBoot from "./HandheldBoot";
import useHandheldDestinations from "./useHandheldDestinations";
import useModuleNavigation, { getStage } from "./useModuleNavigation";
import { useHandheldDeck, getDeck } from "./handheldDeck";
import { useHandheldPicker } from "./handheldPicker";
import HandheldNotifications from "./HandheldNotifications";
import HandheldShareSheet from "./HandheldShareSheet";
import HandheldSpeaker from "./HandheldSpeaker";
import { stopPlaylist } from "./consoleMusic";
import { surfaceLabel } from "./handheldDestinations";
import { menuGroups as barMenuGroups } from "@/components/shell/barMenus";
import { editGroupsWith, fileGroupsWith } from "@/components/shell/surfaceFileMenu";
import useHandheldFinish from "./useHandheldFinish";
import { blip, buzz, persistSound } from "./handheldSound";
import { openingPlaysNow } from "@/components/core/appOpening";
import { applyShellVars, releaseShellVars } from "./handheldGeometry";
import { useAuth } from "@/lib/AuthContext";
import { toggleViewingAsVisitor } from "@/lib/viewerPreview";

// The device's space is measured in handheldGeometry — one set of numbers, applied
// by the console and by the loading chassis alike, so the hardware is never hidden
// behind a surface and the picture does not shift when the device changes hands.

const BOOT_KEY = "top100-handheld-booted";

// The four prints on the ring, and the directions they are when a surface steers
// with it: the top of the wheel is away from you, the bottom towards you.
const ZONE_DIR = { menu: "up", play: "down", prev: "left", next: "right" };

// What each drawer is called. The console's own menu is the machine itself, so it keeps
// the OS mark; every other drawer prints the name of the menu it is holding, so the
// press that opened it reads back on the glass — Y lands on a drawer headed Edit.
const DRAWER_TITLES = { file: "File", edit: "Edit", sections: "Sections", finish: "Customize" };

// The handheld. One body: a legend band printed on the case, a viewer the content
// renders in below it, and a chin carrying the click wheel, the face buttons and the
// grille.
// The wheel does it all — rotation scrolls the picture or walks the menu, the centre
// selects what the ring landed on, MENU goes up a level and opens the cartridges from
// the top, back and forward step the page's modules, and the bottom key plays the page
// down the glass and stops it again. Holding the centre, or tapping the mark on the
// case, goes home. Y opens the Edit drawer — the same list the bar's own Edit cell
// holds, one press from anywhere — and the share stands on its own pill at the left of the
// readout band, in the glass itself, on every surface.
// A surface may also take the ring itself and steer with it — the field game walks
// on it — in which case the four zones become up, down, left and right for as long
// as nothing of the console's own is open over the glass.
export default function HandheldDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn, isAdmin } = useHandheldDestinations();

  const [menuMode, setMenuMode] = useState(null);
  const [cursor, setCursor] = useState(0);
  const menuOpen = menuMode !== null;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
  const { realUser, viewingAsVisitor } = useAuth();
  // The controls stand over the picture now: one panel a hand opens when it wants the
  // machine, closed the rest of the time so the page keeps the whole screen.
  const [consoleOpen, setConsoleOpen] = useState(false);
  // While a surface holds the four face keys — the chamber's candidates — those keys
  // are put under the thumb instead of waiting in the panel.
  const keysClaimed = useFaceKeysClaimed();

  const menuGroups = useMemo(
    () => [
      ...groups,
      {
        key: "hardware",
        label: "Hardware",
        items: [{ label: `Customize · ${finish.label}`, action: "finish", icon: Palette }],
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
  // The left print on the ring — back, not rewind — ends at the console's own back
  // handler when the surface has nothing of its own left to step through. That
  // handler is declared further down this component, so it is read through a ref:
  // whichever way either one is memoised, the two can never disagree.
  const backRef = useRef(null);
  // And a surface may claim the ring outright: the field game steers its character
  // with it. While nothing of the console's own is open over the glass, the four
  // zones stop being menu/back/forward/play and become directions, reported held
  // until the thumb comes off — so the wheel under the glass is the joystick.
  const steering =
    !menuOpen && !shareOpen && !notificationsOpen && !searchOpen && !booting && picker?.steer
      ? picker.steer
      : null;
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

  // The two lists the bar's own cells stand for: File, holding the front screen and
  // the platform's surfaces, and Edit, holding everything a Fellow authors. They are
  // drawers like the cartridges, so the wheel walks them the same way.
  const barDrawers = useMemo(
    () => ({
      file: barMenuGroups("file", { isSignedIn, isAdmin }),
      edit: barMenuGroups("edit", { isSignedIn, isAdmin }),
    }),
    [isSignedIn, isAdmin],
  );

  // What each drawer shows, in the shape the drawer renders and the order the cursor
  // walks: the surface's own sections, the finishes the case can wear, one of the
  // bar's two lists, or the journey's cartridges.
  const groupsFor = useCallback(
    (mode) => {
      if (mode === "sections") return [{ key: "sections", label: "On this surface", items: sectionItems }];
      if (mode === "finish") return [{ key: "finish", label: "Customize", items: finishItems }];
      // File leads with the surface's own work — an issue being read keeps its entries
      // there — then what this surface holds (the deck's slides, the page's own modules),
      // and closes with the machine's own list. Edit leads the same way, with what the
      // surface puts in the reader's hands to author.
      if (mode === "file") {
        return fileGroupsWith([
          ...(barDrawers.file || []),
          ...(sectionItems.length
            ? [{ key: "sections", label: "On this surface", items: sectionItems }]
            : []),
        ]);
      }
      if (mode === "edit") return editGroupsWith(barDrawers.edit || []);
      return barDrawers[mode] || menuGroups;
    },
    [sectionItems, finishItems, barDrawers, menuGroups],
  );

  // What the wheel walks, per drawer it happens to be in.
  const listFor = useCallback((mode) => groupsFor(mode).flatMap((group) => group.items), [groupsFor]);

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

  // A list opening over the picture puts the console away: the drawer is what the hand
  // is reading, and two panels over one another would leave neither of them whole.
  useEffect(() => {
    if (menuOpen || searchOpen || notificationsOpen || shareOpen) setConsoleOpen(false);
  }, [menuOpen, searchOpen, notificationsOpen, shareOpen]);

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

  // The chassis customize drawer: the finishes the device can wear. It opens from
  // the wheel's Menu — and from the footer of the case, where the device's own
  // Customize key is seated, so the hardware itself is the way to change what it is
  // wearing.
  // A finish is worn whole, never mixed. Choosing one puts it on the device and
  // steps the drawer aside, so the moulding you just picked is what you see.
  const applyFinish = useCallback(
    (item) => {
      if (!item) return;
      chooseFinish(item.finishKey);
      setMenuMode(null);
      blip("toggle");
      buzz();
      announce(`Customize · ${item.label}`);
    },
    [chooseFinish, announce],
  );

  const openFinish = useCallback(() => {
    if (booting) finishBoot();
    setCursor(Math.max(0, finishItems.findIndex((item) => item.finishKey === finishKey)));
    setMenuMode("finish");
    setNotificationsOpen(false);
    setShareOpen(false);
    setSearchOpen(false);
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
    setSearchOpen(false);

      // Not a cartridge: the hardware drawer opens where you stand.
      if (destination.action === "finish") return openFinish();
      // The way in, on the platform's own door: one page both signs a Fellow in and
      // opens the account a visitor does not have yet.
      if (destination.action === "signin" || destination.action === "join") {
        return base44.auth.redirectToLogin(window.location.href);
      }
      if (destination.action === "logout") return base44.auth.logout(`${window.location.origin}/`);
      // A surface's own File entry does its work where it stands: the drawer goes down on
      // the press, and the surface reports in the glass what came of it.
      if (destination.onSelect) return destination.onSelect();
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
    setSearchOpen(false);
    finishBoot();
    blip("open");
    buzz();
  }, [flat, locationKey, finishBoot]);

  // File and Edit, the bar's own two cells: they open the same drawer the wheel's
  // MENU opens, each holding its own list, so the ring walks them like anything else
  // on this device and the entries land where you already are.
  const openBarDrawer = useCallback(
    (kind) => {
      const items = groupsFor(kind).flatMap((group) => group.items);
      const current = items.findIndex((item) => item.to && item.to === locationKey);
      setCursor(current >= 0 ? current : 0);
      setMenuMode(kind);
      setNotificationsOpen(false);
      setShareOpen(false);
    setSearchOpen(false);
      finishBoot();
      blip("open");
      buzz();
    },
    [groupsFor, locationKey, finishBoot],
  );

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
    if (searchOpen) {
      blip("back");
      buzz();
      return setSearchOpen(false);
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
    searchOpen,
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
    setSearchOpen(false);
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
      // A steering surface has nothing to walk with a detent: the ring is under a
      // thumb that is walking already.
      if (steering) return;
      // Nor has the search: that drawer is a field, and a field is typed into.
      if (searchOpen) return;
      if (menuOpen) {
        const list = listFor(menuMode);
        if (!list.length) return;
        // The cursor law: a list stops at its ends. The first and the last entry
        // refuse the turn and the ring bumps, rather than wrapping round to the far
        // end of the drawer — the same rule the pickers and the modules keep.
        const next = cursor + step;
        if (next < 0 || next >= list.length) {
          blip("back");
          return;
        }
        setCursor(next);
        return;
      }
      // A picker walks its own options; a turn it declines is a turn the glass
      // takes, which is how an open panel is read down.
      if (picker) {
        const label = picker.step(step);
        // A turn a surface answers for itself and has nothing to name — the ring
        // rolling a page it has already announced — is still a turn the console must
        // not hand on to the glass.
        if (label === true) return;
        if (label) {
          announce(label);
          return;
        }
      }
      // A detent that moves nothing is the end of the surface: the ring bumps, so
      // the top and the bottom of a page are felt rather than swallowed in silence.
      if (deck) {
        if (deck.scrollBy(step * 54) === false) blip("back");
        return;
      }
      // Depth first: a surface that scrolls inside its own section — a Board
      // column — gets the ring before the glass or the window does.
      if (nav.scrollBy(step * 54) === false) blip("back");
    },
    [menuOpen, menuMode, listFor, cursor, picker, deck, finishBoot, nav, announce, steering],
  );

  const jumpGroup = useCallback(
    (step, groups = menuGroups) => {
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
    [menuGroups, cursor],
  );

  // Back and forward on the ring: step a module where the surface declares any,
  // otherwise move a screenful. In the menu they hop whole groups.
  //
  // The forward key bumps at the end of a surface — there is nowhere further on to
  // go. The back key does not: printed as back/undo, it steps back through the
  // surface's own set while there is one, and when there is nothing of its own left
  // to step through it leaves the surface, which is what the print promises.
  const stepSection = useCallback(
    (direction) => {
      finishBoot();
      if (menuOpen) {
        if (menuMode === "sections" || menuMode === "finish") {
          const list = listFor(menuMode);
          setCursor((prev) => Math.max(0, Math.min(list.length - 1, prev + direction)));
          return;
        }
        return jumpGroup(direction, groupsFor(menuMode));
      }
      // Back and forward move to the neighbour. A picker owns these keys: at the
      // end of its options the press bumps instead of hunting for a section.
      if (picker) {
        const label = picker.page(direction);
        if (label) announce(label);
        else if (direction < 0) backRef.current?.();
        else blip("back");
        return;
      }
      if (deck) {
        const next = deck.index() + direction;
        if (next < 0 || next >= deck.count()) {
          if (direction < 0) backRef.current?.();
          else blip("back");
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
      if (direction < 0) backRef.current?.();
      else blip("back");
    },
    [menuOpen, menuMode, listFor, groupsFor, jumpGroup, picker, deck, nav, finishBoot, announce],
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
    if (menuOpen || shareOpen || searchOpen || booting) return;
    blip("toggle");
    buzz();
    // A surface with a transport of its own — the record playing itself page by page —
    // takes the key, so one press means the same thing on the glass as on the page.
    if (picker?.play?.()) return;
    setPlaying((prev) => !prev);
    announce(playing ? "Paused" : "Reading");
  }, [menuOpen, shareOpen, booting, playing, announce, picker]);

  // The wheel's bottom print: the machine's own search, standing in the glass the way
  // the cartridges do. It is reached from the ring alone, so it opens over whatever is
  // on the picture and closes with MENU, B or its own Exit — never a modal over the
  // device, which is what keeps the hardware the thing being held.
  const openSearch = useCallback(() => {
    if (booting) finishBoot();
    blip("open");
    buzz();
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(false);
    setSearchOpen(true);
  }, [booting, finishBoot]);

  // The foot's Share pill: the drawer opens in the glass where the app lives — the
  // link you are holding, the code that opens it on a phone, and the ways out of it —
  // and the same pill puts it away again. It was a print on the ring once; standing on
  // its own it is always reachable, over a drawer and on a surface that has claimed the
  // face keys.
  const toggleShare = useCallback(() => {
    if (booting) return;
    blip(shareOpen ? "back" : "open");
    buzz();
    if (shareOpen) return setShareOpen(false);
    setMenuMode(null);
    setNotificationsOpen(false);
    setShareOpen(true);
  }, [booting, shareOpen]);

  // What has come in — the same drawer rule as everything else: the way in where
  // there is an account to receive it.
  const openNotifications = useCallback(() => {
    blip("open");
    buzz();
    setMenuMode(null);
    setShareOpen(false);
    setSearchOpen(false);
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
    const item = listFor(menuMode)[cursor];
    if (item) go(item);
    else closeMenu();
  }, [finishBoot, menuMode, sectionItems, finishItems, cursor, jumpToModule, applyFinish, announce, menuOpen, openMenu, listFor, go, closeMenu, picker]);

  // A surface with four things standing under the hand — the chamber's candidates —
  // answers the face keys first: Y, B, X and A read clockwise from the top of the
  // keypad, which is the same walk as the 2x2 grid they are drawn in. Everything else
  // keeps the keypad it always had.
  const faceKey = useCallback((name, run) => {
    if (pressFaceKey(name)) {
      blip("select");
      buzz();
      return;
    }
    run();
  }, []);

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
  backRef.current = back;

  // The handle at the foot of the screen.
  const toggleConsole = useCallback(() => {
    finishBoot();
    blip(consoleOpen ? "back" : "open");
    buzz();
    setConsoleOpen(!consoleOpen);
  }, [consoleOpen, finishBoot]);

  // The panel's own keys. Everything the case used to print is here, and each one steps
  // the panel aside first so the list it opens is the only thing over the picture.
  const fromConsole = (fn) => () => {
    setConsoleOpen(false);
    fn();
  };

  const consoleActions = [
    { key: "home", label: "Home", Icon: HomeIcon, onSelect: fromConsole(goHome) },
    { key: "menu", label: "Menu", Icon: ListIcon, onSelect: fromConsole(upOneLevel) },
    { key: "file", label: "File", Icon: FolderOpen, onSelect: fromConsole(() => openBarDrawer("file")) },
    { key: "edit", label: "Edit", Icon: PencilLine, onSelect: fromConsole(() => openBarDrawer("edit")) },
    { key: "inbox", label: "Inbox", Icon: Bell, onSelect: fromConsole(openNotifications) },
    { key: "search", label: "Search", Icon: Search, onSelect: fromConsole(openSearch) },
    { key: "share", label: "Share", Icon: Share2, onSelect: fromConsole(toggleShare) },
    { key: "skin", label: "Customize", Icon: Palette, onSelect: fromConsole(openFinish) },
  ];

  // The operator's lens: on a desk it is a cell of the bar; over the picture it is one
  // more key, and only for an admin.
  if (realUser?.role === "admin") {
    consoleActions.push({
      key: "lens",
      label: viewingAsVisitor ? "Member view" : "Visitor view",
      Icon: EyeIcon,
      onSelect: fromConsole(toggleViewingAsVisitor),
    });
  }

  return (
    <>
      {/* The console, carried over the picture rather than built around it: a handle at
          the foot of the screen, one panel holding everything the case used to print,
          and — while a surface holds the four face keys — those keys under the thumb. */}
      <TouchConsole
        open={consoleOpen}
        onToggle={toggleConsole}
        surface={surface}
        module={modules[moduleIndex]?.label}
        actions={consoleActions}
        sections={modules.length > 1 ? modules : []}
        activeSection={moduleIndex}
        onJump={(i) => {
          setConsoleOpen(false);
          jumpToModule(i);
        }}
        faceKeys={
          keysClaimed
            ? {
                onConfirm: () => faceKey("A", select),
                onBack: () => faceKey("B", back),
                onFile: () => faceKey("X", () => openBarDrawer("file")),
                onEdit: () => faceKey("Y", () => openBarDrawer("edit")),
              }
            : null
        }
        speaker={<HandheldSpeaker onAnnounce={announce} onSoundOn={() => persistSound(true)} />}
        wheel={
          <ClickWheel
            size={132}
            onRotate={rotate}
            onMenu={steering ? null : upOneLevel}
            onPrev={steering ? null : () => stepSection(-1)}
            onNext={steering ? null : () => stepSection(1)}
            playing={playing || !!picker?.isPlaying?.()}
            onSearch={steering ? null : openSearch}
            onPlay={steering ? null : togglePlay}
            onSelect={select}
            onHome={goHome}
            steer={!!steering}
            onSteer={steering ? (zone, on) => steering.hold(ZONE_DIR[zone], on) : null}
            prints={steering?.prints}
          />
        }
        keypad={
          <FaceButtons
            keyW={46}
            keyH={44}
            gap={6}
            onConfirm={() => faceKey("A", select)}
            onBack={() => faceKey("B", back)}
            onFile={() => faceKey("X", () => openBarDrawer("file"))}
            onEdit={() => faceKey("Y", () => openBarDrawer("edit"))}
          />
        }
      />

      {/* Section announcement — the page reports where the wheel just landed */}
      {flash && (
        <div
          className="pointer-events-none fixed left-1/2 z-30 -translate-x-1/2 md:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 78px)" }}
        >
          <span
            className="hh-flash flex items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[10px] font-bold uppercase tracking-[0.18em] text-[#FAF8F5]"
            style={{ background: "rgba(7,17,31,0.88)", boxShadow: "0 4px 14px rgba(7,17,31,0.42)" }}
          >
            <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[#B87333]" />
            {flash}
          </span>
        </div>
      )}

      {booting && <HandheldBoot onDone={finishBoot} />}

      {searchOpen && !booting && (
        <HandheldSearch groups={groups} onClose={() => setSearchOpen(false)} />
      )}

      {menuOpen && !booting && (
        <HandheldMenu
          groups={groupsFor(menuMode)}
          label={DRAWER_TITLES[menuMode]}
          cursor={cursor}
          locationKey={locationKey}
          unit={
            menuMode === "sections"
              ? "sections"
              : menuMode === "finish"
                ? "finishes"
                : "entries"
          }
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
          onJump={
            menuMode === "sections" || menuMode === "finish"
              ? null
              : () => jumpGroup(1, groupsFor(menuMode))
          }
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

    </>
  );
}
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Play, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import HandheldDpad from "./HandheldDpad";
import HandheldNavigator from "./HandheldNavigator";
import useHandheldDestinations from "./useHandheldDestinations";
import { surfaceLabel } from "./handheldDestinations";
import { blip, buzz, isSoundOn, persistSound } from "./handheldSound";

// Space the console's controls occupy, so scroll containers can clear them.
export const HANDHELD_DECK_CLEARANCE = 122;

const faceStyle = (from, to, shadow) => ({
  background: `linear-gradient(180deg, ${from}, ${to})`,
  boxShadow: shadow,
});

export default function HandheldDeck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, isSignedIn } = useHandheldDestinations();

  const [soundOn, setSoundOn] = useState(isSoundOn);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const locationKey = `${location.pathname}${location.search}`;
  const surface = useMemo(() => surfaceLabel(location, groups), [location, groups]);
  const railItems = useMemo(() => groups.find((g) => g.key === "rail")?.items || [], [groups]);

  const signIn = () => base44.auth.redirectToLogin(window.location.href);
  const signOut = () => base44.auth.logout(`${window.location.origin}/`);

  const go = useCallback(
    (destination, tone = "select") => {
      if (!destination) return;
      blip(tone);
      buzz();
      setNavigatorOpen(false);

      if (destination.action === "signin") return signIn();
      if (destination.action === "logout") return signOut();
      if (destination.href) {
        window.open(destination.href, "_blank", "noopener");
        return;
      }
      if (destination.to) navigate(destination.to);
    },
    [navigate],
  );

  const openNavigator = useCallback(() => {
    const current = flat.findIndex((item) => item.to && item.to === locationKey);
    setHighlight(current >= 0 ? current : 0);
    setNavigatorOpen(true);
    blip("open");
    buzz();
  }, [flat, locationKey]);

  const closeNavigator = useCallback(() => {
    setNavigatorOpen(false);
    blip("back");
  }, []);

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

  const scrollScreenTop = useCallback(() => {
    blip("move");
    const screen = document.querySelector("[data-handheld-screen]");
    if (screen) screen.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      persistSound(!prev);
      if (!prev) setTimeout(() => blip("toggle"), 0);
      return !prev;
    });
    buzz();
  }, []);

  // Pad semantics differ while the navigator is up: the pad walks the menu.
  const moveHighlight = (step) =>
    setHighlight((prev) => {
      if (!flat.length) return 0;
      const next = (prev + step + flat.length) % flat.length;
      blip("move");
      return next;
    });

  const jumpGroup = (step) => {
    const boundaries = [];
    let running = 0;
    groups.forEach((g) => {
      boundaries.push(running);
      running += g.items.length;
    });
    const currentGroup = boundaries.filter((b) => b <= highlight).length - 1;
    const nextGroup = Math.min(Math.max(currentGroup + step, 0), boundaries.length - 1);
    setHighlight(boundaries[nextGroup]);
    blip("move");
  };

  const pad = navigatorOpen
    ? {
        onUp: () => moveHighlight(-1),
        onDown: () => moveHighlight(1),
        onLeft: () => jumpGroup(-1),
        onRight: () => jumpGroup(1),
        labels: { up: "Move up in navigator", down: "Move down in navigator", left: "Previous group", right: "Next group" },
      }
    : {
        onUp: scrollScreenTop,
        onDown: openNavigator,
        onLeft: () => cycleRail(-1),
        onRight: () => cycleRail(1),
        labels: { up: "Top of screen", down: "Open navigator", left: "Previous surface", right: "Next surface" },
      };

  return (
    <>
      {navigatorOpen && (
        <HandheldNavigator
          groups={groups}
          highlight={highlight}
          locationKey={locationKey}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onSelect={(item) => go(item)}
          onClose={closeNavigator}
        />
      )}

      <nav
        aria-label="Handheld console controls"
        className="hh-deck fixed bottom-0 left-0 right-0 z-40 select-none md:hidden"
        style={{
          background: "linear-gradient(180deg, #16304E 0%, #12283F 52%, #0B1929 100%)",
          borderTop: "1px solid rgba(201,168,124,0.34)",
          boxShadow: "0 -14px 34px rgba(7,17,31,0.45), inset 0 1px 0 rgba(250,248,245,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Branding strip — the engraved band below the screen */}
        <div className="flex items-center justify-between px-3.5 pt-1.5">
          <span className="flex items-center gap-1.5">
            <span className="hh-led h-1.5 w-1.5 rounded-full bg-[#2ED573]" />
            <span className="text-[7.5px] font-bold uppercase tracking-[0.24em] text-[#FAF8F5]/45">
              {isSignedIn ? "Online" : "Visitor"}
            </span>
          </span>

          <span className="truncate px-2 text-[7.5px] font-bold uppercase tracking-[0.24em] text-[#C9A87C]/80">
            {surface}
          </span>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[#FAF8F5]/55 transition-colors active:bg-white/10"
          >
            {soundOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            <span className="text-[7.5px] font-bold uppercase tracking-[0.24em]">Sound</span>
          </button>
        </div>

        {/* Control deck */}
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-1.5">
          <div className="flex w-[60px] shrink-0 flex-col items-center gap-1">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={navigatorOpen ? closeNavigator : openNavigator}
                aria-label="Open navigator menu"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#FAF8F5]/85 transition-transform active:scale-90"
                style={faceStyle("#33495F", "#1B2E44", "inset 0 1px 1px rgba(250,248,245,0.22), 0 3px 7px rgba(0,0,0,0.45)")}
              >
                <Menu className="h-3.5 w-3.5" />
              </button>
              <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.2em] text-[#FAF8F5]/40">
                Menu
              </span>
            </div>

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => go({ to: "/" }, "start")}
                aria-label="Go to home"
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#0B1929] transition-transform active:scale-90"
                style={faceStyle("#E3CBA2", "#C9A87C", "inset 0 1px 1px rgba(255,255,255,0.55), 0 3px 8px rgba(0,0,0,0.45)")}
              >
                <Play className="h-3.5 w-3.5" fill="currentColor" />
              </button>
              <span className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.2em] text-[#C9A87C]/70">
                Start
              </span>
            </div>
          </div>

          <HandheldDpad {...pad} />

          <div className="relative h-[70px] w-[78px] shrink-0">
            <button
              type="button"
              onClick={openNavigator}
              aria-label="Select — open navigator"
              className="absolute right-0 top-0 flex h-[40px] w-[40px] items-center justify-center rounded-full text-[11px] font-bold text-[#0B1929] transition-transform active:scale-90"
              style={faceStyle("#D89A5E", "#B87333", "inset 0 1px 1px rgba(255,255,255,0.45), 0 4px 10px rgba(0,0,0,0.45)")}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => {
                blip("back");
                buzz();
                if (navigatorOpen) closeNavigator();
                else navigate(-1);
              }}
              aria-label="Back"
              className="absolute bottom-0 left-0 flex h-[36px] w-[36px] items-center justify-center rounded-full text-[10px] font-bold text-[#FAF8F5]/80 transition-transform active:scale-90"
              style={faceStyle("#33495F", "#1B2E44", "inset 0 1px 1px rgba(250,248,245,0.2), 0 4px 10px rgba(0,0,0,0.45)")}
            >
              B
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
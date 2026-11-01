import { Home, Search } from "lucide-react";

// The PSP face: the screen in the middle, a handle either side. The wheel rides the
// left thumb, the A/B/X/Y keys the right, and the menu bar runs across the head of the glass.
export default function LandscapeGrips({ menuBar, wheel, faceButtons, onHome, onSearch }) {
  const grip = "hh-body hh-grain fixed top-2 bottom-2 z-40 flex select-none flex-col items-center justify-center gap-3";
  return (
    <>
      <div
        className="fixed z-40"
        style={{ top: 8, height: 30, left: "var(--hh-glass-inset)", right: "var(--hh-glass-inset)" }}
      >
        {menuBar}
      </div>

      <nav
        aria-label="Left handle"
        className={grip}
        style={{ left: "calc(env(safe-area-inset-left) + 6px)", width: "calc(var(--hh-grip) - 12px)", borderRadius: "40px 14px 14px 40px" }}
      >
        {wheel}
      </nav>

      <nav
        aria-label="Right handle"
        className={grip}
        style={{ right: "calc(env(safe-area-inset-right) + 6px)", width: "calc(var(--hh-grip) - 12px)", borderRadius: "14px 40px 40px 14px" }}
      >
        {faceButtons}
        <div className="flex gap-3">
          <button type="button" onClick={onHome} aria-label="Home" className="hh-pad-key flex h-8 w-8 items-center justify-center rounded-full text-[var(--hh-pad-ink)]">
            <Home className="h-4 w-4" />
          </button>
          <button type="button" onClick={onSearch} aria-label="Search the console" className="hh-pad-key flex h-8 w-8 items-center justify-center rounded-full text-[var(--hh-pad-ink)]">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </>
  );
}
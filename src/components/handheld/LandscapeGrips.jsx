import { Home, Search } from "lucide-react";

// The PSP face: the screen in the middle, a sculpted handle either side, joined by one
// moulded spine behind the glass. The wheel takes one thumb, A/B/X/Y the other; `flipped`
// swaps them.
function Grip({ side, children }) {
  const left = side === "left";
  return (
    <nav
      aria-label={`${left ? "Left" : "Right"} handle`}
      className="hh-body hh-grain fixed z-40 flex select-none flex-col items-center justify-center gap-2 overflow-hidden"
      style={{
        top: 6,
        bottom: 6,
        [side]: "calc(env(safe-area-inset-" + side + ") + 4px)",
        width: "calc(var(--hh-grip) - 10px)",
        borderRadius: left ? "44px 12px 12px 44px" : "12px 44px 44px 12px",
      }}
    >
      {/* the copper seam where the handle meets the glass */}
      <span
        aria-hidden="true"
        className="absolute top-6 bottom-6 w-px"
        style={{ [left ? "right" : "left"]: 0, background: "linear-gradient(180deg, transparent, rgb(var(--hh-metal-rgb) / 0.55), transparent)" }}
      />
      {/* shoulder trigger */}
      <span
        aria-hidden="true"
        className="hh-key-center absolute top-0 h-[5px] w-1/2 rounded-b-full opacity-80"
        style={{ [left ? "left" : "right"]: "22%" }}
      />
      {/* grip ribs for the fingers behind */}
      <span aria-hidden="true" className="absolute bottom-4 flex gap-[3px] opacity-40" style={{ [side]: 22 }}>
        {[0, 1, 2, 3].map((i) => <span key={i} className="h-5 w-[2px] rounded-full" style={{ background: "var(--hh-ink-soft)" }} />)}
      </span>
      {children}
    </nav>
  );
}

const small = "hh-pad-key flex h-8 w-8 items-center justify-center rounded-full text-[var(--hh-pad-ink)]";

export default function LandscapeGrips({ menuBar, wheel, faceButtons, flipped, onHome, onSearch }) {
  const wheelSide = flipped ? "right" : "left";
  const keysSide = flipped ? "left" : "right";
  return (
    <>
      {/* the spine: one moulding behind the glass so the handles read as one body */}
      <div
        aria-hidden="true"
        className="hh-body pointer-events-none fixed z-[1]"
        style={{ top: 2, bottom: 2, left: "calc(var(--hh-grip) - 16px)", right: "calc(var(--hh-grip) - 16px)", borderRadius: 22 }}
      />

      <div className="fixed z-40" style={{ top: 8, height: 30, left: "var(--hh-glass-inset)", right: "var(--hh-glass-inset)" }}>
        {menuBar}
      </div>

      <Grip side={wheelSide}>
        {wheel}
      </Grip>

      <Grip side={keysSide}>
        <div className="origin-center scale-[0.82]">{faceButtons}</div>
        <div className="flex gap-3">
          <button type="button" onClick={onHome} aria-label="Home" className={small}><Home className="h-4 w-4" /></button>
          <button type="button" onClick={onSearch} aria-label="Search the console" className={small}><Search className="h-4 w-4" /></button>
        </div>
        <span className="hh-led h-[5px] w-[5px] rounded-full" style={{ background: "var(--hh-led)" }} aria-hidden="true" />
      </Grip>
    </>
  );
}
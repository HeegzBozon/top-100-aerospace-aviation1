// The viewer. The glass is set into a plate: moulded shell, a machined metal rail
// along its edge, set screws in the corners, and a dark stepped recess the picture
// sits down in. That step is what gives the screen its weight — the pane
// (scanlines, vignette, sheen) lies over the bar and the picture alike, so the
// whole screen reads as one display.
//
// --hh-top and --hh-bottom mark the glass opening, so the moulding is drawn back
// out to the device bounds here, and only here.
const SCREW = { position: "absolute", width: 7, height: 7 };

export default function HandheldScreenFrame() {
  return (
    <div
      className="pointer-events-none fixed z-[47] md:hidden"
      style={{
        left: "var(--hh-frame, 0px)",
        right: "var(--hh-frame, 0px)",
        top: "calc(var(--hh-top, 44px) - var(--hh-bezel-w, 18px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 208px) - var(--hh-bezel-w, 18px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* The moulding, and the screws that hold the plate down */}
      <div className="hh-bezel absolute inset-0 rounded-[24px]" />
      <span className="hh-screw" style={{ ...SCREW, top: 5, left: 5 }} />
      <span className="hh-screw" style={{ ...SCREW, top: 5, right: 5 }} />
      <span className="hh-screw" style={{ ...SCREW, bottom: 5, left: 5 }} />
      <span className="hh-screw" style={{ ...SCREW, bottom: 5, right: 5 }} />

      {/* The step down, then the pane, over the bar and the picture alike */}
      <div className="hh-well absolute rounded-[19px]" style={{ inset: 9 }} />
      <div
        className="hh-glass absolute overflow-hidden rounded-[12px]"
        style={{ inset: "var(--hh-bezel-w, 18px)" }}
      />
    </div>
  );
}
// The viewer: the glass assembly the picture is seen through.
//
// It is one machined opening in the device's own moulding, drawn in three true
// steps — and the steps tile exactly, so no band of hardware is ever doubled and
// nothing is ever painted over the picture:
//
//   0 → 6px    the moulding's shoulder, and the four screws that pin the bezel
//   6 → 9px    the rim: a 3px machined ring, lit along its top-left edge
//   9 → 18px   the recess: the step down to the pane, in the finish's dark tone
//   18px       the picture, with the pane over it
//
// --hh-top and --hh-bottom mark where the glass opens, so the moulding is drawn
// back out to the device bounds here, and only here. --hh-top sits below the
// legend band, which belongs to the case and is drawn by HandheldMasthead.
//
// MOULDING + RIM + RECESS is what --hh-bezel-w has to be for the pane to land on
// the picture's own edge.
const MOULDING = 6;
const RIM = 3;
const RECESS = 9;

export default function HandheldScreenFrame() {
  return (
    <div
      className="pointer-events-none fixed z-[47] md:hidden"
      style={{
        left: "var(--hh-frame, 0px)",
        right: "var(--hh-frame, 0px)",
        top: "calc(var(--hh-top, 96px) - var(--hh-bezel-w, 18px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 208px) - var(--hh-bezel-w, 18px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* The screws, seated in the shoulder: 5px, so they finish at the rim */}
      <span className="hh-screw absolute h-[5px] w-[5px] rounded-full" style={{ top: 1, left: 1 }} />
      <span className="hh-screw absolute h-[5px] w-[5px] rounded-full" style={{ top: 1, right: 1 }} />
      <span className="hh-screw absolute h-[5px] w-[5px] rounded-full" style={{ bottom: 1, left: 1 }} />
      <span className="hh-screw absolute h-[5px] w-[5px] rounded-full" style={{ bottom: 1, right: 1 }} />

      {/* The rim — a ring, so the picture shows straight through its middle */}
      <div className="hh-rim absolute rounded-[16px]" style={{ inset: MOULDING }} />

      {/* The step down to the pane */}
      <div className="hh-well absolute rounded-[13px]" style={{ inset: MOULDING + RIM }} />

      {/* The pane over the picture: the rim is 16, the recess 13 and the pane 11,
          so the three radii nest the way one moulding does */}
      <div
        className="hh-glass absolute overflow-hidden rounded-[11px]"
        style={{ inset: "var(--hh-bezel-w, 18px)" }}
      />
    </div>
  );
}
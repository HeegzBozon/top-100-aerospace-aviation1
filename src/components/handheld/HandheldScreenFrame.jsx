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
// back out to the device bounds here, and only here. The case carries nothing, so
// --hh-top sits directly under the shell's own top lip.
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

      {/* The step down to the pane. The band is laid from the pane's own edge
          outwards and clipped by the moulding, so its inner curve IS the pane's
          curve: the three radii nest (16, 13, 11), the rail's rounded corners sit
          inside it, and no part of the recess can ever paint over the picture.
          The band is laid wider than it reads (12px) because the clip, not the
          spread, is what shapes its outer curve — at 9px the spread's own corner
          would fall short of the clip's and leave a gap at each of the four
          corners for the surface behind the frame to show through as white. */}
      <div
        className="hh-well absolute overflow-hidden rounded-[13px]"
        style={{ inset: MOULDING + RIM }}
      >
        <div
          className="absolute rounded-[11px]"
          style={{ inset: RECESS, boxShadow: "0 0 0 12px var(--hh-recess)" }}
        />
      </div>

      {/* The pane over the picture: the rim is 16, the recess 13 and the pane 11,
          so the three radii nest the way one moulding does */}
      <div
        className="hh-glass absolute overflow-hidden rounded-[11px]"
        style={{ inset: "var(--hh-bezel-w, 18px)" }}
      />
    </div>
  );
}
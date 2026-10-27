// The viewer: the glass assembly the picture is seen through.
//
// It is one machined opening in the device's own moulding, drawn in three true
// steps — and the steps tile exactly, so no band of hardware is ever doubled and
// nothing is ever painted over the picture:
//
//   0 → 4px    the moulding's shoulder, and the four screws that pin the bezel
//   4 → 6px    the rim: a 2px machined ring, lit along its top-left edge
//   6 → 10px   the recess: the step down to the pane, in the finish's dark tone
//   10px       the picture, with the pane over it
//
// The steps run down the head and both sides only. The foot of the glass is the case's
// own lip: the opening lands on the chin, so no moulding is held below the picture and
// the readout band inside it (see ViewerFoot) is the lowest part of the glass.
//
// --hh-top and --hh-bottom mark where the glass opens, so the moulding is drawn
// back out to the device bounds here, and only here. The case carries nothing, so
// --hh-top sits directly under the shell's own top lip.
//
// MOULDING + RIM + RECESS is what --hh-bezel-w has to be for the pane to land on
// the picture's own edge — and that bezel is held as thin as the moulding allows, so
// the glass takes everything the case does not need.
const MOULDING = 4;
const RIM = 2;
const RECESS = 4;

export default function HandheldScreenFrame() {
  return (
    <div
      className="pointer-events-none fixed z-[47] md:hidden"
      style={{
        left: "var(--hh-frame, 0px)",
        right: "var(--hh-frame, 0px)",
        top: "calc(var(--hh-top, 96px) - var(--hh-bezel-w, 10px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 172px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* The screws, seated in the shoulder: 3px, so they finish at the rim. The foot
          carries none: there is no shoulder below the pane to pin.
          They stand on the corner's own diagonal rather than against the flat of the
          head. The shoulder is 4px wide, but the shell's corner is an 18px arc, and it
          has already cut the head band away well before it reaches either of these two
          points — a screw pinned to the top edge therefore hangs off the moulding and
          prints as a bright dot of bare metal on the desk. Held half way out along the
          corner instead — radius 16 of that 18: the middle of the band between the
          shell's edge and the rim — it sits on the case, which is what it is: the screw
          that pins the bezel. */}
      <span className="hh-screw absolute h-[3px] w-[3px] rounded-full" style={{ top: 5.2, left: 5.2 }} />
      <span className="hh-screw absolute h-[3px] w-[3px] rounded-full" style={{ top: 5.2, right: 5.2 }} />

      {/* The rim — a ring, so the picture shows straight through its middle. Its radius
          is the pane's, plus the width of everything held between them: 8 + 6 = 14, so
          the band around the opening keeps one width as it turns the corner. */}
      <div className="hh-rim absolute rounded-[14px]" style={{ inset: `${MOULDING}px ${MOULDING}px 0` }} />

      {/* The step down to the pane. The band is laid from the pane's own edge
          outwards and clipped by the moulding, so its inner curve IS the pane's
          curve: the radii nest exactly — 18 at the shell's edge, 14 at the rim, 12
          here, 8 at the pane, each one the next smaller plus the width of the band
          between them — so the opening keeps one bezel all the way round its
          corners, the rail's rounded corners sit inside it, and no part of the
          recess can ever paint over the picture.
          The band is laid wider than it reads (12px) because the clip, not the
          spread, is what shapes its outer curve — at the recess's own width the
          spread's corner would fall short of the clip's and leave a gap at each of
          the top corners for the surface behind the frame to show through as white. */}
      <div
        className="hh-well absolute overflow-hidden rounded-[12px]"
        style={{ inset: `${MOULDING + RIM}px ${MOULDING + RIM}px 0` }}
      >
        <div
          className="absolute rounded-[8px]"
          style={{ inset: `${RECESS}px ${RECESS}px 0`, boxShadow: "0 0 0 12px var(--hh-recess)" }}
        />
      </div>

      {/* The pane over the picture: the rim is 12, the recess 10 and the pane 8,
          so the three radii nest the way one moulding does. It is set square at the
          foot — no step below it — so the picture runs down to the chin. */}
      <div
        className="hh-glass absolute overflow-hidden rounded-[8px]"
        style={{ inset: "var(--hh-bezel-w, 10px) var(--hh-bezel-w, 10px) 0" }}
      />
    </div>
  );
}
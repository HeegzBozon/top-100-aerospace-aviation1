// The viewer. The glass is recessed straight into the device's own moulding: a
// machined metal rim runs around the opening, a dark step drops away below it,
// and the picture sits at the bottom of that well with the case screws in the
// corners. There is no panel here — the recess is cut into the one body that
// carries the controls, which is what keeps the hardware reading as one object.
//
// --hh-top and --hh-bottom mark the glass opening, so the moulding is drawn back
// out to the device bounds here, and only here. --hh-top sits below the legend
// band, which belongs to the case and is drawn by HandheldMasthead.
const SCREW = { position: "absolute", width: 6, height: 6 };

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
      {/* The machined rim the glass is set against */}
      <div className="hh-rim absolute rounded-[20px]" style={{ inset: 6 }} />

      {/* The step down into the well */}
      <div className="hh-well absolute rounded-[17px]" style={{ inset: 9 }} />

      {/* The screws that pin the bezel to the body */}
      <span className="hh-screw rounded-full" style={{ ...SCREW, top: 4, left: 4 }} />
      <span className="hh-screw rounded-full" style={{ ...SCREW, top: 4, right: 4 }} />
      <span className="hh-screw rounded-full" style={{ ...SCREW, bottom: 4, left: 4 }} />
      <span className="hh-screw rounded-full" style={{ ...SCREW, bottom: 4, right: 4 }} />

      {/* The pane, over the picture — the rim is 20, the recess 17 and the pane
          14, so the three steps nest the way one moulding does */}
      <div
        className="hh-glass absolute overflow-hidden rounded-[14px]"
        style={{ inset: "var(--hh-bezel-w, 18px)" }}
      />
    </div>
  );
}
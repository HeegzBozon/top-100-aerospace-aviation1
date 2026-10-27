// The device body: one moulding from the top edge of the hardware down to the
// chin, and the surface everything else is set into — the screen's recess, the
// keys, the grille. It sits at the very back of the stack (behind the picture),
// which is what lets one continuous object carry both the display and the
// controls instead of two panels butting together.
//
// Its corner is concentric with the glass: the pane opens 8px round and sits 14px
// in from this edge, so 22 is the one radius that keeps the moulding the same width
// as it turns the corner (22 = 8 + 14, and 14 = 8 + 6 for the rim inside it). A
// rounder shell is what makes a bezel look fat at the corners and thin along the
// sides — the glass and the case read as two shapes rather than one opening.
export default function HandheldBody() {
  return (
    <div
      className="hh-body hh-grain pointer-events-none fixed md:hidden"
      style={{
        zIndex: -1,
        left: "var(--hh-frame, 0px)",
        right: "var(--hh-frame, 0px)",
        top: "calc(var(--hh-shell-top, 26px) + env(safe-area-inset-top))",
        bottom: "var(--hh-frame, 0px)",
        borderRadius: "22px",
      }}
      aria-hidden="true"
    />
  );
}
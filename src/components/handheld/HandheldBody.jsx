// The device body: one moulding from the top edge of the hardware down to the
// chin, and the surface everything else is set into — the screen's recess, the
// keys, the grille. It sits at the very back of the stack (behind the picture),
// which is what lets one continuous object carry both the display and the
// controls instead of two panels butting together.
export default function HandheldBody() {
  return (
    <div
      className="hh-body hh-grain pointer-events-none fixed md:hidden"
      style={{
        zIndex: -1,
        left: "var(--hh-frame, 0px)",
        right: "var(--hh-frame, 0px)",
        top: "calc(var(--hh-top, 44px) - var(--hh-bezel-w, 18px) + env(safe-area-inset-top))",
        bottom: "var(--hh-frame, 0px)",
        borderRadius: "26px",
      }}
      aria-hidden="true"
    />
  );
}
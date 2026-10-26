// The viewer. A recessed LCD well drawn exactly around the glass: the moulded
// bezel ring sits in the margin, the brand bar caps the top strip of the glass,
// and the pane — scanlines, vignette, sheen — lies over everything inside it,
// the bar included. That is what makes the whole screen read as one display.
export default function HandheldScreenFrame() {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[47] md:hidden"
      style={{
        top: "calc(var(--hh-top, 12px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* The moulding: a recessed well with a lit inner lip */}
      <div className="hh-well absolute inset-0 rounded-[16px]" />

      {/* The pane, over the bar and the picture alike */}
      <div className="hh-glass absolute bottom-[5px] left-[7px] right-[7px] top-[5px] overflow-hidden rounded-[12px]" />
    </div>
  );
}
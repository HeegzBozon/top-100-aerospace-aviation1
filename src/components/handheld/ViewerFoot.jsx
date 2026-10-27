import useClock from "@/hooks/useClock";

// The glass's footer: the readout band cut across the foot of the picture.
//
// One thing rides here: the device's readout — the cycle's stamp, running, so the
// machine reads as switched on rather than as a photograph of a time. It is the glass's
// own footer rather than a strip below it: the picture opens straight onto the chin (see
// handheldGeometry), so this band is the lowest part of the glass and the content window
// ends on its top edge. The Share pill that used to stand at its right is on the chin
// now, among the controls (see HandheldDeck).
//
// The loading chassis paints the same band with staticView, so the footprint is
// already standing when the console comes up over it and nothing shifts.
//
// It stands above the case (the chin) in the stack, and its bottom edge is measured
// from the same line as the pane's: the glass's own lip and the chin meet exactly
// there, so nothing the machine wears can ever rise over the readout.
export default function ViewerFoot({ staticView = false }) {
  const now = useClock();

  return (
    <div
      aria-hidden={staticView || undefined}
      className="hh-viewer-foot pointer-events-none fixed z-[42] flex items-center px-2.5 md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        bottom: "calc(var(--hh-bottom, 172px) + env(safe-area-inset-bottom))",
        height: "var(--hh-foot, 32px)",
      }}
    >
      {/* The readout: the cycle, the day, and the seconds turning over */}
      <span
        className="flex min-w-0 items-baseline gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
        style={{
          color: "var(--hh-lcd)",
          fontVariantNumeric: "tabular-nums",
          opacity: staticView ? 0.55 : 1,
        }}
      >
        <span style={{ color: "var(--hh-lcd-bright)" }}>MMXXVI</span>
        <span className="shrink-0" style={{ opacity: 0.6 }}>
          ·
        </span>
        <span className="truncate">{now.format("ddd D MMM")}</span>
        <span className="shrink-0" style={{ opacity: 0.6 }}>
          ·
        </span>
        <span className="shrink-0">
          {now.format("HH:mm")}
          <span style={{ color: "var(--hh-lcd-bright)" }}>:{now.format("ss")}</span>
        </span>
      </span>
    </div>
  );
}
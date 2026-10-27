import { Share } from "lucide-react";
import useClock from "@/hooks/useClock";

// The glass's footer: the readout band cut across the foot of the picture.
//
// Two things ride here, at either end of one instrument band: the Share pill at the
// left, close to the hand already holding the machine, and the device's readout at the
// right — the cycle's stamp, running, so the machine reads as switched on rather than as
// a photograph of a time. A machined seam runs between them, so the middle of the band
// is ruled rather than left empty and the two ends read as one piece of equipment.
//
// It is the glass's own footer rather than a strip below it: the picture opens straight
// onto the chin (see handheldGeometry), so this band is the lowest part of the glass and
// the content window ends on its top edge.
//
// The loading chassis paints the same band with staticView — the pill printed on it
// rather than pressable — so the footprint is already standing when the console comes up
// over it and nothing shifts.
//
// It stands above the case (the chin) in the stack, and its bottom edge is measured from
// the same line as the pane's: the glass's own lip and the chin meet exactly there, so
// nothing the machine wears can ever rise over the readout.
export default function ViewerFoot({ staticView = false, shareOpen = false, onShare = null }) {
  const now = useClock();
  const live = !staticView && !!onShare;

  const pill =
    "hh-share-pill flex h-[21px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[7px] font-bold uppercase tracking-[0.2em]";
  const pillInk = { color: "var(--hh-pad-ink)" };

  return (
    <div
      aria-hidden={staticView || undefined}
      className="hh-viewer-foot pointer-events-none fixed z-[42] flex items-center gap-2.5 px-2.5 md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        bottom: "calc(var(--hh-bottom, 172px) + env(safe-area-inset-bottom))",
        height: "var(--hh-foot, 32px)",
      }}
    >
      {/* The press, at the left of the band */}
      {live ? (
        <button
          type="button"
          onClick={onShare}
          data-open={shareOpen || undefined}
          aria-label={shareOpen ? "Close the share drawer" : "Share this page"}
          className={`pointer-events-auto ${pill}`}
          style={pillInk}
        >
          <Share className="h-[9px] w-[9px] shrink-0" />
          Share
        </button>
      ) : (
        <span className={`${pill} hh-engrave`} style={{ ...pillInk, opacity: 0.5 }}>
          <Share className="h-[9px] w-[9px] shrink-0" />
          Share
        </span>
      )}

      {/* The seam: what is left of the band, ruled */}
      <span className="hh-foot-seam h-px flex-1" aria-hidden="true" />

      {/* The readout, at the right: the cycle, the day, the seconds turning over */}
      <span
        className="flex shrink-0 items-baseline gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
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
        <span className="shrink-0">{now.format("ddd D MMM")}</span>
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
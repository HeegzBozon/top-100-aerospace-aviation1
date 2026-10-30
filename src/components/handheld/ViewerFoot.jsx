import { Share } from "lucide-react";
import useClock from "@/hooks/useClock";

// The glass's footer: the readout band cut across the foot of the picture.
//
// It is one instrument band reading left to right: the Share pill at the left, close to
// the hand already holding the machine; then the measure, ruled through the middle —
// where you stand in the index, filled in copper as the cursor walks it, so the middle
// of the band is no longer dead space but the position of the wheel printed in metal;
// then the readout at the right, the cycle's stamp with the seconds turning over, so
// the machine reads as switched on rather than as a photograph of a time.
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
const pad = (value) => String(value || 0).padStart(2, "0");

export default function ViewerFoot({ staticView = false, shareOpen = false, onShare = null, position = null }) {
  const now = useClock();
  const live = !staticView && !!onShare;

  const at = position?.at || 0;
  const total = position?.total || 0;
  const travelled = total ? Math.min(100, Math.round((at / total) * 100)) : 0;

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

      {/* The measure: the position of the wheel, ruled and filled */}
      <span className="hh-foot-seam relative h-px min-w-[10px] flex-1 overflow-hidden" aria-hidden="true">
        {travelled > 0 ? (
          <span
            className="absolute inset-y-0 left-0"
            style={{
              width: `${travelled}%`,
              background:
                "linear-gradient(90deg, rgb(var(--editorial-copper-rgb) / 0.9), rgb(var(--editorial-gold-rgb) / 0.95))",
            }}
          />
        ) : null}
      </span>

      {/* The readout, at the right: the position, the cycle, the seconds turning over */}
      <span
        className="flex shrink-0 items-baseline gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em]"
        style={{
          color: "var(--hh-lcd)",
          fontVariantNumeric: "tabular-nums",
          opacity: staticView ? 0.55 : 1,
        }}
      >
        {total ? (
          <>
            <span style={{ color: "var(--hh-lcd-bright)" }}>
              {pad(at)}
              <span style={{ opacity: 0.55 }}>/{pad(total)}</span>
            </span>
            <span className="shrink-0" style={{ opacity: 0.6 }}>
              ·
            </span>
          </>
        ) : null}
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
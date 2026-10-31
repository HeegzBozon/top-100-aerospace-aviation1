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

  // The one press on this band, so it is drawn at the size of a key rather than of a label:
  // the full height the band has to give, the word beside the mark, and a copper edge that
  // makes it read as a key waiting to be pressed rather than as print.
  const pill =
    "hh-share-pill flex h-[23px] shrink-0 items-center gap-1.5 rounded-full pl-2 pr-2.5 text-[7.5px] font-bold uppercase tracking-[0.18em]";
  const pillInk = { color: "var(--hh-pad-ink)" };

  return (
    <div
      aria-hidden={staticView || undefined}
      className="hh-viewer-foot rc-band pointer-events-none fixed z-[42] flex items-center gap-2 px-3 md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        bottom: "calc(var(--hh-bottom, 172px) + env(safe-area-inset-bottom))",
        height: "var(--hh-foot, 32px)",
      }}
    >
      {/* The radio's cut at the foot of the glass: the band bolted into the case at both
          ends, and the same trench ruled along its foot as the menu strip's above. */}
      <span className="rc-rivet" style={{ left: 3 }} aria-hidden="true" />
      <span className="rc-rivet" style={{ right: 3 }} aria-hidden="true" />

      {/* The press, at the left of the band */}
      {live ? (
        <button
          type="button"
          onClick={onShare}
          data-open={shareOpen || undefined}
          aria-label={shareOpen ? "Close the share drawer" : "Share this page"}
          aria-pressed={shareOpen || undefined}
          className={`pointer-events-auto ${pill}`}
          style={pillInk}
        >
          <Share className="h-[11px] w-[11px] shrink-0" strokeWidth={2.4} />
          Share
        </button>
      ) : (
        <span className={`${pill} hh-engrave`} style={{ ...pillInk, opacity: 0.5 }}>
          <Share className="h-[11px] w-[11px] shrink-0" strokeWidth={2.4} />
          Share
        </span>
      )}

      {/* The measure, ruled the way the radio cuts its trench: the position of the wheel
          filled in copper inside a groove of the finish's own dark, parted from the press
          and the readout by the band's own machined seams. */}
      <span className="hh-strip-seam h-[12px] shrink-0" aria-hidden="true" />
      <span className="rc-groove relative h-[7px] min-w-0 flex-1 overflow-hidden" aria-hidden="true">
        {travelled > 0 ? (
          <span
            className="absolute inset-y-[1px] left-[1px] rounded-[2px]"
            style={{
              width: `${travelled}%`,
              background:
                "linear-gradient(90deg, rgb(var(--editorial-copper-rgb) / 0.9), rgb(var(--editorial-gold-rgb) / 0.95))",
            }}
          />
        ) : null}
      </span>
      <span className="hh-strip-seam h-[12px] shrink-0" aria-hidden="true" />

      {/* The readout, at the right: the position, the cycle, the seconds turning over */}
      <span
        className="flex min-w-0 items-baseline justify-end gap-1.5 overflow-hidden whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.14em]"
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
        <span className="hidden shrink-0 min-[400px]:inline">{now.format("ddd D MMM")}</span>
        <span className="shrink-0" style={{ opacity: 0.6 }}>
          ·
        </span>
        <span className="shrink-0">
          {now.format("HH:mm")}
          <span style={{ color: "var(--hh-lcd-bright)" }}>:{now.format("ss")}</span>
        </span>
      </span>

      <span className="rc-trench" aria-hidden="true" />
    </div>
  );
}
import { Share } from "lucide-react";
import useClock from "@/hooks/useClock";

// The viewer's foot: the band cut across the bottom of the glass, the companion to
// the control rail across its head. It is taken from the picture's own bottom edge
// rather than added below it, so the pane keeps its full width — the content is
// inset above the band instead — and the pane's own bottom corners are what close it.
//
// Two things ride here. At the left, the device's readout: the cycle's stamp, running,
// so the machine reads as switched on rather than as a photograph of a time. At the
// right, the Share pill — the press that used to be printed on the ring, given a key
// of its own, where every surface has it, no drawer covers it, and no page can take it
// away when it claims the face keys. The pill lights while the drawer it opened is
// standing open, and puts it away again the moment it is pressed.
//
// The loading chassis paints the same band with staticView, so the footprint is
// already standing when the console comes up over it and nothing shifts.
export default function ViewerFoot({ onShare, shareOpen = false, staticView = false }) {
  const now = useClock();
  const pill =
    "hh-viewer-pill flex h-[21px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[7px] font-bold uppercase tracking-[0.2em]";

  const mark = (
    <>
      <Share className="h-[9px] w-[9px] shrink-0" />
      Share
    </>
  );

  return (
    <div
      aria-hidden={staticView || undefined}
      className="hh-viewer-foot fixed z-[34] flex items-center gap-2 px-2.5 md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        bottom: "var(--hh-bottom, 176px)",
        height: "var(--hh-foot, 0px)",
      }}
    >
      {/* The readout: the cycle, the day, and the seconds turning over */}
      <span
        className="flex min-w-0 items-baseline gap-1.5 text-[8px] font-bold uppercase tracking-[0.14em]"
        style={{
          color: "var(--hh-lcd-soft)",
          fontVariantNumeric: "tabular-nums",
          opacity: staticView ? 0.55 : 1,
        }}
      >
        <span style={{ color: "var(--hh-lcd)" }}>MMXXVI</span>
        <span className="shrink-0" style={{ opacity: 0.5 }}>
          ·
        </span>
        <span className="truncate">{now.format("ddd D MMM")}</span>
        <span className="shrink-0" style={{ opacity: 0.5 }}>
          ·
        </span>
        <span className="shrink-0">
          {now.format("HH:mm")}
          <span style={{ color: "var(--hh-lcd-bright)" }}>:{now.format("ss")}</span>
        </span>
      </span>

      <span className="min-w-2 flex-1" aria-hidden="true" />

      {staticView ? (
        <span className={pill} style={{ color: "var(--hh-pad-ink)", opacity: 0.5 }}>
          {mark}
        </span>
      ) : (
        <button
          type="button"
          onClick={onShare}
          data-open={shareOpen || undefined}
          aria-label={shareOpen ? "Close the share drawer" : "Share this page"}
          className={pill}
          style={{ color: "var(--hh-pad-ink)" }}
        >
          {mark}
        </button>
      )}
    </div>
  );
}
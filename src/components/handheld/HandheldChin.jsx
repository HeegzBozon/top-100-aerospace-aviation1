import { Share } from "lucide-react";
import { FACE_KEYS } from "./FaceButtons";
import ViewerFoot from "./ViewerFoot";
import { DECK_CLEARANCE, FRAME_GUTTER } from "./handheldGeometry";

// The chin, while the console is not mounted yet.
//
// A load paints the case first and the controls last, so between those two beats
// the device is whole but unlit: the same casting as the real chin — the same
// height, the same corner screws, the same speaker well and footer plate — with the
// wheel seated in its well and the keys drawn flat, and the viewer's own foot band
// standing at the bottom of the glass (see ViewerFoot). Every footprint below is
// taken from the live control it stands in for, so nothing shifts when the controls
// come up.
export default function HandheldChin() {
  return (
    <>
      <div
        aria-hidden="true"
        className="hh-chin pointer-events-none fixed z-40 select-none pb-3 md:hidden"
        style={{
          left: `${FRAME_GUTTER}px`,
          right: `${FRAME_GUTTER}px`,
          bottom: `${FRAME_GUTTER}px`,
          height: `${DECK_CLEARANCE}px`,
          borderRadius: "0 0 26px 26px",
        }}
      >
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, left: 5 }} />
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, right: 5 }} />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-1.5">
          {/* The speaker well and the Share pill beneath it: punched and waiting for
              their controls. */}
          <span className="flex flex-col items-center gap-1">
            <span className="hh-speaker h-[54px] w-[54px]" style={{ opacity: 0.55 }} />
            <span
              className="hh-share-pill flex h-[21px] items-center gap-1.5 rounded-full px-2.5 text-[7px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--hh-pad-ink)", opacity: 0.5 }}
            >
              <Share className="h-[9px] w-[9px] shrink-0" />
              Share
            </span>
          </span>

          {/* The wheel, seated but not yet lit. */}
          <span
            className="rounded-full"
            style={{
              width: 104,
              height: 104,
              background:
                "radial-gradient(circle at 50% 34%, var(--hh-shell-2) 0%, var(--hh-shell-3) 100%)",
              boxShadow:
                "inset 0 2px 9px rgba(3,6,13,0.52), inset 0 0 0 1px rgba(3,6,13,0.28), 0 1px 0 var(--hh-shell-spec)",
            }}
          />

          {/* The keys, drawn flat — the cluster they land on. */}
          <div
            className="relative justify-self-end"
            style={{ width: FACE_KEYS.BOX_W, height: FACE_KEYS.BOX_H }}
          >
            {[
              { top: 0, left: FACE_KEYS.OFFSET_X },
              { top: FACE_KEYS.OFFSET_Y, left: 0 },
              { top: FACE_KEYS.OFFSET_Y, right: 0 },
              { bottom: 0, left: FACE_KEYS.OFFSET_X },
            ].map((spot, i) => (
              <span
                key={i}
                className="absolute rounded-[9px]"
                style={{
                  ...spot,
                  width: FACE_KEYS.KEY_W,
                  height: FACE_KEYS.KEY_H,
                  background: "linear-gradient(180deg, var(--hh-pad-1) 0%, var(--hh-pad-2) 100%)",
                  opacity: 0.5,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                }}
              />
            ))}
          </div>
        </div>

        {/* The footer plate: the model mark, engraved and unlit, seated inside the
            case the way the live plate is. */}
        <div className="hh-footer relative mt-2 flex h-[24px] items-center gap-2.5 px-3">
          <span
            className="hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            <span className="hh-screw h-[6px] w-[6px] rounded-full" />
            HW-88
          </span>

          <span
            aria-hidden="true"
            className="h-px min-w-[6px] flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.04), rgb(var(--hh-metal-rgb) / 0.28))",
            }}
          />

          <span
            className="hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            <span className="hh-footer-led" />
            Standby
          </span>
        </div>
      </div>

      {/* The glass's footer, painted unlit while the console is not mounted yet: the
          readout band, standing exactly where the live one takes over from it. */}
      <ViewerFoot staticView />
    </>
  );
}
import { FACE_KEYS } from "./FaceButtons";
import ViewerFoot from "./ViewerFoot";
import { DECK_CLEARANCE, FRAME_GUTTER } from "./handheldGeometry";

// The chin, while the console is not mounted yet.
//
// A load paints the case first and the controls last, so between those two beats
// the device is whole but unlit: the same casting as the real chin — the same
// height, the same corner screws, the same legend band and speaker well — with the
// wheel seated in its well and the keys drawn flat, and the viewer's own foot band
// standing at the bottom of the glass (see ViewerFoot). Every footprint below is
// taken from the live control it stands in for, so nothing shifts when the controls
// come up.
export default function HandheldChin() {
  return (
    <>
      <div
        aria-hidden="true"
        className="hh-chin pointer-events-none fixed z-40 select-none md:hidden"
        style={{
          left: `${FRAME_GUTTER}px`,
          right: `${FRAME_GUTTER}px`,
          bottom: `${FRAME_GUTTER}px`,
          height: `calc(${DECK_CLEARANCE}px + env(safe-area-inset-bottom))`,
          /* Square where it meets the glass, and the body's own corner at the foot. */
          borderRadius: "0 0 22px 22px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, left: 5 }} />
        <span className="hh-screw absolute h-[6px] w-[6px] rounded-full" style={{ top: 4, right: 5 }} />

        {/* The legend band, seated but unlit until the console's own bar comes up. */}
        <div className="mx-3 h-[26px] rounded-[4px]" style={{ background: "var(--hh-recess)", opacity: 0.55 }} />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-1.5">
          {/* The speaker well: punched and waiting for its control. */}
          <span className="flex items-center justify-center">
            <span className="hh-speaker h-[54px] w-[54px]" style={{ opacity: 0.55 }} />
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
      </div>

      {/* The glass's footer, painted unlit while the console is not mounted yet: the
          readout band, standing exactly where the live one takes over from it. */}
      <ViewerFoot staticView />
    </>
  );
}
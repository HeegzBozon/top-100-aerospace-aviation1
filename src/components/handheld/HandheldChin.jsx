import { DECK_CLEARANCE, FRAME_GUTTER } from "./handheldGeometry";

// The chin, while the console is not mounted yet.
//
// A load paints the case first and the controls last, so between those two beats
// the device is whole but unlit: the same casting as the real chin — the same
// height, the same corner screws, the same plate — with the wheel seated in its
// well and the keys drawn flat. The live console lands on exactly this footprint,
// so nothing shifts when the controls come up.
export default function HandheldChin() {
  return (
    <div
      aria-hidden="true"
      className="hh-chin pointer-events-none fixed z-40 select-none md:hidden"
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

      <div className="flex items-center gap-2.5 px-4 pt-1.5">
        {/* The speaker well: punched, waiting for the record. */}
        <span className="hh-grille h-[26px] w-[34px] shrink-0 rounded-[7px]" style={{ opacity: 0.5 }} />

        {/* The wheel, seated but not yet lit. */}
        <div className="flex min-w-0 flex-1 justify-center">
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
        </div>

        {/* The keys, drawn flat — the cluster the face buttons sit on. */}
        <div className="grid shrink-0 grid-cols-2 gap-[7px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-[34px] w-[34px] rounded-[9px]"
              style={{
                background: "linear-gradient(180deg, var(--hh-pad-1) 0%, var(--hh-pad-2) 100%)",
                opacity: 0.5,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            />
          ))}
        </div>
      </div>

      {/* The plate line: the model, and what the console is doing. */}
      <div className="hh-plate mt-0.5 flex h-[20px] items-center gap-2 px-4">
        <span
          className="hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]"
          style={{ color: "var(--hh-ink-soft)" }}
        >
          <span className="hh-screw h-[6px] w-[6px] rounded-full" />
          HW-88
        </span>

        <span
          aria-hidden="true"
          className="h-px min-w-[8px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.04), rgb(var(--hh-metal-rgb) / 0.28))",
          }}
        />

        <span
          className="hh-engrave shrink-0 text-[6.5px] font-bold uppercase tracking-[0.24em]"
          style={{ color: "var(--hh-ink-soft)" }}
        >
          Standby
        </span>
      </div>
    </div>
  );
}
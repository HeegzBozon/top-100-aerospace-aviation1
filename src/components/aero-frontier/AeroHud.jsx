import { AERO, TOTAL_STEPS, SYSTEMS } from "./aeroConfig";

// The field's instrument strip: the four numbers the day is spent in, and the
// state of the airframe. Amber on a denim face, the way a working panel reads.
export default function AeroHud({ doc, condition }) {
  const cells = [
    { label: "Day", value: doc.day },
    { label: "Hours", value: doc.hours },
    { label: "Salvage", value: doc.parts },
    { label: "Airframe", value: `${condition}%` },
    { label: "Circuits", value: doc.flights },
  ];

  const stepsDone = SYSTEMS.reduce(
    (sum, system) => sum + Math.min(doc.system_steps?.[system.key] || 0, system.steps.length),
    0,
  );

  return (
    <div
      className="overflow-hidden rounded-[10px]"
      style={{ background: AERO.denim, border: `1px solid ${AERO.line}` }}
    >
      <div className="flex items-stretch">
        {cells.map((cell, i) => (
          <div
            key={cell.label}
            className="min-w-0 flex-1 px-2 py-1.5"
            style={i ? { borderLeft: `1px solid ${AERO.line}` } : undefined}
          >
            <p className="truncate text-[6.5px] font-bold uppercase tracking-[0.18em]" style={{ color: AERO.muted }}>
              {cell.label}
            </p>
            <p className="af-readout text-[13px] font-semibold leading-tight" style={{ color: AERO.amber }}>
              {cell.value}
            </p>
          </div>
        ))}
      </div>

      <div className="px-2 pb-2 pt-1.5" style={{ borderTop: `1px solid ${AERO.line}` }}>
        <div className="h-[5px] overflow-hidden rounded-full" style={{ background: "rgba(8,18,26,0.6)" }}>
          <div
            className="af-gauge h-full rounded-full"
            style={{
              width: `${condition}%`,
              background: `linear-gradient(90deg, ${AERO.grass}, ${AERO.amber})`,
            }}
          />
        </div>
        <p className="mt-1 text-[7.5px] uppercase tracking-[0.16em]" style={{ color: AERO.muted }}>
          Airframe {stepsDone} of {TOTAL_STEPS} jobs done
        </p>
      </div>
    </div>
  );
}
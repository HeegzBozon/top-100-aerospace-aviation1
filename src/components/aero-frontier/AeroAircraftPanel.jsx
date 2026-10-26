import { Check, Lock, Package, Wrench } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { AERO, AERO_SCENES, SYSTEMS, systemByKey } from "./aeroConfig";
import AeroGauge from "./AeroGauge";
import AeroPlate from "./AeroPlate";

// The airframe. Salvage is paid once to open a system, then an hour at a time
// goes into the work itself, so the restoration reads as a season of evenings
// rather than as a purchase. A system nobody has ordered parts for is sourcing;
// one behind its predecessor is locked and names it.
export default function AeroAircraftPanel({ aero }) {
  const { doc, openSystem, workStep } = aero;

  return (
    <div className="space-y-3 px-3 pb-1 pt-3">
      <AeroPlate
        scene={AERO_SCENES.airframe}
        act="Act I · The Inheritance"
        chapter="Chapter 2 · The airframe"
        caption="Cowling off, bench clear, and nine years of dry air in every cylinder."
        tall
      />

      {SYSTEMS.map((system) => {
        const steps = doc.system_steps?.[system.key];
        const opened = steps !== undefined;
        const done = opened && steps >= system.steps.length;
        const waitingOn = (system.after || []).filter((key) => doc.system_steps?.[key] === undefined);
        const locked = !opened && waitingOn.length > 0;
        const shortParts = !opened && !locked && doc.parts < system.parts;
        const shortHours = opened && !done && doc.hours < 1;

        return (
          <div
            key={system.key}
            className="rounded-2xl px-3 py-2.5"
            style={{
              background: done ? "rgba(30,58,90,0.045)" : "#ffffff",
              border: `1px solid ${done ? "rgba(30,58,90,0.10)" : B.border}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-heading text-[14px] leading-tight" style={{ color: done ? B.muted : B.navy }}>
                {system.label}
              </p>
              {done ? (
                <span
                  className="flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "#5c6a3c" }}
                >
                  <Check className="h-[11px] w-[11px]" /> In condition
                </span>
              ) : (
                <span className="af-readout shrink-0 text-[9px]" style={{ color: B.muted }}>
                  {opened ? `${steps} / ${system.steps.length} jobs` : `${system.parts} salvage`}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
              {system.note}
            </p>

            {opened ? (
              <div className="mt-2">
                <AeroGauge value={steps} max={system.steps.length} tone={done ? "grass" : "amber"} />
                {!done ? (
                  <>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
                      Next: {system.steps[steps]}
                    </p>
                    <button
                      type="button"
                      disabled={shortHours}
                      onClick={() => workStep(system.key)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99] disabled:opacity-45"
                      style={{ background: shortHours ? "rgba(30,58,90,0.06)" : B.copper, color: shortHours ? B.muted : "#fff" }}
                    >
                      <Wrench className="h-[11px] w-[11px]" />
                      {shortHours ? "No light left today" : "An hour on it"}
                    </button>
                  </>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                disabled={locked || shortParts}
                onClick={() => openSystem(system.key)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99] disabled:opacity-45"
                style={{
                  background: locked || shortParts ? "rgba(30,58,90,0.06)" : AERO.denim,
                  color: locked || shortParts ? B.muted : AERO.amber,
                }}
              >
                {locked ? (
                  <>
                    <Lock className="h-[11px] w-[11px]" /> After {systemByKey(waitingOn[0])?.label}
                  </>
                ) : shortParts ? (
                  <>
                    <Package className="h-[11px] w-[11px]" /> Needs {system.parts - doc.parts} more salvage
                  </>
                ) : (
                  <>
                    <Package className="h-[11px] w-[11px]" /> Lay in the parts
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
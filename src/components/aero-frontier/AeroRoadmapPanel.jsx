import { Check, Hammer } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { ACTS, AERO, FIELD_TASKS, SYSTEMS } from "./aeroConfig";
import AeroGauge from "./AeroGauge";

// The road ahead: the whole game, staged, with the act you can play marked as
// playable and the rest marked as not built yet. A roadmap that quietly pretends
// is worse than one that says where it stands.
export default function AeroRoadmapPanel({ aero }) {
  const { doc, condition } = aero;
  const fieldDone = FIELD_TASKS.filter((task) => doc.tasks.includes(task.key)).length;
  const systemsDone = SYSTEMS.filter(
    (system) => (doc.system_steps?.[system.key] || 0) >= system.steps.length,
  ).length;

  return (
    <div className="space-y-3 px-3 pb-1 pt-3">
      <div className="rounded-2xl px-3 py-3" style={{ background: AERO.denim, border: `1px solid ${AERO.line}` }}>
        <p className="text-[7.5px] font-bold uppercase tracking-[0.24em]" style={{ color: AERO.amber }}>
          Where Act I stands
        </p>
        <div className="mt-2 space-y-2">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px]" style={{ color: AERO.muted }}>
                Ground worked
              </span>
              <span className="af-readout text-[10px]" style={{ color: AERO.amber }}>
                {fieldDone} / {FIELD_TASKS.length}
              </span>
            </div>
            <div className="mt-1">
              <AeroGauge value={fieldDone} max={FIELD_TASKS.length} tone="grass" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px]" style={{ color: AERO.muted }}>
                Systems back in condition
              </span>
              <span className="af-readout text-[10px]" style={{ color: AERO.amber }}>
                {systemsDone} / {SYSTEMS.length}
              </span>
            </div>
            <div className="mt-1">
              <AeroGauge value={condition} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px]" style={{ color: AERO.muted }}>
                Circuits flown
              </span>
              <span className="af-readout text-[10px]" style={{ color: AERO.amber }}>
                {doc.flights}
              </span>
            </div>
          </div>
        </div>
      </div>

      {ACTS.map((act) => {
        const live = act.state === "live";
        return (
          <div
            key={act.key}
            className="rounded-2xl px-3 py-3"
            style={{
              background: live ? "#fff" : "rgba(30,58,90,0.035)",
              border: `1px solid ${live ? "rgb(201 168 124 / 0.7)" : B.border}`,
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-heading text-[14px]" style={{ color: live ? B.navy : B.muted }}>
                Act {act.act} · {act.label}
              </p>
              <span
                className="shrink-0 rounded-full px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.18em]"
                style={
                  live
                    ? { background: B.copper, color: "#fff" }
                    : { background: "rgba(30,58,90,0.08)", color: B.muted }
                }
              >
                {live ? "Playing now" : "Staged"}
              </span>
            </div>

            <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: B.muted }}>
              {act.blurb}
            </p>

            <ul className="mt-2 space-y-1">
              {act.chapters.map((chapter) => (
                <li key={chapter} className="flex items-center gap-1.5 text-[10.5px]" style={{ color: B.navy }}>
                  {live ? (
                    <Check className="h-[10px] w-[10px] shrink-0" style={{ color: "#5c6a3c" }} />
                  ) : (
                    <Hammer className="h-[10px] w-[10px] shrink-0" style={{ color: B.muted }} />
                  )}
                  {chapter}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <p className="px-1 pb-2 text-[9.5px] leading-relaxed" style={{ color: B.muted }}>
        Play stays play. Nothing worked on this field is read by discovery, ranking or scoring:
        the field is kept apart from the institution's ledger on purpose.
      </p>
    </div>
  );
}
import { Check, Clock, Package, Lock } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { AERO, AERO_SCENES, FIELD_TASKS, taskByKey } from "./aeroConfig";
import AeroPlate from "./AeroPlate";

// The ground. Five mornings of work that pay for the bench: each job costs hours
// out of the day and gives up salvage. A job whose predecessor is not done is
// locked and says which job it is waiting on, so the order of the work is legible
// rather than implied.
export default function AeroFieldPanel({ aero }) {
  const { doc, workTask, turnDay } = aero;

  return (
    <div className="space-y-3 px-3 pb-1 pt-3">
      <AeroPlate
        scene={AERO_SCENES.field}
        act="Act I · The Inheritance"
        chapter="Chapter 1 · The ground"
        caption="Grass over cracked asphalt, a hangar full of someone else's tools, and a windsock that still turns."
        tall
      />

      <button
        type="button"
        onClick={turnDay}
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition-transform active:scale-[0.99]"
        style={{ background: AERO.denim, border: `1px solid ${AERO.line}` }}
      >
        <span className="min-w-0">
          <span className="block text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: AERO.amber }}>
            Turn the day
          </span>
          <span className="mt-0.5 block text-[10.5px]" style={{ color: AERO.muted }}>
            Sleep on it and take the next six hours of light
          </span>
        </span>
        <span className="af-readout shrink-0 text-[13px] font-semibold" style={{ color: AERO.amber }}>
          +6 h
        </span>
      </button>

      {FIELD_TASKS.map((task) => {
        const done = doc.tasks.includes(task.key);
        const waitingOn = (task.after || []).filter((key) => !doc.tasks.includes(key));
        const locked = waitingOn.length > 0;
        const short = doc.hours < task.hours;
        const blocked = done || locked || short;

        return (
          <div
            key={task.key}
            className="rounded-2xl px-3 py-2.5"
            style={{
              background: done ? "rgba(30,58,90,0.045)" : "#ffffff",
              border: `1px solid ${done ? "rgba(30,58,90,0.10)" : B.border}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 font-heading text-[14px] leading-tight" style={{ color: done ? B.muted : B.navy }}>
                {task.label}
              </p>
              {done ? (
                <span
                  className="flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: "#5c6a3c" }}
                >
                  <Check className="h-[11px] w-[11px]" /> Worked
                </span>
              ) : (
                <span className="af-readout shrink-0 text-[9px]" style={{ color: B.muted }}>
                  {task.hours} h · +{task.parts} salvage
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
              {task.note}
            </p>

            {!done ? (
              <button
                type="button"
                disabled={blocked}
                onClick={() => workTask(task.key)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99] disabled:opacity-45"
                style={{ background: blocked ? "rgba(30,58,90,0.06)" : B.copper, color: blocked ? B.muted : "#fff" }}
              >
                {locked ? (
                  <>
                    <Lock className="h-[11px] w-[11px]" /> After {taskByKey(waitingOn[0])?.label}
                  </>
                ) : short ? (
                  <>
                    <Clock className="h-[11px] w-[11px]" /> Needs {task.hours} h of light
                  </>
                ) : (
                  <>
                    <Package className="h-[11px] w-[11px]" /> Work it
                  </>
                )}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
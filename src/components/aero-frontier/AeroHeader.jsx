import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import AeroHud from "./AeroHud";

// The field's masthead: what surface you are on, which act you are standing in,
// and where the day is being kept. It sits above the panels on the desk and above
// the console's menu on the glass, so the same four numbers are always in view.
const STAGE_LINE = {
  field: (aero) => `${aero.tasksLeft.length} ground ${aero.tasksLeft.length === 1 ? "job" : "jobs"} left on the field`,
  hangar: (aero) => `The airframe is at ${aero.condition}% and waiting on the bench`,
  airborne: () => "The aeroplane is ready. The strip is clear.",
  flown: (aero) => `${aero.doc.flights} ${aero.doc.flights === 1 ? "circuit" : "circuits"} flown from this field`,
};

export default function AeroHeader({ aero, glass }) {
  const { doc, stage, condition, synced } = aero;

  return (
    <div className="px-3 pt-4 md:px-0 md:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            TOP 100 · A surface built for play
          </p>
          <h1 className="mt-1 font-heading text-[22px] leading-none" style={{ color: B.navy }}>
            Aero-Frontier
          </h1>
          <p className="mt-1 text-[10.5px] tracking-[0.02em]" style={{ color: B.muted }}>
            Act I · The Inheritance
          </p>
        </div>

        {!glass ? (
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
            style={{ color: B.copper }}
          >
            <ArrowLeft className="h-[11px] w-[11px]" /> Title screen
          </Link>
        ) : null}
      </div>

      <div className="mt-3">
        <AeroHud doc={doc} condition={condition} />
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[10px]" style={{ color: B.muted }}>
          {STAGE_LINE[stage]?.(aero) || ""}
        </p>
        <p className="flex shrink-0 items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
          <span
            className="inline-block h-[5px] w-[5px] rounded-full"
            style={{ background: synced ? "#6f7f4a" : "#b87333" }}
          />
          {synced ? "Filed to your record" : "Kept on this device"}
        </p>
      </div>
    </div>
  );
}
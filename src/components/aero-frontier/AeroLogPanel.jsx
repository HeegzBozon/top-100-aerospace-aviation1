import { ScrollText } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { AERO } from "./aeroConfig";

const stamp = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${date.toLocaleTimeString(
    undefined,
    { hour: "2-digit", minute: "2-digit" },
  )}`;
};

// The field log: one line per thing done, newest first. This is the record the
// game keeps of itself — a season written down in the order it happened, which is
// the only progression the prototype has to show.
export default function AeroLogPanel({ aero }) {
  const entries = aero.log || [];

  return (
    <div className="space-y-2 px-3 pb-1 pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em]" style={{ color: B.copper }}>
          The field log
        </p>
        <p className="af-readout text-[9px]" style={{ color: B.muted }}>
          {entries.length} {entries.length === 1 ? "line" : "lines"}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl px-3 py-6 text-center" style={{ background: "#fff", border: `1px dashed ${B.border}` }}>
          <ScrollText className="mx-auto h-[18px] w-[18px]" style={{ color: B.muted }} />
          <p className="mt-2 font-heading text-[14px]" style={{ color: B.navy }}>
            The page is open and blank
          </p>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed" style={{ color: B.muted }}>
            The first line writes itself the moment you walk the strip.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {entries.map((line, i) => (
            <li
              key={`${line.at}-${i}`}
              className="af-tick rounded-2xl px-3 py-2.5"
              style={{ background: "#fff", border: `1px solid ${B.border}` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="af-readout rounded-full px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.18em]"
                  style={{ background: AERO.denim, color: AERO.amber }}
                >
                  Day {line.day}
                </span>
                <span className="af-readout text-[8.5px]" style={{ color: B.muted }}>
                  {stamp(line.at)}
                </span>
              </div>
              <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: B.navy }}>
                {line.text}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
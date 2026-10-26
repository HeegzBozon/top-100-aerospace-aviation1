import { AERO } from "./aeroConfig";

// A fuel gauge: the one bar the whole prototype fills. Used for a system coming
// back into condition and for the leg of a circuit you are standing on.
export default function AeroGauge({ value, max = 100, tone = "amber", height = 6 }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  const fill =
    tone === "grass"
      ? `linear-gradient(90deg, ${AERO.pine}, ${AERO.grass})`
      : tone === "rust"
        ? `linear-gradient(90deg, ${AERO.rust}, ${AERO.amber})`
        : `linear-gradient(90deg, ${AERO.grass}, ${AERO.amber})`;

  return (
    <div
      className="overflow-hidden rounded-full"
      style={{ height, background: "rgba(8,18,26,0.6)", border: `1px solid ${AERO.line}` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="af-gauge h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
    </div>
  );
}
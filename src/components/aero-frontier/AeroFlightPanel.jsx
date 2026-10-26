import { useRef, useState } from "react";
import { Plane, RefreshCw, Wrench } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { AERO, AERO_SCENES, FLIGHT_PHASES, SCORE_BY_TONE, SYSTEMS, circuitVerdict } from "./aeroConfig";
import AeroGauge from "./AeroGauge";
import AeroPlate from "./AeroPlate";

// The first flight, in five legs. Each leg is a discipline call rather than a
// flight model: the aeroplane does what the pilot told it to, and the log keeps
// the result. A circuit is filed once, on the leg that puts the wheels back on
// the grass.
const TONE = {
  pass: { ink: "#3d5140", bg: "rgba(111,127,74,0.16)", chip: "Held" },
  rough: { ink: "#8a5a12", bg: "rgba(232,178,74,0.20)", chip: "Rough" },
  fail: { ink: "#a8551f", bg: "rgba(168,85,31,0.16)", chip: "Cost you" },
};

export default function AeroFlightPanel({ aero }) {
  const { doc, condition, recordFlight } = aero;
  const [flying, setFlying] = useState(false);
  const [leg, setLeg] = useState(0);
  const [picks, setPicks] = useState([]);
  const loggedRef = useRef(false);

  const score = picks.reduce((sum, option) => sum + SCORE_BY_TONE[option.tone], 0);
  const remaining = SYSTEMS.filter(
    (system) => (doc.system_steps?.[system.key] || 0) < system.steps.length,
  );

  const takeOff = () => {
    loggedRef.current = false;
    setPicks([]);
    setLeg(0);
    setFlying(true);
  };

  // Not airworthy yet: the panel says exactly what is outstanding and where to go.
  if (!flying && condition < 100) {
    return (
      <div className="space-y-3 px-3 pb-1 pt-3">
        <AeroPlate
          scene={AERO_SCENES.airframe}
          act="Act I · The Inheritance"
          chapter="Chapter 3 · Not yet"
          caption="An aeroplane is only finished when the bench is empty and the log is signed."
        />
        <div className="rounded-2xl px-3 py-3" style={{ background: "#fff", border: `1px solid ${B.border}` }}>
          <p className="font-heading text-[14px]" style={{ color: B.navy }}>
            Still on the bench
          </p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
            Airframe at {condition}%. Nothing flies until every system is back in condition.
          </p>
          <ul className="mt-2 space-y-1">
            {remaining.map((system) => (
              <li key={system.key} className="flex items-center gap-1.5 text-[11px]" style={{ color: B.navy }}>
                <Wrench className="h-[11px] w-[11px] shrink-0" style={{ color: AERO.rust }} />
                {system.label}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
            Work these in the airframe panel
          </p>
        </div>
      </div>
    );
  }

  // On the ground with a serviceable aeroplane, and after every circuit filed.
  if (!flying) {
    return (
      <div className="space-y-3 px-3 pb-1 pt-3">
        <AeroPlate
          scene={AERO_SCENES.sky}
          act="Act I · The Inheritance"
          chapter="Chapter 3 · The first flight"
          caption="Late light on the ridge, the windsock standing up, and the strip a pale ribbon in the grass."
          tall
        />
        <div className="rounded-2xl px-3 py-3" style={{ background: "#fff", border: `1px solid ${B.border}` }}>
          <p className="font-heading text-[14px]" style={{ color: B.navy }}>
            {doc.flights > 0 ? "The field is yours" : "Ready when you are"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
            {doc.flights > 0
              ? `Best circuit so far: ${doc.best_circuit}. Take it round again, or work the day and see what the field asks for next.`
              : "Every system is back in condition and the tanks are full. The first circuit is five decisions long."}
          </p>
          {doc.flights > 0 ? (
            <div className="mt-2">
              <AeroGauge value={doc.best_circuit} tone="grass" />
            </div>
          ) : null}
          <button
            type="button"
            onClick={takeOff}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99]"
            style={{ background: B.copper, color: "#fff" }}
          >
            <Plane className="h-[12px] w-[12px]" />
            {doc.flights > 0 ? "Fly it again" : "Take the first flight"}
          </button>
        </div>
      </div>
    );
  }

  // The circuit itself.
  const last = FLIGHT_PHASES.length - 1;
  const phase = FLIGHT_PHASES[leg];
  const pick = picks[leg] || null;

  const choose = (option) => {
    if (pick) return;
    setPicks((current) => {
      const next = [...current];
      next[leg] = option;
      return next;
    });
  };

  const nextLeg = () => {
    if (!pick) return;
    if (leg === last) {
      setLeg(FLIGHT_PHASES.length);
      if (!loggedRef.current) {
        loggedRef.current = true;
        recordFlight(
          [...picks.slice(0, leg), pick].reduce((sum, option) => sum + SCORE_BY_TONE[option.tone], 0),
        );
      }
      return;
    }
    setLeg((current) => current + 1);
  };

  if (leg >= FLIGHT_PHASES.length) {
    return (
      <div className="space-y-3 px-3 pb-1 pt-3">
        <AeroPlate
          scene={AERO_SCENES.field}
          act="Act I · The Inheritance"
          chapter="Circuit filed"
          caption={circuitVerdict(score)}
          tall
        />
        <div className="rounded-2xl px-3 py-3" style={{ background: AERO.denim, border: `1px solid ${AERO.line}` }}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[7.5px] font-bold uppercase tracking-[0.22em]" style={{ color: AERO.muted }}>
                Circuit scored
              </p>
              <p className="af-readout text-[30px] font-semibold leading-none" style={{ color: AERO.amber }}>
                {score}
              </p>
            </div>
            <p className="af-readout text-right text-[10px]" style={{ color: AERO.muted }}>
              {doc.flights} {doc.flights === 1 ? "circuit" : "circuits"}
              <br />
              best {doc.best_circuit}
            </p>
          </div>
          <p className="mt-2 font-heading text-[13px] leading-snug text-editorial-cream">
            {circuitVerdict(score)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={takeOff}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99]"
            style={{ background: B.copper, color: "#fff" }}
          >
            <RefreshCw className="h-[11px] w-[11px]" /> Again
          </button>
          <button
            type="button"
            onClick={() => setFlying(false)}
            className="flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99]"
            style={{ background: "rgba(30,58,90,0.06)", color: B.navy }}
          >
            Back to the field
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 px-3 pb-1 pt-3">
      <AeroPlate scene={AERO_SCENES.sky} act="In the air" chapter={`Leg ${leg + 1} of ${FLIGHT_PHASES.length}`} caption={phase.prompt} tall />

      <div className="flex items-center gap-2">
        <AeroGauge value={leg + 1} max={FLIGHT_PHASES.length} />
        <span className="af-readout shrink-0 text-[9px]" style={{ color: B.muted }}>
          {phase.label}
        </span>
      </div>

      <div className="space-y-2">
        {phase.choices.map((option) => {
          const chosen = pick?.key === option.key;
          const settled = !!pick;
          const tone = TONE[option.tone];
          return (
            <button
              key={option.key}
              type="button"
              disabled={settled}
              onClick={() => choose(option)}
              className="af-roll w-full rounded-xl px-3 py-2.5 text-left font-body text-[11.5px] leading-snug transition-transform active:scale-[0.99]"
              style={{
                background: chosen ? tone.bg : "#fff",
                border: `1px solid ${chosen ? tone.ink : B.border}`,
                color: B.navy,
                opacity: settled && !chosen ? 0.4 : 1,
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {pick ? (
        <div
          className="af-tick rounded-2xl px-3 py-2.5"
          style={{ background: TONE[pick.tone].bg, border: `1px solid ${TONE[pick.tone].ink}` }}
        >
          <p className="text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: TONE[pick.tone].ink }}>
            {TONE[pick.tone].chip}
          </p>
          <p className="mt-1 font-heading text-[12.5px] leading-snug" style={{ color: B.navy }}>
            {pick.line}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!pick}
        onClick={nextLeg}
        className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] transition-transform active:scale-[0.99] disabled:opacity-40"
        style={{ background: AERO.denim, color: AERO.amber }}
      >
        {leg === last ? "Set it down on the grass" : `Next leg · ${FLIGHT_PHASES[leg + 1].label}`}
      </button>
    </div>
  );
}
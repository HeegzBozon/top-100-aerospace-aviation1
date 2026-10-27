import { useEffect, useState } from "react";
import { START, SWEEP, arcPath, needleDeg, polar } from "./dialGeometry";

const TICKS = Array.from({ length: 21 }, (_, i) => i);

// One analogue instrument: a printed ivory face, a metal value arc, and a needle
// that settles onto its reading when the deck comes up. The reading is also
// printed under the face, so no value is ever carried by the needle's angle alone.
export default function InstrumentDial({ label, caption, readout, value = 0, max = 1, tone = "copper" }) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const settle = setTimeout(() => setSettled(true), 140);
    return () => clearTimeout(settle);
  }, []);

  const accent = tone === "gold" ? "var(--hh-metal-1)" : "var(--hh-metal)";
  const deg = settled ? needleDeg(value, max) : START;

  return (
    <figure className="flex w-[126px] shrink-0 flex-col items-center">
      <figcaption
        className="mb-1.5 text-[7px] font-bold uppercase tracking-[0.3em]"
        style={{ color: "var(--hh-ink-soft)" }}
      >
        {label}
      </figcaption>

      <div
        className="fd-face rounded-full p-[3px]"
        style={{ boxShadow: "inset 0 0 0 1px var(--hh-metal), 0 2px 7px rgba(3,6,13,0.5)" }}
      >
        <svg viewBox="0 0 100 100" className="h-[74px] w-[74px]">
          <path
            d={arcPath(41, START, START + SWEEP)}
            fill="none"
            stroke="rgba(34,48,63,0.20)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={arcPath(41, START, deg)}
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {TICKS.map((i) => {
            const at = START + (i * SWEEP) / 20;
            const major = i % 5 === 0;
            const [x1, y1] = polar(major ? 32 : 34.5, at);
            const [x2, y2] = polar(37.5, at);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? "#22303F" : "rgba(34,48,63,0.55)"}
                strokeWidth={major ? 1.6 : 0.9}
              />
            );
          })}
          <g className="fd-needle" style={{ transform: `rotate(${deg}deg)`, transformOrigin: "50px 50px" }}>
            <line x1="50" y1="54" x2="50" y2="22" stroke="#22303F" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <circle cx="50" cy="50" r="4.6" fill="#22303F" />
          <circle cx="50" cy="50" r="1.7" fill="var(--hh-metal-1)" />
        </svg>
      </div>

      <p className="af-readout mt-2 font-mono text-[10.5px] font-bold uppercase" style={{ color: accent }}>
        {readout}
      </p>
      <p
        className="mt-0.5 max-w-[124px] text-center text-[8px] uppercase leading-snug tracking-[0.12em]"
        style={{ color: "var(--hh-ink-soft)" }}
      >
        {caption}
      </p>
    </figure>
  );
}
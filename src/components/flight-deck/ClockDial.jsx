import { useEffect, useState } from "react";
import { polar } from "./dialGeometry";

const HOURS = Array.from({ length: 12 }, (_, i) => i * 30);

// The deck's own chronometer: local time, read off a face. It carries no platform
// data — it is the instrument a panel has whether or not anything is running.
export default function ClockDial({ label = "Chronometer", caption = "Local time" }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const hour = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
  const minute = now.getMinutes() * 6 + now.getSeconds() * 0.1;
  const second = now.getSeconds() * 6;
  const reading = now.toLocaleTimeString("en-US", { hour12: false });

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
          {HOURS.map((at) => {
            const [x1, y1] = polar(33, at);
            const [x2, y2] = polar(38, at);
            return <line key={at} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22303F" strokeWidth="1.6" />;
          })}
          <line x1="50" y1="50" x2="50" y2="30" stroke="#22303F" strokeWidth="3" strokeLinecap="round" transform={`rotate(${hour} 50 50)`} />
          <line x1="50" y1="54" x2="50" y2="22" stroke="#22303F" strokeWidth="2" strokeLinecap="round" transform={`rotate(${minute} 50 50)`} />
          <line x1="50" y1="56" x2="50" y2="18" stroke="var(--hh-metal)" strokeWidth="0.9" strokeLinecap="round" transform={`rotate(${second} 50 50)`} />
          <circle cx="50" cy="50" r="3.4" fill="#22303F" />
          <circle cx="50" cy="50" r="1.4" fill="var(--hh-metal-1)" />
        </svg>
      </div>

      <p className="af-readout mt-2 font-mono text-[10.5px] font-bold uppercase" style={{ color: "var(--hh-metal-1)" }}>
        {reading}
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
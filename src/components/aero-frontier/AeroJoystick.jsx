import { useRef, useState } from "react";
import { AERO } from "./aeroConfig";

// The click wheel, used as a joystick.
//
// Same object as the hardware below the glass — an ivory ring with print on it and
// a metal button in the middle — but turned into a control a game can use: put a
// thumb anywhere on the ring and the direction you are standing *at* is the way
// the field walks. Slide the thumb round the ring and the walk turns with it, so
// the ring steers rather than scrolls. The centre is A.
//
// The hardware wheel does the same job through the console (see the page): turn it
// and the field steps sideways, press the centre and it acts.
const DIRS = {
  up: { dx: 0, dy: -1, label: "North" },
  down: { dx: 0, dy: 1, label: "South" },
  left: { dx: -1, dy: 0, label: "West" },
  right: { dx: 1, dy: 0, label: "East" },
};

const dirFor = (deg) => {
  const a = ((deg % 360) + 360) % 360;
  if (a >= 315 || a < 45) return "up";
  if (a < 135) return "right";
  if (a < 225) return "down";
  return "left";
};

const RING = 104;

export default function AeroJoystick({ world, size = RING, hint }) {
  const ringRef = useRef(null);
  const [held, setHeld] = useState(null);
  const activeRef = useRef(null);

  const steer = (event) => {
    const ring = ringRef.current;
    if (!ring) return;
    const rect = ring.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const dir = dirFor(deg);
    if (activeRef.current === dir) return;
    if (activeRef.current) world.hold(activeRef.current, false);
    activeRef.current = dir;
    setHeld(dir);
    world.hold(dir, true);
  };

  const begin = (event) => {
    ringRef.current?.setPointerCapture?.(event.pointerId);
    steer(event);
  };

  const end = () => {
    if (activeRef.current) world.hold(activeRef.current, false);
    activeRef.current = null;
    setHeld(null);
  };

  const glyph = (dir) => {
    const on = held === dir;
    return {
      color: on ? "var(--hh-metal)" : AERO.muted,
      opacity: on ? 1 : 0.72,
      transform: on ? "scale(0.86)" : "none",
      transition: "transform 120ms ease, color 120ms ease",
    };
  };

  return (
    <div className="flex shrink-0 items-center gap-3">
      <div
        ref={ringRef}
        role="group"
        aria-label="Joystick. Drag round the ring to walk, the centre button to act."
        onPointerDown={begin}
        onPointerMove={(event) => {
          if (activeRef.current) steer(event);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        className="hh-key hh-wheel relative touch-none rounded-full outline-none"
        style={{ width: size, height: size }}
      >
        <span className="absolute left-1/2 top-[6px] -translate-x-1/2 text-[11px] font-bold" style={glyph("up")}>
          ▲
        </span>
        <span className="absolute bottom-[6px] left-1/2 -translate-x-1/2 text-[11px] font-bold" style={glyph("down")}>
          ▼
        </span>
        <span className="absolute left-[8px] top-1/2 -translate-y-1/2 text-[11px] font-bold" style={glyph("left")}>
          ◀
        </span>
        <span className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[11px] font-bold" style={glyph("right")}>
          ▶
        </span>
        <span
          className="af-readout absolute left-1/2 top-[20px] -translate-x-1/2 text-[6.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: held ? AERO.amber : AERO.muted }}
        >
          Walk
        </span>
        <span
          className="af-readout absolute bottom-[18px] left-1/2 -translate-x-1/2 text-[6.5px] font-bold uppercase tracking-[0.18em]"
          style={{ color: AERO.muted }}
        >
          Field
        </span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => world.act()}
          aria-label="A — act, talk, take"
          className="hh-key-center flex items-center justify-center rounded-full text-[11px] font-extrabold transition-transform active:scale-[0.94]"
          style={{ width: size * 0.42, height: size * 0.42, color: "var(--hh-key-ink)" }}
        >
          A
        </button>
        {hint ? (
          <p className="max-w-[104px] text-center text-[8px] leading-tight" style={{ color: AERO.muted }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
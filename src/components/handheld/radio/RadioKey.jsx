import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// One key of the radio face.
//
// The instrument has three materials and nothing else: the keypad's matte rubber, the
// ivory plastic of the cluster above it, and two lit keys that name what they do — V/M
// in the institution's copper, A/B in its navy. Legends are printed on the cap, never
// floating over it, and a cap rolls over its own bevel when a thumb presses it.
const SKINS = {
  pad: {
    className: "hh-pad-key",
    ink: "var(--hh-pad-ink)",
    sub: "rgba(233,228,216,0.52)",
    style: null,
  },
  light: {
    className: "hh-key",
    ink: "#2A3038",
    sub: "rgba(42,48,56,0.52)",
    style: null,
  },
  copper: {
    className: "",
    ink: "#2A1806",
    sub: "rgba(42,24,6,0.55)",
    style: {
      background: "linear-gradient(180deg, #D3925F 0%, #B87333 52%, #8F5C2C 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(3,6,13,0.32), 0 1px 0 rgba(3,6,13,0.34), 0 2px 5px rgba(3,6,13,0.22)",
    },
  },
  navy: {
    className: "",
    ink: "#EFE9DC",
    sub: "rgba(239,233,220,0.58)",
    style: {
      background: "linear-gradient(180deg, #2C5178 0%, #1E3A5A 54%, #152A42 100%)",
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(3,6,13,0.38), 0 1px 0 rgba(3,6,13,0.36), 0 2px 5px rgba(3,6,13,0.22)",
    },
  },
};

export default function RadioKey({
  label,
  sub = null,
  glyph: Glyph = null,
  skin = "pad",
  onPress,
  onHold = null,
  holdMs = 420,
  ariaLabel,
  pressed = false,
  className = "",
}) {
  const tone = SKINS[skin] || SKINS.pad;
  // A cap that does something else when it is held — ▲ and ▼ run to the end of what
  // they are walking. The press stays the cap's own click, so a tap is one step and the
  // hold never counts twice: a cap that has already run takes the click it was holding
  // with it.
  const timer = useRef(0);
  const held = useRef(false);
  const stopHold = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = 0;
    }
  }, []);
  const startHold = useCallback(() => {
    if (!onHold) return;
    held.current = false;
    stopHold();
    timer.current = setTimeout(() => {
      timer.current = 0;
      held.current = true;
      onHold();
    }, holdMs);
  }, [onHold, holdMs, stopHold]);
  useEffect(() => stopHold, [stopHold]);
  const press = useCallback(() => {
    if (held.current) {
      held.current = false;
      return;
    }
    onPress?.();
  }, [onPress]);

  return (
    <button
      type="button"
      onClick={press}
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onBlur={stopHold}
      onContextMenu={onHold ? (event) => event.preventDefault() : undefined}
      aria-label={ariaLabel || label}
      aria-pressed={pressed || undefined}
      className={cn(
        tone.className,
        "flex h-full w-full select-none flex-col items-center justify-center gap-[1px] rounded-[7px] leading-none transition-transform active:translate-y-[1px]",
        className,
      )}
      style={{ ...(tone.style || {}), color: tone.ink }}
    >
      {Glyph ? <Glyph className="h-[12px] w-[12px]" strokeWidth={2.2} /> : null}
      {label ? <span className="text-[11px] font-bold tracking-[0.02em]">{label}</span> : null}
      {sub ? (
        <span className="text-[4.5px] font-bold uppercase tracking-[0.14em]" style={{ color: tone.sub }}>
          {sub}
        </span>
      ) : null}
    </button>
  );
}
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

// Degrees of travel per detent. One detent = one menu row or one scroll notch.
const STEP_DEGREES = 20;

// A tap on the ring is a press of whichever zone the finger landed in; anything
// that travels further than this is a rotation, not a press.
const TAP_TRAVEL = 10;
const TAP_MS = 380;

// The centre: a press that wanders further than this is a drag, not a press —
// it is dropped outright, so scrolling never selects. Held for the longer of the
// two it is Home, and the release after that hold never also selects.
const DRAG_OFF = 14;
const HOLD_MS = 720;

const geo = (element, clientX, clientY) => {
  const rect = element.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  return {
    deg: (Math.atan2(dx, -dy) * 180) / Math.PI,
    x: clientX - rect.left,
    y: clientY - rect.top,
    rect,
  };
};

const shortestDelta = (from, to) => {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
};

// Zero degrees is the top of the ring, and the four zones meet at the diagonals.
const zoneAt = (deg) => {
  const a = Math.abs(deg);
  if (a <= 45) return "menu";
  if (a >= 135) return "play";
  return deg > 0 ? "next" : "prev";
};

const ink = (active) => (active ? "var(--hh-metal)" : "var(--hh-key-ink-soft)");

// The click wheel, as the hardware really is: a machined ivory ring with four
// actions printed on it — MENU, back, forward, play — a pressable centre, and
// rotation for scrolling. Glass over the whole ring: the notches turn under the
// finger, the reflection rides with it, and the centre is a lens with a hold ring
// that fills while it is held down.
//
// The grammar is the one the wheel always taught: rotate to move, the centre selects
// what the ring landed on, MENU goes up a level, and the bottom key plays. Holding
// the centre takes you home.
export default function ClickWheel({
  size = 104,
  playing,
  onRotate,
  onMenu,
  onPrev,
  onNext,
  onPlay,
  onSelect,
  onHome,
}) {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const glintRef = useRef(null);
  const ticksRef = useRef(null);
  const turn = useRef(0);
  const drag = useRef({ active: false, last: 0, travel: 0, moved: 0, started: 0 });
  const press = useRef({ id: null, x: 0, y: 0, timer: 0, held: false, cancelled: false, captured: false });
  const [zone, setZone] = useState(null);
  const [holding, setHolding] = useState(false);

  const centre = Math.round(size * 0.46);
  const glintSize = Math.round(size * 0.36);
  const holdRadius = (centre - 3) / 2;
  const holdLength = 2 * Math.PI * holdRadius;

  useEffect(() => () => clearTimeout(press.current.timer), []);

  // --- the centre ---------------------------------------------------------
  // One press, one outcome. The pointer is captured so the button keeps the
  // gesture to itself: nothing that happens outside it can fire it twice, and a
  // cancelled pointer — the browser taking the gesture for a scroll — fires
  // nothing at all.
  const settlePress = (commit) => {
    const state = press.current;
    const live = state.id !== null;
    const held = state.held;
    const cancelled = state.cancelled;
    clearTimeout(state.timer);
    press.current = { id: null, x: 0, y: 0, timer: 0, held: false, cancelled: false, captured: false };
    setHolding(false);
    if (live && commit && !held && !cancelled) onSelect?.();
  };

  const beginCentre = (event) => {
    // A press that never got its release — the gesture was swallowed — is dropped
    // rather than left holding the button down.
    if (press.current.id !== null) settlePress(false);
    let captured = false;
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
      captured = true;
    } catch {
      // No capture: a leaving pointer below stands in for the lost gesture.
      captured = false;
    }
    const state = { id: event.pointerId, x: event.clientX, y: event.clientY, held: false, cancelled: false, captured, timer: 0 };
    state.timer = setTimeout(() => {
      state.held = true;
      setHolding(false);
      onHome?.();
    }, HOLD_MS);
    press.current = state;
    setHolding(true);
  };

  const trackCentre = (event) => {
    const state = press.current;
    if (state.id !== event.pointerId || state.cancelled) return;
    if (Math.hypot(event.clientX - state.x, event.clientY - state.y) <= DRAG_OFF) return;
    state.cancelled = true;
    clearTimeout(state.timer);
    setHolding(false);
  };

  // --- the ring -----------------------------------------------------------
  // The finger marker and the reflection are written straight to the DOM — a drag
  // must never cost a render.
  const moveDot = (x, y) => {
    const dot = dotRef.current;
    if (!dot) return;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  };
  const showDot = (on) => {
    if (dotRef.current) dotRef.current.style.opacity = on ? "1" : "0";
  };
  const moveGlint = (x, y, rect) => {
    const glint = glintRef.current;
    if (!glint) return;
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    const reach = Math.hypot(dx, dy) || 1;
    const radius = rect.width * 0.31;
    glint.style.transform = `translate(-50%, -50%) translate(${(dx / reach) * radius}px, ${(dy / reach) * radius}px)`;
  };
  const showGlint = (on) => {
    if (glintRef.current) glintRef.current.style.opacity = on ? "1" : "0";
  };
  const turnTo = (degrees) => {
    if (ticksRef.current) ticksRef.current.style.transform = `rotate(${degrees}deg)`;
  };

  const fire = (zoneName) => {
    setZone(zoneName);
    setTimeout(() => setZone((current) => (current === zoneName ? null : current)), 180);
    if (zoneName === "menu") onMenu?.();
    else if (zoneName === "prev") onPrev?.();
    else if (zoneName === "next") onNext?.();
    else onPlay?.();
  };

  const endDrag = (event) => {
    const ring = ringRef.current;
    drag.current.active = false;
    showDot(false);
    showGlint(false);
    if (ring && event?.pointerId != null) ring.releasePointerCapture?.(event.pointerId);

    // A quick press that barely travelled is a button, not a turn.
    if (ring && event?.type === "pointerup" && drag.current.moved < TAP_TRAVEL && Date.now() - drag.current.started < TAP_MS) {
      const { deg } = geo(ring, event.clientX ?? 0, event.clientY ?? 0);
      if (Number.isFinite(deg)) fire(zoneAt(deg));
    }
  };

  const handlePointerDown = (event) => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.setPointerCapture?.(event.pointerId);
    const spot = geo(ring, event.clientX, event.clientY);
    drag.current = { active: true, last: spot.deg, travel: 0, moved: 0, started: Date.now() };
    moveDot(spot.x, spot.y);
    moveGlint(spot.x, spot.y, spot.rect);
    showDot(true);
    showGlint(true);
  };

  const handlePointerMove = (event) => {
    const ring = ringRef.current;
    if (!ring || !drag.current.active) return;

    const spot = geo(ring, event.clientX, event.clientY);
    moveDot(spot.x, spot.y);
    moveGlint(spot.x, spot.y, spot.rect);

    const delta = shortestDelta(drag.current.last, spot.deg);
    if (Math.abs(delta) < 0.5) return;

    drag.current.last = spot.deg;
    drag.current.travel += delta;
    drag.current.moved += Math.abs(delta);

    if (Math.abs(drag.current.travel) >= STEP_DEGREES) {
      const direction = drag.current.travel > 0 ? 1 : -1;
      drag.current.travel -= direction * STEP_DEGREES;
      // The ring turns where the finger turned it, so the scrub reads as hardware
      // rather than as a gesture. A turn is silent: the wheel clicks under the
      // finger and the screen names where it landed.
      turn.current += direction * STEP_DEGREES;
      turnTo(turn.current);
      onRotate?.(direction);
    }
  };

  const handleKey = (event) => {
    const key = event.key;
    if (key === "ArrowUp") fire("menu");
    else if (key === "ArrowLeft") fire("prev");
    else if (key === "ArrowRight") fire("next");
    else if (key === "ArrowDown") fire("play");
    else if (key === "Enter" || key === " ") onSelect?.();
    else if (key === "Home") onHome?.();
    else return;
    event.preventDefault();
  };

  return (
    <div className="relative shrink-0 touch-none" style={{ width: size, height: size }}>
      <div
        ref={ringRef}
        role="group"
        tabIndex={0}
        aria-label="Click wheel. Turn it to move, the centre selects, MENU goes up a level, the bottom key plays, and the centre held goes home."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKey}
        className="hh-key absolute inset-0 rounded-full outline-none ring-offset-2"
      >
        {/* The notches: they turn with the scrub. */}
        <span ref={ticksRef} aria-hidden="true" className="hh-wheel-tick" />
        {/* The glass over the ring. */}
        <span aria-hidden="true" className="hh-wheel-glass" />
        {/* The reflection, riding under the finger. */}
        <span
          ref={glintRef}
          aria-hidden="true"
          className="hh-wheel-glint"
          style={{ width: glintSize, height: glintSize }}
        />

        <span
          className="absolute left-1/2 top-[7px] -translate-x-1/2 text-[8px] font-extrabold uppercase tracking-[0.16em] transition-transform"
          style={{ color: ink(zone === "menu"), transform: zone === "menu" ? "translateX(-50%) scale(0.9)" : undefined }}
        >
          Menu
        </span>

        <SkipBack
          className="absolute left-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
          style={{ color: ink(zone === "prev"), transform: zone === "prev" ? "translateY(-50%) scale(0.88)" : undefined }}
        />
        <SkipForward
          className="absolute right-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
          style={{ color: ink(zone === "next"), transform: zone === "next" ? "translateY(-50%) scale(0.88)" : undefined }}
        />

        <span
          className="absolute bottom-[7px] left-1/2 flex -translate-x-1/2 items-center transition-transform"
          style={{ color: ink(zone === "play"), transform: zone === "play" ? "translateX(-50%) scale(0.9)" : undefined }}
        >
          {playing ? <Pause className="h-[12px] w-[12px]" /> : <Play className="h-[13px] w-[13px]" />}
        </span>

        {/* The finger, while the ring is being turned */}
        <span
          ref={dotRef}
          className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150"
          style={{
            background: "var(--hh-metal)",
            boxShadow: "0 0 6px rgb(var(--hh-metal-rgb) / 0.8)",
          }}
        />
      </div>

      {/* Centre button — a lens, with the hold ring filling inside it. It selects
          what the ring is standing on, exactly as A does; held, it takes you home. */}
      <button
        type="button"
        onPointerDown={beginCentre}
        onPointerMove={trackCentre}
        onPointerUp={() => settlePress(true)}
        onPointerCancel={() => settlePress(false)}
        onLostPointerCapture={() => settlePress(false)}
        onPointerLeave={() => {
          if (!press.current.captured) settlePress(false);
        }}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          onSelect?.();
        }}
        aria-label="Select. Hold to go home"
        className="hh-key-center absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full transition-transform duration-150 active:scale-[0.94]"
        style={{ width: centre, height: centre }}
      >
        <span aria-hidden="true" className="hh-lens" />

        {holding && (
          <svg className="hh-hold-ring" viewBox={`0 0 ${centre} ${centre}`} aria-hidden="true">
            <circle
              cx={centre / 2}
              cy={centre / 2}
              r={holdRadius}
              fill="none"
              stroke="var(--hh-metal)"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="hh-hold-sweep"
              style={{
                strokeDasharray: holdLength,
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                "--hh-hold-len": `${holdLength}px`,
                "--hh-hold-ms": `${HOLD_MS}ms`,
              }}
            />
          </svg>
        )}

        <span
          className="relative text-[7.5px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: "var(--hh-key-ink)" }}
        >
          Select
        </span>
      </button>
    </div>
  );
}
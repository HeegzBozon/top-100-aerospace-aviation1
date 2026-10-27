import { useEffect, useRef, useState } from "react";
import { Share, SkipBack, SkipForward } from "lucide-react";

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

const print = (active) => (active ? "var(--hh-metal)" : "var(--hh-key-ink-soft)");

// The click wheel, as the hardware really is: one flat ivory ring of plastic with
// four actions printed on it — MENU, back, forward, share — and a metal button at
// its centre. Rotation scrubs; the centre presses.
//
// The grammar is the one the wheel always taught: rotate to move, the centre selects
// what the ring landed on, MENU goes up a level, and the bottom key sends the page out
// through the device's share drawer — the press the keypad's Y makes, on the key the
// thumb already rests on. Holding the centre takes you home.
export default function ClickWheel({
  size = 104,
  onRotate,
  onMenu,
  onPrev,
  onNext,
  // The bottom print: the share, on this console's wheel, everywhere it is used.
  onPlay,
  onSelect,
  onHome,
  // Steering: a surface that is driven by the ring itself — the field game — keeps
  // the same hardware but hands the wheel a different grammar. Its own four prints
  // go on the ring, the zone under the thumb is reported as held until the thumb
  // comes off, and a rotation is left alone (there is nothing to walk a list with
  // while the wheel is being used as a joystick).
  steer = false,
  onSteer,
  prints,
}) {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const drag = useRef({ active: false, last: 0, travel: 0, moved: 0, started: 0 });
  const press = useRef({ id: null, x: 0, y: 0, timer: 0, held: false, cancelled: false, captured: false });
  const steerRef = useRef(null);
  const stepTimer = useRef(0);
  const steerDown = useRef(onSteer);
  steerDown.current = onSteer;
  const [zone, setZone] = useState(null);
  const [holding, setHolding] = useState(false);

  const centre = Math.round(size * 0.46);
  const holdRadius = (centre - 3) / 2;
  const holdLength = 2 * Math.PI * holdRadius;

  useEffect(() => () => clearTimeout(press.current.timer), []);

  // Steering stops when the wheel goes away: a zone still held as the console
  // unmounts must not leave the field walking on its own.
  useEffect(
    () => () => {
      clearTimeout(stepTimer.current);
      if (steerRef.current) {
        steerDown.current?.(steerRef.current, false);
        steerRef.current = null;
      }
    },
    [],
  );

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
  // The finger marker is written straight to the DOM: a drag must never cost a
  // render.
  const moveDot = (x, y) => {
    const dot = dotRef.current;
    if (!dot) return;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
  };
  const showDot = (on) => {
    if (dotRef.current) dotRef.current.style.opacity = on ? "1" : "0";
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
    if (ring && event?.pointerId != null) ring.releasePointerCapture?.(event.pointerId);

    // Steering: the thumb coming off the ring is the walk stopping. A tap is not
    // also a press — on the field the hold is the whole gesture.
    if (steerRef.current) {
      const held = steerRef.current;
      const tapped =
        event?.type === "pointerup" && drag.current.moved < TAP_TRAVEL && Date.now() - drag.current.started < TAP_MS;
      steerRef.current = null;
      if (!tapped) {
        setZone(null);
        onSteer?.(held, false);
        return;
      }
      // A tap is a step, not nothing: the zone is held on for the length of one
      // stride after the thumb has gone, so a quick press walks a pace or two.
      clearTimeout(stepTimer.current);
      stepTimer.current = setTimeout(() => {
        setZone(null);
        onSteer?.(held, false);
      }, 150);
      return;
    }

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
    clearTimeout(stepTimer.current);
    const spot = geo(ring, event.clientX, event.clientY);
    drag.current = { active: true, last: spot.deg, travel: 0, moved: 0, started: Date.now() };
    moveDot(spot.x, spot.y);
    showDot(true);

    if (steer) {
      // A hold the last tap left running — its release is cleared just above — is
      // let go of first, so a second press never walks two ways at once.
      if (steerRef.current) onSteer?.(steerRef.current, false);
      const here = zoneAt(spot.deg);
      steerRef.current = here;
      setZone(here);
      onSteer?.(here, true);
    }
  };

  const handlePointerMove = (event) => {
    const ring = ringRef.current;
    if (!ring || !drag.current.active) return;

    const spot = geo(ring, event.clientX, event.clientY);
    moveDot(spot.x, spot.y);

    // Steering: where the thumb is standing on the ring is the way you walk, and
    // sliding it round turns the walk. No detent fires — the ring steers.
    if (steer) {
      drag.current.last = spot.deg;
      const here = zoneAt(spot.deg);
      if (here === steerRef.current) return;
      if (steerRef.current) onSteer?.(steerRef.current, false);
      steerRef.current = here;
      setZone(here);
      onSteer?.(here, true);
      return;
    }

    const delta = shortestDelta(drag.current.last, spot.deg);
    if (Math.abs(delta) < 0.5) return;

    drag.current.last = spot.deg;
    drag.current.travel += delta;
    drag.current.moved += Math.abs(delta);

    if (Math.abs(drag.current.travel) >= STEP_DEGREES) {
      const direction = drag.current.travel > 0 ? 1 : -1;
      drag.current.travel -= direction * STEP_DEGREES;
      // A turn is silent: the wheel clicks under the finger and the screen names
      // where it landed.
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
        aria-label={
          steer
            ? "Click wheel, steering. Hold a zone on the ring to walk that way, slide the thumb to turn, the centre acts, and the centre held goes home."
            : "Click wheel. Turn it to move, the centre selects, MENU goes up a level, the bottom key shares, and the centre held goes home."
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKey}
        className="hh-key hh-wheel absolute inset-0 rounded-full outline-none ring-offset-2"
      >
        {prints ? (
          /* A surface that steers with the ring puts its own four prints on it: the
             same flat plastic, printed with the directions instead of the keys. */
          <>
            <span
              className="absolute left-1/2 top-[7px] -translate-x-1/2 text-[14px] font-bold leading-none transition-transform"
              style={{ color: print(zone === "menu"), transform: zone === "menu" ? "translateX(-50%) scale(0.86)" : undefined }}
            >
              {prints.up}
            </span>
            <span
              className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[14px] font-bold leading-none transition-transform"
              style={{ color: print(zone === "prev"), transform: zone === "prev" ? "translateY(-50%) scale(0.86)" : undefined }}
            >
              {prints.left}
            </span>
            <span
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[14px] font-bold leading-none transition-transform"
              style={{ color: print(zone === "next"), transform: zone === "next" ? "translateY(-50%) scale(0.86)" : undefined }}
            >
              {prints.right}
            </span>
            <span
              className="absolute bottom-[7px] left-1/2 -translate-x-1/2 text-[14px] font-bold leading-none transition-transform"
              style={{ color: print(zone === "play"), transform: zone === "play" ? "translateX(-50%) scale(0.86)" : undefined }}
            >
              {prints.down}
            </span>
          </>
        ) : (
          <>
            <span
              className="absolute left-1/2 top-[7px] -translate-x-1/2 text-[8px] font-extrabold uppercase tracking-[0.16em] transition-transform"
              style={{ color: print(zone === "menu"), transform: zone === "menu" ? "translateX(-50%) scale(0.9)" : undefined }}
            >
              Menu
            </span>

            <SkipBack
              className="absolute left-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
              style={{ color: print(zone === "prev"), transform: zone === "prev" ? "translateY(-50%) scale(0.88)" : undefined }}
            />
            <SkipForward
              className="absolute right-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
              style={{ color: print(zone === "next"), transform: zone === "next" ? "translateY(-50%) scale(0.88)" : undefined }}
            />

            <span
              className="absolute bottom-[7px] left-1/2 flex -translate-x-1/2 items-center transition-transform"
              style={{ color: print(zone === "play"), transform: zone === "play" ? "translateX(-50%) scale(0.9)" : undefined }}
            >
              <Share className="h-[12px] w-[12px]" strokeWidth={2.4} />
            </span>
          </>
        )}

        {/* The finger, while the ring is being turned */}
        <span
          ref={dotRef}
          className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150"
          style={{
            background: "var(--hh-metal)",
            boxShadow: "0 0 0 1px rgba(3,6,13,0.35)",
          }}
        />
      </div>

      {/* Centre button — the metal button in the middle of the wheel. It selects
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
        className="hh-key-center absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full transition-transform duration-150 active:scale-[0.95]"
        style={{ width: centre, height: centre }}
      >
        {holding && (
          <svg className="hh-hold-ring" viewBox={`0 0 ${centre} ${centre}`} aria-hidden="true">
            <circle
              cx={centre / 2}
              cy={centre / 2}
              r={holdRadius}
              fill="none"
              stroke="var(--hh-ink)"
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
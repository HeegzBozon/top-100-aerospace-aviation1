import { useRef, useState } from "react";
import { Home, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { blip } from "./handheldSound";

// Degrees of travel per detent. One detent = one menu row or one scroll notch.
const STEP_DEGREES = 20;

// A tap on the ring is a press of whichever zone the finger landed in; anything
// that travels further than this is a rotation, not a press.
const TAP_TRAVEL = 10;
const TAP_MS = 380;

const geo = (element, clientX, clientY) => {
  const rect = element.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  return {
    deg: (Math.atan2(dx, -dy) * 180) / Math.PI,
    x: clientX - rect.left,
    y: clientY - rect.top,
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

const ink = (active) => (active ? "#B87333" : "rgba(30,58,90,0.52)");

// The click wheel, as the hardware really is: a fixed ivory ring with four
// actions printed on it — MENU, back, forward, play — a pressable centre, and
// rotation for scrolling. Nothing decorative sits on the surface.
export default function ClickWheel({ size = 132, playing, onRotate, onMenu, onPrev, onNext, onPlay, onHome }) {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const drag = useRef({ active: false, last: 0, travel: 0, moved: 0, started: 0 });
  const [pressed, setPressed] = useState(null);

  // The finger marker is written straight to the DOM — a drag must never cost a
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

  const fire = (zone) => {
    setPressed(zone);
    setTimeout(() => setPressed((p) => (p === zone ? null : p)), 180);
    if (zone === "menu") onMenu?.();
    else if (zone === "prev") onPrev?.();
    else if (zone === "next") onNext?.();
    else onPlay?.();
  };

  const endDrag = (event) => {
    const ring = ringRef.current;
    drag.current.active = false;
    showDot(false);
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
    showDot(true);
  };

  const handlePointerMove = (event) => {
    const ring = ringRef.current;
    if (!ring || !drag.current.active) return;

    const spot = geo(ring, event.clientX, event.clientY);
    moveDot(spot.x, spot.y);

    const delta = shortestDelta(drag.current.last, spot.deg);
    if (Math.abs(delta) < 0.5) return;

    drag.current.last = spot.deg;
    drag.current.travel += delta;
    drag.current.moved += Math.abs(delta);

    if (Math.abs(drag.current.travel) >= STEP_DEGREES) {
      const direction = drag.current.travel > 0 ? 1 : -1;
      drag.current.travel -= direction * STEP_DEGREES;
      blip("tick");
      onRotate?.(direction);
    }
  };

  const handleKey = (event) => {
    const key = event.key;
    if (key === "ArrowUp") fire("menu");
    else if (key === "ArrowLeft") fire("prev");
    else if (key === "ArrowRight") fire("next");
    else if (key === "ArrowDown" || key === " ") fire("play");
    else if (key === "Home" || key === "Enter") onHome?.();
    else return;
    event.preventDefault();
  };

  return (
    <div className="relative shrink-0 touch-none" style={{ width: size, height: size }}>
      <div
        ref={ringRef}
        role="group"
        tabIndex={0}
        aria-label="Click wheel. Rotate to scroll, top opens the menu, left and right step sections, bottom plays, centre goes home."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKey}
        className="absolute inset-0 rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#B87333]/70"
        style={{
          background: "linear-gradient(180deg, #FDFCFA 0%, #F5F0E7 55%, #E7DECE 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,1), inset 0 -2px 7px rgba(30,58,90,0.16), 0 5px 12px rgba(7,17,31,0.30)",
        }}
      >
        <span
          className="absolute left-1/2 top-[8px] -translate-x-1/2 text-[8px] font-extrabold uppercase tracking-[0.16em] transition-transform"
          style={{ color: ink(pressed === "menu"), transform: pressed === "menu" ? "translateX(-50%) scale(0.9)" : undefined }}
        >
          Menu
        </span>

        <SkipBack
          className="absolute left-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
          style={{ color: ink(pressed === "prev"), transform: pressed === "prev" ? "translateY(-50%) scale(0.88)" : undefined }}
        />
        <SkipForward
          className="absolute right-[9px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 transition-transform"
          style={{ color: ink(pressed === "next"), transform: pressed === "next" ? "translateY(-50%) scale(0.88)" : undefined }}
        />

        <span
          className="absolute bottom-[8px] left-1/2 flex -translate-x-1/2 items-center transition-transform"
          style={{ color: ink(pressed === "play"), transform: pressed === "play" ? "translateX(-50%) scale(0.9)" : undefined }}
        >
          {playing ? <Pause className="h-[12px] w-[12px]" /> : <Play className="h-[13px] w-[13px]" />}
        </span>

        {/* The finger, while the ring is being turned */}
        <span
          ref={dotRef}
          className="pointer-events-none absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150"
          style={{ background: "#B87333", boxShadow: "0 0 6px rgba(184,115,51,0.8)" }}
        />
      </div>

      {/* Centre button — the same ivory as the wheel, cut by a fine groove. Home. */}
      <button
        type="button"
        onClick={onHome}
        aria-label="Home"
        className="absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform active:scale-95"
        style={{
          background: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #F4EFE6 62%, #E3D9C8 100%)",
          boxShadow:
            "0 0 0 1px rgba(30,58,90,0.13), 0 2px 6px rgba(30,58,90,0.22), inset 0 -2px 4px rgba(30,58,90,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <Home className="h-[15px] w-[15px]" style={{ color: "rgba(184,115,51,0.55)" }} />
      </button>
    </div>
  );
}
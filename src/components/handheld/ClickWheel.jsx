import { useRef, useState } from "react";
import { blip } from "./handheldSound";

// Degrees of travel per detent. One detent = one menu row or one scroll notch.
const STEP_DEGREES = 22;

const angleAt = (element, clientX, clientY) => {
  const rect = element.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const shortestDelta = (from, to) => {
  let delta = to - from;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
};

// The click wheel: a rotary touch ring with a pressable centre, the analog
// instrument in the console's middle. Dragging around the ring spins it in
// detents; the centre confirms. Discreet actions live on the face buttons, so
// the ring itself stays clean.
export default function ClickWheel({ size = 132, onRotate, onSelect }) {
  const ringRef = useRef(null);
  const drag = useRef({ active: false, last: 0, travel: 0, spin: 0 });
  const [spin, setSpin] = useState(0);

  const endDrag = (event) => {
    drag.current.active = false;
    if (event?.pointerId != null) ringRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const handlePointerDown = (event) => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.setPointerCapture?.(event.pointerId);
    drag.current = {
      active: true,
      last: angleAt(ring, event.clientX, event.clientY),
      travel: 0,
      spin: drag.current.spin,
    };
  };

  const handlePointerMove = (event) => {
    const ring = ringRef.current;
    if (!ring || !drag.current.active) return;

    const current = angleAt(ring, event.clientX, event.clientY);
    const delta = shortestDelta(drag.current.last, current);
    if (Math.abs(delta) < 0.5) return;

    drag.current.last = current;
    drag.current.travel += delta;
    drag.current.spin += delta;
    setSpin(drag.current.spin);

    if (Math.abs(drag.current.travel) >= STEP_DEGREES) {
      const direction = drag.current.travel > 0 ? 1 : -1;
      drag.current.travel -= direction * STEP_DEGREES;
      blip("tick");
      onRotate?.(direction);
    }
  };

  return (
    <div className="relative shrink-0 touch-none" style={{ width: size, height: size }}>
      {/* Touch ring */}
      <div
        ref={ringRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(180deg, #FBF9F5 0%, #EFE7DA 52%, #DCD2C0 100%)",
          boxShadow:
            "inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -3px 8px rgba(30,58,90,0.26), 0 6px 14px rgba(7,17,31,0.34)",
        }}
      >
        {/* Engraved detent ring — spins with the finger */}
        <div
          className="absolute inset-[11px] rounded-full"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, rgba(30,58,90,0.20) 0deg 2.5deg, rgba(30,58,90,0) 2.5deg 11deg)",
            transform: `rotate(${spin}deg)`,
            transition: drag.current.active ? "none" : "transform 220ms cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      {/* Centre button */}
      <button
        type="button"
        onClick={onSelect}
        aria-label="Confirm"
        className="absolute left-1/2 top-1/2 flex h-[48px] w-[48px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform active:scale-90"
        style={{
          background: "linear-gradient(180deg, #DCA46A 0%, #B87333 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -2px 5px rgba(90,50,10,0.45), 0 2px 6px rgba(7,17,31,0.35)",
        }}
      >
        <span className="h-[7px] w-[7px] rounded-full bg-[#1E3A5A]/55" />
      </button>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";

const DRAG_STEP = 22; // pixels of travel that make one click of the shaft
const CLICK_TURN = 22; // degrees the cap turns for that click

// A knob on the faceplate. It turns three ways, because a hand may arrive three ways: a
// drag over it, the wheel, or the arrows once it holds focus — and every way steps the
// same click. The cap turns with it and never rewinds, the way a real shaft does not. A
// press is the shaft's own push, and it is never mistaken for the drag that ended on it.
export default function RadioKnob({ label, ariaLabel, size = "sm", value, min = 0, max = 100, onTurn, onPush }) {
  const [angle, setAngle] = useState(0);
  const shaft = useRef(null);
  const drag = useRef(null);
  const skip = useRef(false);
  const turn = useRef(onTurn);
  turn.current = onTurn;

  const click = (direction) => {
    setAngle((current) => current + direction * CLICK_TURN);
    turn.current?.(direction);
  };
  const clickRef = useRef(click);
  clickRef.current = click;

  // The wheel is the one gesture the browser would otherwise spend on the page behind the
  // machine, so it is taken natively and never passively.
  useEffect(() => {
    const node = shaft.current;
    if (!node) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      clickRef.current(event.deltaY > 0 ? 1 : -1);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const down = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { y: event.clientY, travel: 0, moved: false };
  };

  const move = (event) => {
    const held = drag.current;
    if (!held) return;
    held.travel += held.y - event.clientY;
    held.y = event.clientY;
    while (Math.abs(held.travel) >= DRAG_STEP) {
      const direction = held.travel > 0 ? 1 : -1;
      held.travel -= direction * DRAG_STEP;
      held.moved = true;
      clickRef.current(direction);
    }
  };

  const up = () => {
    skip.current = Boolean(drag.current?.moved);
    drag.current = null;
  };

  const press = () => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    onPush?.();
  };

  const keys = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      click(1);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      click(-1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPush?.();
    }
  };

  return (
    <div className="rd-knob-cell" data-size={size}>
      <div
        ref={shaft}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel || label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : undefined}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClick={press}
        onKeyDown={keys}
        className="rd-knob"
        style={{ "--rd-angle": `${angle}deg` }}
      >
        <span className="rd-knob-cap" aria-hidden="true">
          <span className="rd-knob-mark" />
        </span>
      </div>
      <span className="rd-knob-print">{label}</span>
    </div>
  );
}
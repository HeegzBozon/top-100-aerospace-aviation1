import { useEffect, useRef } from 'react';

// Xbox / standard gamepad: left stick or d-pad walks, A opens the door you stand at, B steps back.
export default function useColonyGamepad(stickRef, { enter, back }, active) {
  const actions = useRef({ enter, back });
  actions.current = { enter, back };

  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const prev = {};
    const loop = () => {
      const pad = [...(navigator.getGamepads?.() || [])].find(Boolean);
      if (pad) {
        const b = (i) => !!pad.buttons[i]?.pressed;
        const [x = 0, y = 0] = pad.axes;
        const dirs = { up: b(12) || y < -0.5, down: b(13) || y > 0.5, left: b(14) || x < -0.5, right: b(15) || x > 0.5 };
        Object.entries(dirs).forEach(([d, on]) => {
          if (on !== prev[d]) { stickRef.current[d] = on; prev[d] = on; }
        });
        if (b(0) && !prev.a) actions.current.enter?.();
        if (b(1) && !prev.b) actions.current.back?.();
        prev.a = b(0); prev.b = b(1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ['up', 'down', 'left', 'right'].forEach((d) => { stickRef.current[d] = false; });
    };
  }, [active, stickRef]);
}
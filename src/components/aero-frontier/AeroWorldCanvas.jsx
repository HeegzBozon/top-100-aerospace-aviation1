import { useEffect, useRef } from "react";
import { renderWorld, VIEW } from "./aeroArt";

// The picture in the glass.
//
// One canvas at the field's own resolution — 256 × 192 — scaled up whole by the
// browser with smoothing off, so a tile is a tile and nothing is ever resampled
// into mush. The frame loop is the game: update, draw, ask for the next frame.
// The canvas is measured rather than stretched, so the aspect ratio is never
// argued with, on a phone or on a desk.
export default function AeroWorldCanvas({ world, className = "" }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const boxRef = useRef(null);

  // The loop reads the world through a handle rather than through props: a line
  // of dialogue arriving must never tear the picture down and build it again.
  const liveRef = useRef(world);
  liveRef.current = world;

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const fit = () => {
      const { width, height } = box.getBoundingClientRect();
      if (!width || !height) return;
      const w = Math.min(width, (height * VIEW.w) / VIEW.h);
      canvas.style.width = `${Math.floor(w)}px`;
      canvas.style.height = `${Math.floor((w * VIEW.h) / VIEW.w)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const live = liveRef.current;
      live.update(dt);
      renderWorld(ctx, {
        ...live.state,
        npcs: live.refs.npcs.current,
        player: live.refs.player.current,
        cam: live.refs.cam.current,
        t: live.refs.t.current,
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div ref={boxRef} className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={VIEW.w}
        height={VIEW.h}
        onPointerDown={() => world.act()}
        aria-label="Hollow Field. The field, drawn in eight-bit."
        style={{ imageRendering: "pixelated", touchAction: "none" }}
      />
    </div>
  );
}
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { PEEL_EASING, PEEL_LAYERS, PEEL_MS, peelFrames } from "./pagePeel";

// The page turn. A sheet of paper comes over the picture, then peels back off the
// bottom-right corner and takes itself away, leaving the new surface beneath it.
// Nothing about a page's own layout moves, so the turn costs the app nothing.
export default function PageTurn({ children }) {
  const { pathname } = useLocation();
  const layers = useRef({});
  const shown = useRef(pathname);

  useEffect(() => {
    if (shown.current === pathname) return undefined;
    shown.current = pathname;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const running = PEEL_LAYERS.map((layer) =>
      layers.current[layer]?.animate(peelFrames(layer), {
        duration: PEEL_MS,
        easing: PEEL_EASING,
        fill: "none",
      }),
    ).filter(Boolean);

    return () => running.forEach((animation) => animation.cancel());
  }, [pathname]);

  return (
    <>
      {/* Clipped to the picture window, so the peel happens inside the glass and
          never over the hardware. */}
      <div className="page-turn-clip" aria-hidden="true">
        {PEEL_LAYERS.map((layer) => (
          <div
            key={layer}
            ref={(node) => {
              layers.current[layer] = node;
            }}
            className={`page-${layer}`}
          />
        ))}
      </div>
      {children}
    </>
  );
}
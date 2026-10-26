import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// The page turn. Every surface change plays the same move: a leaf of paper
// sweeps in over the picture, the new surface comes up beneath its shadow, and
// the leaf peels off along its own left edge — the way a magazine is read.
// Nothing about a page's own layout moves, so the effect costs the app nothing.
const TURN = [
  { transform: "translateX(103%) rotate(0.6deg)", opacity: 1, offset: 0 },
  { transform: "translateX(0%) rotate(0deg)", opacity: 1, offset: 0.16 },
  { transform: "translateX(0%) rotate(0deg)", opacity: 1, offset: 0.26 },
  { transform: "rotateY(-46deg) translateX(-3%)", opacity: 1, offset: 0.66 },
  { transform: "rotateY(-97deg) translateX(-18%)", opacity: 0.9, offset: 1 },
];

export default function PageTurn({ children }) {
  const { pathname } = useLocation();
  const leaf = useRef(null);
  const shown = useRef(pathname);

  useEffect(() => {
    if (shown.current === pathname) return undefined;
    shown.current = pathname;

    const node = leaf.current;
    if (!node) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const turn = node.animate(TURN, {
      duration: 820,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "none",
    });
    return () => turn.cancel();
  }, [pathname]);

  return (
    <>
      {/* The leaf is clipped to the picture window, so the turn happens inside
          the glass and never over the hardware. */}
      <div className="page-turn-clip" aria-hidden="true">
        <div ref={leaf} className="page-leaf" />
      </div>
      {children}
    </>
  );
}
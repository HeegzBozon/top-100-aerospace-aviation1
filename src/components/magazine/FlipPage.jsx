import { useEffect, useRef, useState } from 'react';

// One page of the spread.
//
// Every page in an issue is composed at one design size — 400 × 560 — so the typographic
// rhythm of a cover, a portrait and a feature is identical from page to page. A page is
// then scaled to whatever width the spread gives it: on a desk the page grows to the size
// of a printed page and the type grows with it, instead of sitting at phone size in the
// middle of a large screen. Scaling is a transform on live DOM, so type stays vector-sharp.
export const DESIGN_WIDTH = 400;
export const PAGE_RATIO = 560 / DESIGN_WIDTH;

export default function FlipPage({ children }) {
  const frameRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const read = () => setWidth(el.clientWidth);
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scale = width > 0 ? width / DESIGN_WIDTH : 0;

  return (
    <div ref={frameRef} className="relative h-full w-full overflow-hidden">
      {scale > 0 && (
        <div
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_WIDTH * PAGE_RATIO,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
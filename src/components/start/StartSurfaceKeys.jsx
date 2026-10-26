import { useEffect } from "react";
import StartMenuItem from "./StartMenuItem";
import { START_MENU } from "./startMenuConfig";

// The six surfaces, as keys. Two rows of three, on the phone and on the desk —
// the same panel either way, so the menu is one shape to learn. The rows are
// capped as well as floored on the phone: a key is a key, so the grid keeps its
// own height and the sky below it stays open, instead of the tiles stretching
// down the glass until the labels sit on the control rail. A short glass scrolls
// the grid rather than squashing the rows together.
//
// The wheel walks these keys: the console holds the cursor as a key, and the key
// it is on carries the selection. Anything below the fold is brought up so the
// cursor is never off the screen.
export default function StartSurfaceKeys({ cursorKey }) {
  useEffect(() => {
    if (!cursorKey) return;
    document.querySelector(`[data-hh-key="${cursorKey}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursorKey]);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-8">
      <p className="mb-1.5 shrink-0 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/40">
        Select a surface
      </p>

      <div className="grid grid-cols-3 auto-rows-min grid-rows-[repeat(2,minmax(66px,84px))] gap-2 overflow-y-auto overscroll-contain md:flex-1 md:gap-3 md:grid-rows-[repeat(2,minmax(112px,1fr))]">
        {START_MENU.map((item) => (
          <StartMenuItem key={item.label} item={item} selected={item.key === cursorKey} />
        ))}
      </div>
    </div>
  );
}
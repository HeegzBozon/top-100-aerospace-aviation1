import { useEffect } from "react";
import StartMenuItem from "./StartMenuItem";

// The surfaces, as keys. Three to a row, on the phone and on the desk — the same
// panel either way, so the menu is one shape to learn. A key is a key: on the phone
// the rows are floored at a readable height and then share out whatever the glass has
// left, so the keypad runs to the foot of the picture and stands on the instrument
// band with nothing pooled between them. A glass too short for its rows scrolls the
// grid rather than squashing them together.
//
// The wheel walks these keys: the console holds the cursor as a key, and the key
// it is on carries the selection. Anything below the fold is brought up so the
// cursor is never off the screen.
export default function StartSurfaceKeys({ items, cursorKey }) {
  useEffect(() => {
    if (!cursorKey) return;
    document.querySelector(`[data-hh-key="${cursorKey}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursorKey]);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-8">
      <div className="grid min-h-0 flex-1 grid-cols-3 auto-rows-[minmax(66px,1fr)] gap-2 overflow-y-auto overscroll-contain md:auto-rows-[minmax(104px,auto)] md:gap-3">
        {items.map((item) => (
          <StartMenuItem key={item.label} item={item} selected={item.key === cursorKey} />
        ))}
      </div>
    </div>
  );
}
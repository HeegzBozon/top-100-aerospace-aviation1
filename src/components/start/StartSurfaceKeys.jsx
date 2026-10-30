import { useEffect } from "react";
import StartMenuItem from "./StartMenuItem";
import revealCursor from "@/components/handheld/revealCursor";

// The surfaces, as keys. Three to a row, on the phone and on the desk — the same
// panel either way, so the menu is one shape to learn. A key is a key: on the phone
// the rows are floored at a readable height and then share out whatever the glass has
// left, so the keypad runs to the foot of the picture and stands on the instrument
// band with nothing pooled between them.
//
// `flow` is for a title surface that scrolls as a page rather than clipping to one
// glass: the grid then takes the height its own rows need and the picture scrolls it,
// so nothing is ever locked into a strip at the foot of the screen. Without it the grid
// fills what the glass has left and scrolls inside itself, which is right for a surface
// that is held to exactly one screen.
//
// The wheel walks these keys: the console holds the cursor as a key, and the key
// it is on carries the selection. Anything below the fold is brought up so the
// cursor is never off the screen.
export default function StartSurfaceKeys({ items, cursorKey, flow = false }) {
  useEffect(() => {
    revealCursor(cursorKey);
  }, [cursorKey]);

  return (
    <div
      className={
        flow
          ? "mt-4 flex flex-col md:mt-8"
          : "mt-4 flex min-h-0 flex-1 flex-col md:mt-8"
      }
    >
      <div
        className={
          flow
            ? "grid grid-cols-3 auto-rows-[minmax(66px,auto)] gap-2 md:auto-rows-[minmax(104px,auto)] md:gap-3"
            : "grid min-h-0 flex-1 grid-cols-3 auto-rows-[minmax(66px,1fr)] gap-2 overflow-y-auto overscroll-contain md:auto-rows-[minmax(104px,auto)] md:gap-3"
        }
      >
        {items.map((item) => (
          <StartMenuItem key={item.label} item={item} selected={item.key === cursorKey} />
        ))}
      </div>
    </div>
  );
}
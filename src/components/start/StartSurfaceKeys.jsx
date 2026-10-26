import StartMenuItem from "./StartMenuItem";
import { START_MENU } from "./startMenuConfig";

// The six surfaces, as keys. Two rows of three, on the phone and on the desk —
// the same panel either way, so the menu is one shape to learn. The rows are
// floored at a key's own height, so a short glass scrolls the grid instead of
// squashing the rows until the tiles overlap each other.
export default function StartSurfaceKeys() {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-8">
      <p className="mb-1.5 shrink-0 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/40">
        Select a surface
      </p>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 grid-rows-[repeat(2,minmax(66px,1fr))] gap-2 overflow-y-auto overscroll-contain md:gap-3 md:grid-rows-[repeat(2,minmax(112px,1fr))]">
        {START_MENU.map((item) => (
          <StartMenuItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
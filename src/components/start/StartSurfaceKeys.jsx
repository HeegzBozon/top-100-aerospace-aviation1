import StartMenuItem from "./StartMenuItem";
import { START_MENU } from "./startMenuConfig";

// The six surfaces, as keys. Two across and three down on a phone, three across
// and two down on a desk — and the rows are floored at a key's own height, so a
// short glass scrolls the grid instead of squashing the rows until the tiles
// overlap each other.
export default function StartSurfaceKeys() {
  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col md:mt-8">
      <p className="mb-1.5 shrink-0 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/40">
        Select a surface
      </p>

      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 grid-rows-[repeat(3,minmax(80px,1fr))] gap-2 overflow-y-auto overscroll-contain md:grid-cols-3 md:grid-rows-none">
        {START_MENU.map((item) => (
          <StartMenuItem key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}
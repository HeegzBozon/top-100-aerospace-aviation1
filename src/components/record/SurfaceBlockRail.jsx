// The rail across the head of a long surface: one key per block, the block you are
// standing on struck in copper. It holds its place at the top of the scroll while the
// block under it rolls, so the other half of the page is always one press away.
export default function SurfaceBlockRail({ surface, blocks, active, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label={`${surface.label} blocks`}
      className="scrollbar-hide sticky top-0 z-20 -mx-1 mt-6 flex gap-1 overflow-x-auto border-b border-editorial-navy/15 bg-editorial-cream/95 px-1 backdrop-blur-sm"
    >
      {blocks.map((block) => {
        const selected = block.key === active;
        return (
          <button
            key={block.key}
            type="button"
            role="tab"
            id={`record-tab-${surface.key}-${block.key}`}
            aria-selected={selected}
            onClick={() => onSelect(block.key)}
            className={`-mb-px flex shrink-0 items-baseline gap-1.5 border-b-2 px-3 py-2.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper ${
              selected
                ? 'border-editorial-copper text-editorial-navy'
                : 'border-transparent text-editorial-navy/50 hover:text-editorial-navy'
            }`}
          >
            {block.label}
            {block.key === 'lines' && (
              <span className="tabular-nums text-editorial-navy/45">
                {surface.done}/{surface.total}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
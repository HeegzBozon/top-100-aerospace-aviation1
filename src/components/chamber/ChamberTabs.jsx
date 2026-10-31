// The Chamber's directory, cut into leaves: the desks a member's own work is done at,
// and the house itself — the offices the institution does business from. Tabs rather
// than one long sheet, because the directory is the only thing on the page that runs
// past the glass, and the counters standing above it should never scroll away to reach
// an office. Each tab carries the count of what stands behind it, so the width of an
// office is legible before it is opened.
export default function ChamberTabs({ tabs = [], activeKey, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="Chamber directory"
      className="flex items-stretch border-b border-editorial-cream/[0.12]"
    >
      {tabs.map((tab) => {
        const on = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(tab.key)}
            className={`relative -mb-px flex flex-1 items-center justify-center gap-2 px-2 pb-2 pt-1 text-[8px] font-bold uppercase tracking-[0.26em] transition-colors duration-150 md:pb-2.5 md:text-[9.5px] ${
              on
                ? "text-editorial-gold"
                : "text-editorial-cream/45 hover:text-editorial-cream/75"
            }`}
            style={
              on
                ? { boxShadow: "inset 0 -2px 0 rgb(var(--editorial-gold-rgb) / 0.9)" }
                : undefined
            }
          >
            <span>{tab.label}</span>
            <span
              className={`font-heading text-[9px] tabular-nums leading-none md:text-[11px] ${
                on ? "text-editorial-gold/80" : "text-editorial-cream/35"
              }`}
            >
              {tab.items.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}
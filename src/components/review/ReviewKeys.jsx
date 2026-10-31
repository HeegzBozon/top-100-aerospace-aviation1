import { Link } from "react-router-dom";

// The three tabs, as keys on one strip — the shape the ring is best at. Left and right
// (or a turn of the wheel) move the selection along the strip, the tab under the
// selection is lit, and the hash opens it. Two or three of them, always in a row: a tab
// bar the hand can walk without reading.
export default function ReviewKeys({ tabs, cursorKey }) {
  return (
    <div
      role="tablist"
      aria-label="Review"
      className="grid grid-cols-3 gap-2 md:gap-3"
    >
      {tabs.map((tab) => {
        const selected = tab.key === cursorKey;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            role="tab"
            aria-selected={selected}
            data-hh-key={tab.key}
            className={`group relative flex min-h-[74px] flex-col justify-between overflow-hidden rounded-[11px] border p-2.5 transition-[transform,background-color,border-color] duration-200 active:scale-[0.985] md:min-h-[118px] md:rounded-[13px] md:p-3.5 ${
              selected
                ? "scale-[1.015] border-editorial-gold/80 bg-editorial-cream/[0.13]"
                : "border-editorial-cream/[0.14] bg-editorial-cream/[0.055] hover:border-editorial-gold/45 hover:bg-editorial-cream/[0.10]"
            }`}
            style={
              selected
                ? { boxShadow: "inset 0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.55), 0 8px 22px rgba(3,6,13,0.34)" }
                : undefined
            }
          >
            <span
              className="pointer-events-none absolute -right-6 -top-6 h-12 w-12 rounded-full opacity-70 md:-right-7 md:-top-7 md:h-16 md:w-16"
              style={{ background: "radial-gradient(circle, rgb(var(--editorial-gold-rgb) / 0.16), transparent 70%)" }}
            />
            <span className="relative flex items-start justify-between gap-2">
              <Icon className="h-[15px] w-[15px] shrink-0 text-editorial-gold md:h-[19px] md:w-[19px]" />
              <span className={`font-heading text-[9px] leading-none md:text-[11px] ${selected ? "text-editorial-gold" : "text-editorial-cream/65"}`}>
                {tab.index}
              </span>
            </span>
            <span className="relative block font-heading text-[11px] font-semibold leading-[1.12] text-editorial-cream md:text-[14.5px]">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
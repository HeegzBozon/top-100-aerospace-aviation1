import { Link } from "react-router-dom";

// The two counters, as keys on one strip — the shape the ring is best at. Left and right
// (or a turn of the wheel) move the selection along the strip, the counter under the
// selection is lit, and the hash opens it.
export default function ChamberKeys({ programs, cursorKey }) {
  return (
    <div role="tablist" aria-label="Chamber of Commerce" className="grid grid-cols-2 gap-2.5 md:gap-4">
      {programs.map((program) => {
        const selected = program.key === cursorKey;
        const Icon = program.icon;
        return (
          <Link
            key={program.key}
            to={program.to}
            role="tab"
            aria-selected={selected}
            data-hh-key={program.key}
            className={`group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-[11px] border p-3 transition-[transform,background-color,border-color] duration-200 active:scale-[0.985] md:min-h-[150px] md:rounded-[13px] md:p-4 ${
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
              className="pointer-events-none absolute -right-6 -top-6 h-12 w-12 rounded-full opacity-70 md:-right-8 md:-top-8 md:h-20 md:w-20"
              style={{ background: "radial-gradient(circle, rgb(var(--editorial-gold-rgb) / 0.16), transparent 70%)" }}
            />
            <span className="relative flex items-start justify-between gap-2">
              <Icon className="h-[16px] w-[16px] shrink-0 text-editorial-gold md:h-[20px] md:w-[20px]" />
              <span
                className={`font-heading text-[9px] leading-none md:text-[11px] ${
                  selected ? "text-editorial-gold" : "text-editorial-cream/65"
                }`}
              >
                {program.index}
              </span>
            </span>
            <span className="relative block font-heading text-[13px] font-semibold leading-[1.12] text-editorial-cream md:text-[17px]">
              {program.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
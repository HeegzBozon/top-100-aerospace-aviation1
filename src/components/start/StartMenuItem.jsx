import { Link } from "react-router-dom";

// One key of the title screen. A key, not a card: the surface's mark, its place
// in the menu, and its name, inside a moulded rectangle that lifts under the
// finger. No subheadings — six of these have to read at a glance on a phone, and
// data-hh-module is what lets the console's ring walk them and announce each one.
export default function StartMenuItem({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      data-hh-module={item.label}
      className="group relative flex min-h-[80px] flex-col justify-between overflow-hidden rounded-[13px] border border-editorial-cream/[0.14] bg-editorial-cream/[0.055] p-3 transition-[transform,background-color,border-color] duration-200 hover:border-editorial-gold/45 hover:bg-editorial-cream/[0.10] active:scale-[0.985] focus-visible:border-editorial-gold/70 focus-visible:bg-editorial-cream/[0.10] focus-visible:outline-none md:min-h-[112px] md:p-3.5"
    >
      {/* the surface's own light, pooled in the corner */}
      <span
        className="pointer-events-none absolute -right-7 -top-7 h-16 w-16 rounded-full opacity-70 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "radial-gradient(circle, rgb(var(--editorial-gold-rgb) / 0.16), transparent 70%)" }}
      />

      <span className="relative flex items-start justify-between gap-2">
        <Icon className="h-[17px] w-[17px] shrink-0 text-editorial-gold md:h-[19px] md:w-[19px]" />
        <span className="font-heading text-[10px] leading-none text-editorial-cream/35 md:text-[11px]">
          {item.index}
        </span>
      </span>

      <span className="relative font-heading text-[13px] font-semibold leading-[1.12] tracking-[0.01em] text-editorial-cream md:text-[14.5px]">
        {item.label}
      </span>
    </Link>
  );
}
import { Link } from "react-router-dom";

// One key of the start screen's grid: rounded, label only, no subheading. Each
// tile is a module to the console, so the ring walks the grid and announces the
// label as it lands.
export default function StartMenuItem({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      data-hh-module={item.label}
      className="group flex min-h-[78px] flex-col justify-between rounded-xl border border-editorial-cream/15 bg-editorial-cream/[0.05] p-2 transition-colors hover:border-editorial-gold/45 hover:bg-editorial-cream/[0.11] focus-visible:border-editorial-gold/60 focus-visible:bg-editorial-cream/[0.11] focus-visible:outline-none md:min-h-[112px] md:p-3.5"
    >
      <span className="flex items-center justify-between">
        <Icon className="h-[15px] w-[15px] shrink-0 text-editorial-gold" />
        <span className="text-[8px] font-bold tracking-[0.24em] text-editorial-cream/40">
          {item.index}
        </span>
      </span>
      <span className="mt-2 font-heading text-[11.5px] font-semibold leading-tight tracking-[0.02em] text-editorial-cream md:mt-2.5 md:text-[14.5px]">
        {item.label}
      </span>
    </Link>
  );
}
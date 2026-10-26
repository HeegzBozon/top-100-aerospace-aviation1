import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// One line of the start screen: a rounded key of its own, so the menu reads as
// keys rather than a table. Each row is a module to the console — the ring walks
// them and announces the label, a tap opens the surface. Label only: no
// subheadings, so the whole menu stands inside the glass.
export default function StartMenuItem({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      data-hh-module={item.label}
      className="group mb-1.5 flex items-center gap-2.5 rounded-xl border border-editorial-cream/15 bg-editorial-cream/[0.05] px-3 py-1.5 transition-colors hover:border-editorial-gold/45 hover:bg-editorial-cream/[0.11] focus-visible:border-editorial-gold/60 focus-visible:bg-editorial-cream/[0.11] focus-visible:outline-none md:px-3.5 md:py-2"
    >
      <span className="text-[8.5px] font-bold tracking-[0.24em] text-editorial-cream/40">
        {item.index}
      </span>
      <Icon className="h-[14px] w-[14px] shrink-0 text-editorial-gold" />
      <span className="min-w-0 flex-1 truncate font-heading text-[13px] font-semibold tracking-[0.03em] text-editorial-cream md:text-[15px]">
        {item.label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-editorial-gold transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
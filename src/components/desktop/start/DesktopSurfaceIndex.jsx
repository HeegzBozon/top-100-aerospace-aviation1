import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// The surfaces, read as an index rather than as a keypad: a printed contents page at
// the foot of the cover. Each entry draws its own rule in rose gold as the pointer
// crosses it, and the arrow enters from the corner — the same movement at every entry,
// so the whole page feels ruled by one hand.
export default function DesktopSurfaceIndex({ items }) {
  return (
    <section className="ds-rise mt-11" style={{ animationDelay: "380ms" }} aria-label="Surfaces">
      <div className="flex items-center gap-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.36em] text-editorial-copper">Index</p>
        <span
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.4), transparent)" }}
        />
        <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-editorial-cream/35">
          {items.length} surfaces
        </p>
      </div>

      <div className="mt-1 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.to}
              data-hh-key={item.key}
              className="group relative flex flex-col justify-between gap-7 border-t border-editorial-cream/[0.12] py-5 pr-7 transition-colors duration-300 hover:border-editorial-gold/60 focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-editorial-gold via-editorial-gold/70 to-transparent transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />

              <span className="flex items-center justify-between gap-3">
                <span className="font-heading text-[11px] tracking-[0.14em] text-editorial-gold/70">
                  {item.index}
                </span>
                <Icon className="h-[13px] w-[13px] text-editorial-gold/45 transition-colors duration-300 group-hover:text-editorial-gold" />
              </span>

              <span className="flex items-end justify-between gap-2">
                <span className="font-heading text-[clamp(0.92rem,1.1vw,1.15rem)] leading-[1.15] text-editorial-cream/90 transition-colors duration-300 group-hover:text-editorial-cream">
                  {item.label}
                </span>
                <ArrowUpRight className="mb-[2px] h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-editorial-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
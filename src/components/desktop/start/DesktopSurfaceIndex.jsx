import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// The surfaces, drawn as modules rather than as a contents page.
//
// Each one is a plate seated on the cover: cream stock with a copper hairline round its
// edge, a machined navy well holding the surface's mark, the index stamp cut in copper,
// and the word that says what the plate is for — Open. It lifts under the pointer and its
// edge warms, the way a cartridge comes up out of its slot, so nothing about it reads as
// printed matter. The whole plate is the target, and it is a real link: pressing it, or
// walking the console's ring onto it with the keys, does the same thing.
export default function DesktopSurfaceIndex({ items }) {
  return (
    <section className="ds-rise mt-11" style={{ animationDelay: "380ms" }} aria-label="Surfaces">
      <div className="flex items-center gap-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.36em] text-editorial-gold/85">
          Surfaces
        </p>
        <span
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.4), transparent)" }}
        />
        <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-editorial-cream/35">
          {items.length} installed
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.to}
              data-hh-key={item.key}
              aria-label={`Open ${item.label}`}
              className="ds-module group relative flex min-h-[136px] flex-col justify-between rounded-[14px] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {/* The plate itself: stock, edge and shadow, all behind the content. */}
              <span aria-hidden="true" className="ds-module-face absolute inset-0 rounded-[14px]" />

              <span className="relative flex items-start justify-between">
                <span className="ds-module-well flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px]">
                  <Icon className="h-[17px] w-[17px] text-editorial-gold" strokeWidth={1.7} />
                </span>
                <span className="font-heading text-[10px] leading-none tracking-[0.18em] text-editorial-copper/80">
                  {item.index}
                </span>
              </span>

              <span className="relative mt-4 block">
                <span className="block font-heading text-[clamp(0.95rem,1.05vw,1.12rem)] leading-[1.15] text-editorial-navy">
                  {item.label}
                </span>
                <span className="mt-2 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.24em] text-editorial-copper">
                  Open
                  <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
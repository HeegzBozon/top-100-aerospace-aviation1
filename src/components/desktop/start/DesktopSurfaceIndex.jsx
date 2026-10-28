import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import ShareProgramButton from "@/components/start/ShareProgramButton";

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
    <section className="ds-rise mt-11" style={{ animationDelay: "380ms" }} aria-label="Programs">
      <div className="flex items-center gap-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.36em] text-editorial-gold/85">
          Programs
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
            <div
              key={item.key}
              className="ds-module group relative flex min-h-[136px] flex-col justify-between rounded-[14px] p-4"
            >
              {/* The plate itself: stock, edge and shadow, all behind the content. */}
              <span aria-hidden="true" className="ds-module-face absolute inset-0 rounded-[14px]" />

              {/* The whole plate is the target, so the link lies over it and the one
                  control that must not open the program — the share — sits above both. */}
              <Link
                to={item.to}
                data-hh-key={item.key}
                aria-label={`Open ${item.label}`}
                className="absolute inset-0 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/70"
              />

              <span className="pointer-events-none relative flex items-start justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <span className="ds-module-well flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px]">
                    <Icon className="h-[17px] w-[17px] text-editorial-gold" strokeWidth={1.7} />
                  </span>
                  <span className="font-heading text-[10px] leading-none tracking-[0.18em] text-editorial-copper/80">
                    {item.index}
                  </span>
                </span>
              </span>

              {item.shareUrl && (
                <ShareProgramButton
                  label={item.label}
                  url={item.shareUrl}
                  className="absolute right-3 top-3"
                />
              )}

              <span className="pointer-events-none relative mt-4 block">
                <span className="block font-heading text-[clamp(0.95rem,1.05vw,1.12rem)] leading-[1.15] text-editorial-navy">
                  {item.label}
                </span>
                <span className="mt-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.24em] text-editorial-copper">
                    {item.cta || "Open"}
                    <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  {item.progress && (
                    /* How the issue was gone through, read out beside how far: Read or
                       Skimmed once it is finished, and the reader's place while it is not. */
                    <span className="text-[8px] font-bold uppercase tabular-nums tracking-[0.14em] text-editorial-copper/75">
                      {item.status?.finished ? `${item.status.label} · ` : ''}
                      {item.progress.percent}%
                    </span>
                  )}
                </span>
                {/* The reader's own place in the program, where the program keeps one */}
                {item.progress && (
                  <span
                    aria-hidden="true"
                    className="mt-2 block h-[2px] w-full overflow-hidden rounded-full bg-editorial-navy/[0.12]"
                  >
                    <span
                      className="block h-full rounded-full bg-editorial-copper"
                      style={{ width: `${item.progress.percent}%` }}
                    />
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
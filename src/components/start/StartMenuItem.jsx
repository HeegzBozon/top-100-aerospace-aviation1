import { Link } from "react-router-dom";
import ShareProgramButton from "./ShareProgramButton";

// One key of the title screen. A key, not a card: the surface's mark, its place
// in the menu, and its name, inside a moulded rectangle that lifts under the
// finger. No subheadings — a whole menu has to read at a glance on a phone, and
// data-hh-key is what lets the console's ring land on a key the wheel has walked
// to. The one under the cursor is lit, so the menu reads as a menu.
export default function StartMenuItem({ item, selected }) {
  const Icon = item.icon;

  return (
    <div className="relative flex">
      <Link
        to={item.to}
        data-hh-key={item.key}
        aria-current={selected ? "true" : undefined}
        className={`group relative flex h-full w-full min-h-[66px] flex-col justify-between overflow-hidden rounded-[11px] border p-2.5 transition-[transform,background-color,border-color] duration-200 active:scale-[0.985] md:min-h-[112px] md:rounded-[13px] md:p-3.5 ${
          selected
            ? "scale-[1.015] border-editorial-gold/80 bg-editorial-cream/[0.13]"
            : "border-editorial-cream/[0.14] bg-editorial-cream/[0.055] hover:border-editorial-gold/45 hover:bg-editorial-cream/[0.10] focus-visible:border-editorial-gold/70 focus-visible:bg-editorial-cream/[0.10] focus-visible:outline-none"
        }`}
        style={
          selected
            ? {
                boxShadow:
                  "inset 0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.55), 0 8px 22px rgba(3,6,13,0.34)",
              }
            : undefined
        }
      >
        {/* the surface's own light, pooled in the corner */}
        <span
          className="pointer-events-none absolute -right-6 -top-6 h-12 w-12 rounded-full opacity-70 transition-opacity duration-200 group-hover:opacity-100 md:-right-7 md:-top-7 md:h-16 md:w-16"
          style={{ background: "radial-gradient(circle, rgb(var(--editorial-gold-rgb) / 0.16), transparent 70%)" }}
        />

        <span className="relative flex items-start justify-between gap-2">
          <Icon className="h-[15px] w-[15px] shrink-0 text-editorial-gold md:h-[19px] md:w-[19px]" />
          <span
            className={`font-heading text-[9px] leading-none md:text-[11px] ${
              selected ? "text-editorial-gold" : "text-editorial-cream/65"
            }`}
          >
            {item.index}
          </span>
        </span>

        <span className="relative">
          <span className="block font-heading text-[11px] font-semibold leading-[1.12] tracking-[0.01em] text-editorial-cream md:text-[14.5px]">
            {item.label}
          </span>
          {/* A program that holds the reader's place says so on its own key — and how it
              was gone through: Read, or Skimmed, once it is finished. */}
          {item.cta && (
            <span className="mt-1 block pr-5 text-[8px] font-bold uppercase tracking-[0.18em] text-editorial-gold/85">
              {item.cta}
              {item.progress ? ` · ${item.progress.percent}%` : ''}
            </span>
          )}
          {item.status?.finished && (
            <span className="mt-0.5 block pr-5 text-[8px] font-bold uppercase tracking-[0.18em] text-editorial-gold/60">
              {item.status.label}
            </span>
          )}
        </span>
      </Link>

      {item.shareUrl && (
        <ShareProgramButton
          label={item.label}
          url={item.shareUrl}
          surface="dark"
          className="absolute bottom-2 right-2 h-5 w-5"
        />
      )}
    </div>
  );
}
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

// The house's offices, as rows on one plate: mark, name, what it is for, and the place
// it opens. Rows rather than keys because there are seven of them — a counter is a
// shopfront and gets a key, an office is a department and reads as a line on a directory.
export default function HouseOffices({ programs = [], cursorKey }) {
  return (
    <div className="overflow-hidden rounded-[11px] border border-editorial-cream/[0.14] bg-editorial-cream/[0.045] md:rounded-[13px]">
      {programs.map((program, i) => {
        const selected = program.key === cursorKey;
        const Icon = program.icon;
        const external = !!program.href;
        const Tag = external ? "a" : Link;
        const linkProps = external
          ? { href: program.href, target: "_blank", rel: "noopener noreferrer" }
          : { to: program.to };

        return (
          <Tag
            key={program.key}
            {...linkProps}
            data-hh-key={program.key}
            aria-current={selected ? "true" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 md:gap-4 md:px-4 md:py-3 ${
              i > 0 ? "border-t border-editorial-cream/[0.09]" : ""
            } ${selected ? "bg-editorial-cream/[0.13]" : "hover:bg-editorial-cream/[0.07]"}`}
            style={selected ? { boxShadow: "inset 2px 0 0 rgb(var(--editorial-gold-rgb) / 0.9)" } : undefined}
          >
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-[7px] md:h-8 md:w-8 ${
                selected
                  ? "bg-editorial-gold/20 text-editorial-gold"
                  : "bg-editorial-cream/[0.07] text-editorial-gold/85"
              }`}
            >
              <Icon className="h-[14px] w-[14px] md:h-4 md:w-4" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-heading text-[12.5px] font-semibold leading-none text-editorial-cream md:text-[15px]">
                {program.label}
                {external ? (
                  <ArrowUpRight className="ml-1 inline h-3 w-3 -translate-y-[1px] text-editorial-cream/45" />
                ) : null}
              </span>
              <span className="mt-1 block truncate text-[9px] leading-tight text-editorial-cream/50 md:text-[11px]">
                {program.blurb}
              </span>
            </span>

            <span
              className={`shrink-0 font-heading text-[9px] leading-none md:text-[11px] ${
                selected ? "text-editorial-gold" : "text-editorial-cream/45"
              }`}
            >
              {program.index}
            </span>
          </Tag>
        );
      })}
    </div>
  );
}
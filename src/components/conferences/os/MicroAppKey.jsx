import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// One application, as a cartridge: a moulded plate seated against a brass spine, its
// printed number, its mark, and a line about what it opens. A slot on a phone (spine
// down the left), a tile on a desk (spine across the top) — the same object either
// way, because the launcher is the same menu on both machines.
//
// data-hh-key is what lets the console's ring land on it, and the LED is what says
// the ring is standing there.
export default function MicroAppKey({ app, selected }) {
  const Icon = app.icon;

  return (
    <Link
      to={app.to}
      data-hh-key={app.key}
      aria-current={selected ? 'true' : undefined}
      className={`cfs-key group relative flex h-full w-full items-stretch overflow-hidden rounded-[9px] active:scale-[0.994] md:flex-col ${
        selected ? 'is-selected' : ''
      }`}
    >
      <span
        className="h-full w-[5px] shrink-0 md:h-[5px] md:w-full"
        style={{ background: `linear-gradient(180deg, ${app.accent}, rgba(184,115,51,0.5))` }}
      />

      <span className="relative flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-3 py-2.5 md:px-3.5 md:py-3">
        <span className="flex items-start justify-between gap-2">
          <Icon className="h-[16px] w-[16px] shrink-0 md:h-[20px] md:w-[20px]" style={{ color: app.accent }} />
          <span className="font-heading text-[10px] leading-none text-editorial-cream/60 md:text-[12px]">
            {app.index}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block font-heading text-[13.5px] font-semibold leading-tight text-editorial-cream md:text-[17px]">
            {app.label}
          </span>
          <span className="mt-1 line-clamp-2 block text-[10px] leading-snug text-editorial-cream/55 md:text-[11px]">
            {app.blurb}
          </span>
        </span>

        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span className="cfs-led h-1.5 w-1.5 rounded-full" />
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-cream/45">
              {selected ? 'Open' : app.short}
            </span>
          </span>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-editorial-cream/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}
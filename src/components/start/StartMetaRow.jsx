import useClock from "@/hooks/useClock";

// The reader's stamp: the cycle's year, the day, and a running clock, the seconds set
// a shade brighter than the minutes so the line reads as live rather than as a
// photograph of a time. It closes the title screen on a desk, set at the same inset as
// the mark and the keys above it and closed by a hairline. On the phone the same stamp
// is printed on the device itself, in the band across the foot of the glass (see
// ViewerFoot), which is why this one is only drawn from the desk breakpoint up.
export default function StartMetaRow() {
  const now = useClock();

  return (
    <div className="shrink-0">
      <p className="truncate text-[8.5px] font-bold uppercase tracking-[0.14em] text-editorial-cream/70 md:text-[9.5px] md:tracking-[0.2em]">
        <span className="text-editorial-cream/80">MMXXVI</span>
        <span className="mx-1.5 text-editorial-cream/45">·</span>
        {now.format("ddd D MMM · HH:mm")}
        <span className="text-editorial-cream/70">:{now.format("ss")}</span>
      </p>

      <div
        className="mt-2 h-px w-full md:mt-3"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.42) 0%, rgb(var(--editorial-gold-rgb) / 0.08) 58%, transparent 100%)",
        }}
      />
    </div>
  );
}
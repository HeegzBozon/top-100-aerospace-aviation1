import useClock from "@/hooks/useClock";

// The head of the cover: the house's name at the left, the watch and the hour at the
// right, and one copper-to-rose-gold rule closing it. It is the same information the
// phone prints in the strip across its glass — read on a desk as a masthead instead.
export default function DesktopStartRail({ phase }) {
  const now = useClock();

  return (
    <div className="ds-rise">
      <div className="flex items-center justify-between gap-8">
        <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.34em] text-editorial-cream/75">
          <span
            className="h-[5px] w-[5px] rotate-45"
            style={{ background: "rgb(var(--editorial-gold-rgb))" }}
          />
          Top 100 Aerospace &amp; Aviation
        </p>

        <p className="flex shrink-0 items-center gap-3 text-[9.5px] font-bold uppercase tracking-[0.3em] text-editorial-gold/85">
          {phase.kicker}
          <span className="h-3 w-px bg-editorial-gold/30" />
          <span className="tabular-nums text-editorial-cream/55">{now.format("HH:mm")}</span>
        </p>
      </div>

      <div
        className="mt-4 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--editorial-copper-rgb) / 0.7) 0%, rgb(var(--editorial-gold-rgb) / 0.45) 32%, rgb(var(--editorial-gold-rgb) / 0.05) 78%, transparent 100%)",
        }}
      />
    </div>
  );
}
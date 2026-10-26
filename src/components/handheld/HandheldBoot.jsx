import { useEffect } from "react";

// Power-on sequence. The console wakes once per session: a cartridge insert,
// a screen flash, then the picture comes up.
export default function HandheldBoot({ onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 1900);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <button
      type="button"
      onClick={onDone}
      aria-label="Skip power-on sequence"
      className="hh-boot fixed z-[46] flex flex-col items-center justify-center gap-3 overflow-hidden rounded-b-[12px] md:hidden"
      style={{
        left: 7,
        right: 7,
        top: "calc(var(--hh-top, 12px) + var(--hh-bar, 52px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom))",
        background: "radial-gradient(120% 100% at 50% 0%, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
      }}
    >
      <p className="text-[7px] font-bold uppercase tracking-[0.42em] text-[var(--hh-lcd-soft)]">Cartridge inserted</p>

      <p className="hh-flicker text-[26px] font-bold uppercase tracking-[0.12em] text-[var(--hh-lcd)]">TOP 100 OS</p>

      <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-[var(--hh-lcd-soft)]">
        Aerospace &amp; Aviation · Handheld
      </p>

      <div className="mt-2 h-[3px] w-[128px] overflow-hidden rounded-full bg-[var(--hh-lcd-soft)]/25">
        <div className="hh-boot-bar h-full w-full rounded-full bg-[var(--hh-lcd)]" />
      </div>
    </button>
  );
}
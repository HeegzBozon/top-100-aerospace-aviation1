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
        top: "calc(54px + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom))",
        background: "radial-gradient(120% 100% at 50% 0%, #16302D 0%, #0B1A1A 60%, #06100F 100%)",
      }}
    >
      <p className="text-[7px] font-bold uppercase tracking-[0.42em] text-[#8FBF63]">Cartridge inserted</p>

      <p className="hh-flicker text-[26px] font-bold uppercase tracking-[0.12em] text-[#A9C46C]">TOP 100 OS</p>

      <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#6E8B4A]">
        Aerospace &amp; Aviation · Handheld
      </p>

      <div className="mt-2 h-[3px] w-[128px] overflow-hidden rounded-full bg-[#6E8B4A]/25">
        <div className="hh-boot-bar h-full w-full rounded-full bg-[#A9C46C]" />
      </div>
    </button>
  );
}
import { Volume2, VolumeX } from "lucide-react";

// The mobile masthead, rebuilt as the console's top bezel: brand lockup, the
// surface you are currently holding, and the sound latch. Every other control
// lives on the wheel below.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

export default function HandheldMasthead({ surface, soundOn, onToggleSound }) {
  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 select-none md:hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        background: "linear-gradient(180deg, #FBF9F5 0%, #F1EADE 100%)",
        borderBottom: "1px solid rgba(184,115,51,0.42)",
        boxShadow: "0 2px 8px rgba(30,58,90,0.10)",
      }}
    >
      <div className="flex h-[54px] items-center gap-2.5 px-3.5">
        <img src={HANDHELD_LOGO} alt="" className="h-[26px] w-[26px] shrink-0 object-contain" />

        <div className="min-w-0 flex-1 leading-none">
          <p className="truncate text-[9.5px] font-bold uppercase tracking-[0.2em] text-[#1E3A5A]">
            TOP 100 Aerospace &amp; Aviation
          </p>
          <p className="mt-[5px] flex items-center gap-1.5 truncate text-[7px] font-bold uppercase tracking-[0.24em] text-[#B87333]">
            <span className="hh-led h-[5px] w-[5px] shrink-0 rounded-full bg-[#2ED573]" />
            {surface}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#1E3A5A]/60 transition-colors active:bg-[#1E3A5A]/10"
        >
          {soundOn ? <Volume2 className="h-[15px] w-[15px]" /> : <VolumeX className="h-[15px] w-[15px]" />}
        </button>
      </div>
    </header>
  );
}
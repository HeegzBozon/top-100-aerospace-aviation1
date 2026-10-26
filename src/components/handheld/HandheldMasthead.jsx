import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";

// The legend band. It is not a website header, and it is not a bar laid over the
// picture: it is fitted to the case, on the shell above the screen. The mark sits
// in a machined badge, the surface you are holding is engraved beside it, and the
// three icon keys are the same moulded keys as the wheel's — you, your
// transmissions, and the sound latch. Every tone is a finish token, so the band is
// recast whenever the hardware is.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

// A key on the case: moulded like the ones on the wheel, and pressing like them.
function BarKey({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="hh-bar-key flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[9px] transition-transform active:translate-y-[1px]"
      style={{ color: "var(--hh-key-ink)" }}
    >
      {children}
    </button>
  );
}

export default function HandheldMasthead({
  surface,
  module,
  soundOn,
  onToggleSound,
  onProfile,
  onNotifications,
}) {
  return (
    <header
      className="fixed z-[44] select-none md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        top: "calc(var(--hh-shell-top, 26px) + env(safe-area-inset-top))",
        height: "var(--hh-bar, 52px)",
      }}
    >
      <div className="flex h-full items-center gap-2.5 px-2.5">
        {/* The mark, set into the case rather than laid on it */}
        <span className="hh-badge flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full">
          <img src={HANDHELD_LOGO} alt="" className="h-[22px] w-[22px] object-contain" />
        </span>

        <div className="min-w-0 flex-1 leading-none">
          <p
            className="hh-engrave truncate text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--hh-ink)" }}
          >
            TOP 100 Aerospace &amp; Aviation
          </p>
          <p
            className="mt-[5px] flex items-center gap-1.5 truncate text-[7px] font-bold uppercase tracking-[0.24em]"
            style={{ color: "var(--hh-metal)" }}
          >
            <span className="hh-led h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: "var(--hh-led)" }} />
            <span className="truncate">
              {surface}
              {module ? ` · ${module}` : ""}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <BarKey label="Your profile" onClick={onProfile}>
            <CircleUser className="h-[15px] w-[15px]" />
          </BarKey>

          <BarKey label="Notifications" onClick={onNotifications}>
            <Bell className="h-[15px] w-[15px]" />
          </BarKey>

          <BarKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound}>
            {soundOn ? <Volume2 className="h-[15px] w-[15px]" /> : <VolumeX className="h-[15px] w-[15px]" />}
          </BarKey>
        </div>
      </div>
    </header>
  );
}
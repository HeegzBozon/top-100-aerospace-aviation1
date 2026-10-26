import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";

// The brand bar. It is not a website header — it is the top strip of the glass:
// the lockup, the surface you are holding (and the module inside it), and the
// strip of icon keys — you, your transmissions, and the sound latch — all drawn
// behind the same pane as the picture. Every tone comes from the active finish,
// so it changes with the hardware.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

// A key in the bar: pressed into the glass, no chrome of its own.
function BarKey({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors active:bg-[rgb(var(--hh-ink-rgb)/0.12)]"
      style={{ color: "var(--hh-ink-soft)" }}
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
      className="hh-bar fixed z-[44] select-none md:hidden"
      style={{
        left: 7,
        right: 7,
        top: "calc(var(--hh-top, 12px) + env(safe-area-inset-top))",
        height: "var(--hh-bar, 52px)",
      }}
    >
      <div className="flex h-full items-center gap-2 px-3">
        <img
          src={HANDHELD_LOGO}
          alt=""
          className="h-[26px] w-[26px] shrink-0 object-contain"
        />

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

        <div className="flex shrink-0 items-center gap-0.5">
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
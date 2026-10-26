import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";

// The legend band. It is not a website header, and it is not a bar laid over the
// picture: it is a channel cut across the case above the screen. The mark sits in
// a machined badge, the surface you are holding is engraved beside it, and the
// three icon keys are the same moulded keys as the wheel's — you, your
// transmissions, and the sound latch. A copper hairline closes the band where the
// glass opens, so the case reads as two fitted parts. Every tone is a finish
// token, so the band is recast whenever the hardware is.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

// A key on the case: the same matte moulding as the wheel, and the same press.
function BarKey({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="hh-bar-key flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[7px] transition-transform active:translate-y-[1px]"
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
  onHome,
}) {
  return (
    <header
      className="fixed z-[44] select-none md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        top: "calc(var(--hh-shell-top, 21px) + env(safe-area-inset-top))",
        height: "var(--hh-bar, 42px)",
      }}
    >
      <div className="hh-band flex h-full items-center gap-2 px-1.5">
        {/* The mark, set into the case rather than laid on it — and the way back to
            the front screen, which is the one thing everybody tries a logo for. */}
        <button
          type="button"
          onClick={onHome}
          aria-label="Home — the front screen"
          className="hh-badge flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-[1px]"
        >
          <img src={HANDHELD_LOGO} alt="" className="h-[19px] w-[19px] object-contain" />
        </button>

        <div className="min-w-0 flex-1 leading-none">
          <p
            className="hh-engrave truncate text-[8.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: "var(--hh-ink)" }}
          >
            TOP 100 Aerospace &amp; Aviation
          </p>
          <p
            className="mt-[4px] flex items-center gap-1.5 truncate text-[6.5px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--hh-metal)" }}
          >
            <span className="hh-led h-[4.5px] w-[4.5px] shrink-0 rounded-full" style={{ background: "var(--hh-led)" }} />
            <span className="truncate">
              {surface}
              {module ? ` · ${module}` : ""}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <BarKey label="Your profile" onClick={onProfile}>
            <CircleUser className="h-[13px] w-[13px]" />
          </BarKey>

          <BarKey label="Notifications" onClick={onNotifications}>
            <Bell className="h-[13px] w-[13px]" />
          </BarKey>

          <BarKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound}>
            {soundOn ? <Volume2 className="h-[13px] w-[13px]" /> : <VolumeX className="h-[13px] w-[13px]" />}
          </BarKey>
        </div>
      </div>

      {/* Where the band meets the viewer: the case's parting line. */}
      <span aria-hidden="true" className="hh-band-edge absolute inset-x-3 -bottom-[1px] h-px" />
    </header>
  );
}
import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";
import { HANDHELD_LOGO } from "./HandheldMasthead";

// The top bar, inside the glass. It is the app's own bar rather than the case's:
// a dark stadium across the head of the picture, floating over the surface, and it
// carries the three things a hand reaches for — you, what has come in, and the
// sound latch. The mark at its left is the way home; beside it, where you are
// reads as a title with a breadcrumb under it.
//
// The case above it is branding only. Everything that acts lives here, inside the
// glass, where the controls belong.
const BAR_HEIGHT = 48;

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

export default function ScreenTopBar({
  surface,
  module,
  soundOn,
  onHome,
  onProfile,
  onNotifications,
  onToggleSound,
}) {
  return (
    <div
      className="fixed z-[34] select-none md:hidden"
      style={{
        left: "calc(var(--hh-glass-inset, 7px) + 6px)",
        right: "calc(var(--hh-glass-inset, 7px) + 6px)",
        top: "calc(var(--hh-top, 69px) + env(safe-area-inset-top) + 6px)",
        height: BAR_HEIGHT,
      }}
    >
      <div className="hh-screenbar flex h-full items-center gap-2 pl-1.5 pr-1.5">
        {/* The mark, and the way home: the one thing everybody tries a logo for. */}
        <button
          type="button"
          onClick={onHome}
          aria-label="Home — the front screen"
          className="hh-badge flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-[1px]"
        >
          <img src={HANDHELD_LOGO} alt="" className="h-[21px] w-[21px] object-contain" />
        </button>

        <div className="min-w-0 flex-1 leading-none">
          <p
            className="truncate text-[8.5px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--hh-key-1)" }}
          >
            {surface}
          </p>
          <p
            className="mt-[4px] flex items-center gap-1.5 truncate text-[6.5px] font-bold uppercase tracking-[0.20em]"
            style={{ color: "rgb(255,255,255,0.56)" }}
          >
            <span className="h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: "var(--hh-led)" }} />
            <span className="truncate">{module || "Home"}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <BarKey label="Your profile" onClick={onProfile}>
            <CircleUser className="h-[13px] w-[13px]" strokeWidth={1.8} />
          </BarKey>

          <BarKey label="Notifications" onClick={onNotifications}>
            <Bell className="h-[13px] w-[13px]" strokeWidth={1.8} />
          </BarKey>

          <BarKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound}>
            {soundOn ? (
              <Volume2 className="h-[13px] w-[13px]" strokeWidth={1.8} />
            ) : (
              <VolumeX className="h-[13px] w-[13px]" strokeWidth={1.8} />
            )}
          </BarKey>
        </div>
      </div>
    </div>
  );
}
import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";
import { HANDHELD_LOGO } from "./HandheldMasthead";

// The control rail, inside the glass. One line, and three glyphs: where you are,
// then the three things a hand actually reaches for — you, what has come in, and
// the sound latch. The mark at its left is the way home.
//
// Nothing else is drawn here. No second row, no plates on the keys, no counts: the
// rail should read as the top edge of the picture rather than as a second toolbar,
// and the surfaces below it keep the room.
const RAIL_HEIGHT = 40;

function RailKey({ label, onClick, lit = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-[1px]"
      style={{ color: lit ? "var(--hh-metal)" : "var(--hh-ink)" }}
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
        left: "calc(var(--hh-glass-inset, 32px) + 8px)",
        right: "calc(var(--hh-glass-inset, 32px) + 8px)",
        top: "calc(var(--hh-top, 73px) + env(safe-area-inset-top) + 6px)",
        height: RAIL_HEIGHT,
      }}
    >
      <div className="hh-screenbar flex h-full items-center gap-2 pl-1.5 pr-1.5">
        {/* The mark, and the way home. */}
        <button
          type="button"
          onClick={onHome}
          aria-label="Home — the front screen"
          className="hh-badge flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-[1px]"
        >
          <img src={HANDHELD_LOGO} alt="" className="h-[16px] w-[16px] object-contain" />
        </button>

        {/* Where you are: the surface, then the section as a quiet suffix. */}
        <p className="flex min-w-0 flex-1 items-center gap-2 truncate text-[8.5px] font-bold uppercase tracking-[0.20em]">
          <span className="truncate" style={{ color: "var(--hh-key-1)" }}>
            {surface}
          </span>
          {module ? (
            <span
              className="flex min-w-0 shrink items-center gap-1.5 text-[6.5px] tracking-[0.18em]"
              style={{ color: "rgb(255,255,255,0.52)" }}
            >
              <span
                className="h-[4px] w-[4px] shrink-0 rounded-full"
                style={{ background: "var(--hh-led)" }}
              />
              <span className="truncate">{module}</span>
            </span>
          ) : null}
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <RailKey label="Your profile" onClick={onProfile}>
            <CircleUser className="h-[15px] w-[15px]" strokeWidth={1.7} />
          </RailKey>

          <RailKey label="Notifications" onClick={onNotifications}>
            <Bell className="h-[15px] w-[15px]" strokeWidth={1.7} />
          </RailKey>

          <RailKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound} lit={soundOn}>
            {soundOn ? (
              <Volume2 className="h-[15px] w-[15px]" strokeWidth={1.7} />
            ) : (
              <VolumeX className="h-[15px] w-[15px]" strokeWidth={1.7} />
            )}
          </RailKey>
        </div>
      </div>
    </div>
  );
}
import { Bell, CircleUser, Volume2, VolumeX } from "lucide-react";

// The control rail: the strip cut flush across the head of the glass.
//
// It is the machine's legend band, moved inside the glass and put to work. No
// logo, no pill, nothing floating over the picture: a printed HOME key at the
// left, the console's status in the middle — where you are, and which section of
// it — then the three keys a hand actually reaches for, each cell parted from the
// next by a machined seam the way a strip of switches is. The strip closes the
// pane's own top corners, so the rail reads as the top edge of the picture rather
// than as a second toolbar, and the surfaces below it keep the room.
const STRIP_HEIGHT = 28;

function StripKey({ label, onClick, lit = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="hh-strip-key flex w-[33px] shrink-0 items-center justify-center"
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
        left: "var(--hh-glass-inset, 32px)",
        right: "var(--hh-glass-inset, 32px)",
        top: "calc(var(--hh-top, 73px) + env(safe-area-inset-top))",
        height: STRIP_HEIGHT,
      }}
    >
      <div className="hh-strip flex h-full items-stretch overflow-hidden">
        {/* The printed way home. */}
        <button
          type="button"
          onClick={onHome}
          aria-label="Home — the front screen"
          className="hh-strip-key flex shrink-0 items-center px-3 text-[7.5px] font-bold uppercase tracking-[0.26em]"
          style={{ color: "var(--hh-ink-soft)" }}
        >
          Home
        </button>

        <span aria-hidden="true" className="hh-strip-seam" />

        {/* Where you are: the surface, then the section as a quiet suffix. */}
        <p className="flex min-w-0 flex-1 items-center gap-2 px-3 text-[8px] font-bold uppercase tracking-[0.20em]">
          <span
            className="hh-led h-[4px] w-[4px] shrink-0 rounded-full"
            style={{ background: "var(--hh-led)" }}
          />
          <span className="truncate" style={{ color: "var(--hh-key-1)" }}>
            {surface}
          </span>
          {module ? (
            <span
              className="min-w-0 shrink truncate text-[6.5px] tracking-[0.18em]"
              style={{ color: "rgb(255,255,255,0.5)" }}
            >
              {module}
            </span>
          ) : null}
        </p>

        <span aria-hidden="true" className="hh-strip-seam" />

        <StripKey label="Your profile" onClick={onProfile}>
          <CircleUser className="h-[15px] w-[15px]" strokeWidth={1.7} />
        </StripKey>

        <span aria-hidden="true" className="hh-strip-seam" />

        <StripKey label="Notifications" onClick={onNotifications}>
          <Bell className="h-[15px] w-[15px]" strokeWidth={1.7} />
        </StripKey>

        <span aria-hidden="true" className="hh-strip-seam" />

        <StripKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound} lit={soundOn}>
          {soundOn ? (
            <Volume2 className="h-[15px] w-[15px]" strokeWidth={1.7} />
          ) : (
            <VolumeX className="h-[15px] w-[15px]" strokeWidth={1.7} />
          )}
        </StripKey>
      </div>
    </div>
  );
}
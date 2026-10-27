import { Bell, CircleUser, Home, Volume2, VolumeX } from "lucide-react";

// The menubar: the strip across the head of the picture, cloned from the desk the
// machine imitates. The way home stands at the far left as the mark itself, the surface
// you are standing on beside it with its lamp lit, the section you are reading in
// quiet type, then the three keys a hand actually reaches for at the right. The
// strip is seamless: no frame around it, no rule between its cells — the cells are
// parted by their own spacing, and the tone comes from the surface it is set into.
//
// It is one strip on both machines: on the glass it is the head band of the picture,
// on the desk it stands across the top of the tube. The surface cell is the menu —
// the wheel's MENU opens the same drawer from the hardware, and a press of the title
// does exactly what that key does.
function BarKey({ label, onClick, lit = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="mb-cell flex w-[33px] shrink-0 items-center justify-center"
      style={{ color: lit ? "var(--mb-lamp)" : "var(--mb-ink)" }}
    >
      {children}
    </button>
  );
}

export default function MenuBar({
  surface,
  module,
  menuOpen = false,
  onHome,
  onMenu,
  onProfile,
  onNotifications,
  soundOn,
  onToggleSound,
  className = "",
  style,
}) {
  return (
    <div
      className={`mb-bar select-none ${className}`}
      style={style}
      role="menubar"
      aria-label="Menu bar"
    >
      {/* The way home: the mark at the far left, where the desk keeps it. */}
      <BarKey label="Home — the front screen" onClick={onHome}>
        <Home className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </BarKey>

      {/* Where you stand — and the menu. The lamp is lit for the surface you are on,
          and the cell reads as pressed while the menu it opens is standing. */}
      <button
        type="button"
        onClick={onMenu}
        data-open={menuOpen ? "true" : "false"}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${surface} — the menu`}
        className="mb-cell flex min-w-0 flex-1 items-center gap-2 px-3 text-left text-[8px] font-bold uppercase tracking-[0.20em]"
      >
        <span className="mb-lamp h-[4px] w-[4px] shrink-0 rounded-full" aria-hidden="true" />
        <span className="truncate" style={{ color: "var(--mb-ink-strong)" }}>
          {surface}
        </span>
        {module ? (
          <span
            className="min-w-0 shrink truncate text-[6.5px] tracking-[0.18em]"
            style={{ color: "var(--mb-ink-soft)" }}
          >
            {module}
          </span>
        ) : null}
      </button>

      <BarKey label="Your profile" onClick={onProfile}>
        <CircleUser className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </BarKey>

      <BarKey label="Notifications" onClick={onNotifications}>
        <Bell className="h-[15px] w-[15px]" strokeWidth={1.7} />
      </BarKey>

      <BarKey label={soundOn ? "Sound off" : "Sound on"} onClick={onToggleSound} lit={soundOn}>
        {soundOn ? (
          <Volume2 className="h-[15px] w-[15px]" strokeWidth={1.7} />
        ) : (
          <VolumeX className="h-[15px] w-[15px]" strokeWidth={1.7} />
        )}
      </BarKey>
    </div>
  );
}
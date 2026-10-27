import MenuBar from "@/components/shell/MenuBar";

// The control rail: the strip cut flush across the head of the glass.
//
// It is the machine's legend band, moved inside the glass and put to work — the
// menubar the desk machine wears, at the size of a hand. No logo, no pill, nothing
// floating over the picture: the way home printed at the left, the surface you are
// on with its lamp lit, the section as a quiet suffix, then the three keys a hand
// actually reaches for, every cell parted from the next by a machined seam.
//
// The seat the strip is set into runs from the top of the glass down to the picture.
// It is cut square and painted the strip's own tone, so the head reads as one
// continuous rail rather than a bar floating in a gap — and it fills the strip's
// rounded ends out past the glass's curve, so nothing behind the rail (a surface's
// paper, a fixed bar) can ever show through them.
const STRIP_HEIGHT = 28;
const HEAD_BAND = "var(--hh-nav, 34px)";

export default function ScreenTopBar({
  surface,
  module,
  menuOpen,
  onMenu,
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
        height: HEAD_BAND,
        background: "var(--hh-recess)",
      }}
    >
      <MenuBar
        surface={surface}
        module={module}
        menuOpen={menuOpen}
        onHome={onHome}
        onMenu={onMenu}
        onProfile={onProfile}
        onNotifications={onNotifications}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
        style={{ height: STRIP_HEIGHT }}
      />
    </div>
  );
}
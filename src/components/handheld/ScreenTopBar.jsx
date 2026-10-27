import MenuBar from "@/components/shell/MenuBar";
import { useFaceKeysClaimed } from "@/components/handheld/handheldKeys";

// The control rail: the strip cut flush across the head of the glass.
//
// It is the machine's legend band, moved inside the glass and put to work — the
// menubar the desk machine wears, at the size of a hand. No logo, no pill, nothing
// floating over the picture: the way home, File and Edit printed at the left, the
// surface you are on with its lamp lit and the section as a quiet suffix, then the one
// key a hand actually reaches for, every cell parted from the next by a machined seam.
//
// File and Edit open the console's own drawer in the matching list, so the wheel
// walks them the way it walks everything else on this device — and each prints, small
// beside its word, the face key that does the same thing (X for File, Y for Edit), so a
// hand moving between the strip and the keypad never has to guess. A surface that has
// claimed the four keys takes them off the strip with it: the words stay, the hints go.
//
// The seat the strip is set into runs from the top of the glass down to the picture,
// and the strip fills it edge to edge and top to bottom: one continuous rail across
// the head, seamless — no frame, no gap, no step where the bar ends and the band
// begins. Its top corners keep the glass's own curve, and it is cut square where it
// meets the picture, so nothing behind the rail (a surface's paper, a fixed bar) can
// ever show through around it.
const HEAD_BAND = "var(--hh-nav, 34px)";

export default function ScreenTopBar({
  surface,
  module,
  menuOpen,
  fileOpen,
  editOpen,
  onHome,
  onMenu,
  onFile,
  onEdit,
  onNotifications,
}) {
  const keysClaimed = useFaceKeysClaimed();

  return (
    <div
      className="fixed z-[34] select-none md:hidden"
      style={{
        left: "var(--hh-glass-inset, 32px)",
        right: "var(--hh-glass-inset, 32px)",
        top: "calc(var(--hh-top, 73px) + env(safe-area-inset-top))",
        height: HEAD_BAND,
        background: "var(--hh-recess)",
        borderRadius: "8px 8px 0 0",
      }}
    >
      <MenuBar
        surface={surface}
        module={module}
        menuOpen={menuOpen}
        fileOpen={fileOpen}
        editOpen={editOpen}
        onHome={onHome}
        onMenu={onMenu}
        onFile={onFile}
        onEdit={onEdit}
        onNotifications={onNotifications}
        fileHint={keysClaimed ? "" : "X"}
        editHint={keysClaimed ? "" : "Y"}
        style={{ height: HEAD_BAND }}
      />
    </div>
  );
}
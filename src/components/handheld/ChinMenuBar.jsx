import MenuBar from "@/components/shell/MenuBar";
import { useFaceKeysClaimed } from "./handheldKeys";
import { useAuth } from "@/lib/AuthContext";
import { toggleViewingAsVisitor } from "@/lib/viewerPreview";

// The legend band across the head of the chin.
//
// The machine's menu bar — the way home, File, Edit, the surface you are standing on with
// its lamp lit, the bell — is cut into the case above the controls instead of floating
// over the picture, so the glass belongs wholly to the surface being read. It is the same
// strip the desk machine wears, at the size of a hand: a well of the finish's recess
// seated in the moulding, its cells parted by machined seams, and the face keys printed
// small beside the words they do the same thing as.
//
// File and Edit open the console's own drawers in the matching list, so the wheel walks
// them the way it walks everything else on this device. A surface that has claimed the
// face keys takes their hints off the strip with it: the words stay, the hints go.
const BAND = 26;

export default function ChinMenuBar({
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
  fileKey = "X",
  editKey = "Y",
}) {
  const keysClaimed = useFaceKeysClaimed();
  // The operator's lens: on the glass it is the same cell the desk machine wears — drawn
  // for an admin, and answering to the record rather than to the reading.
  const { realUser, viewingAsVisitor } = useAuth();

  return (
    <div
      className="rc-band mx-3 shrink-0 overflow-hidden rounded-[4px]"
      style={{
        height: BAND,
        background: "var(--hh-recess)",
        boxShadow:
          "inset 0 0 0 1px rgb(var(--hh-ink-rgb) / 0.14), inset 0 3px 6px -3px rgba(3,6,13,0.85), 0 1px 0 var(--hh-shell-spec)",
      }}
    >
      {/* The radio's cut: the band bolted into the case at both ends. The seams between
          the cells are drawn by the band itself (see .rc-band), so every cell here lands
          on its own line. */}
      <span className="rc-rivet" style={{ left: 3 }} aria-hidden="true" />
      <span className="rc-rivet" style={{ right: 3 }} aria-hidden="true" />
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
        showViewAs={realUser?.role === "admin"}
        viewingAsVisitor={viewingAsVisitor}
        onToggleViewAs={toggleViewingAsVisitor}
        fileHint={keysClaimed ? "" : fileKey}
        editHint={keysClaimed ? "" : editKey}
        style={{ height: BAND }}
      />
    </div>
  );
}
import { ChevronDown, ChevronUp, Home as HomeIcon, Share, Undo2 } from "lucide-react";
import RadioKey from "./radio/RadioKey";

// The machine's key bar.
//
// The radio face was built around this row of eight caps, and both faces wear it now:
// the two lists, the share, a fourth cap the fitted face names for itself, the way home,
// and the three keys that walk. It is one row on both fronts — same caps, same order,
// same metal — so a hand that has learned the console on one face has learned the other,
// and only what stands under the bar changes.
export default function ConsoleKeyBar({
  fileKey = "V",
  editKey = "A",
  onFile,
  onEdit,
  onShare,
  shareOpen = false,
  /* The fourth cap belongs to the face: the radio prints the bank whose numbers its
     keypad is typing, the wheel prints the search it has no pad to reach. */
  fourth = null,
  onHome,
  onUp,
  onDown,
  onUpEnd,
  onDownEnd,
  onBack,
  className = "",
}) {
  return (
    <div className={`grid h-[28px] shrink-0 grid-cols-8 gap-[3px] ${className}`}>
      <RadioKey
        label={fileKey}
        sub="FILE"
        skin="copper"
        onPress={onFile}
        ariaLabel={`${fileKey} — the File list`}
      />
      <RadioKey
        label={editKey}
        sub="EDIT"
        skin="navy"
        onPress={onEdit}
        ariaLabel={`${editKey} — the Edit list`}
      />
      <RadioKey
        glyph={Share}
        sub="SHARE"
        skin="copper"
        pressed={shareOpen}
        onPress={onShare}
        ariaLabel={shareOpen ? "Close the share drawer" : "Share this page"}
      />
      {fourth ? (
        <RadioKey
          label={fourth.label}
          glyph={fourth.glyph}
          sub={fourth.sub}
          skin={fourth.skin || "light"}
          pressed={fourth.pressed}
          onPress={fourth.onPress}
          ariaLabel={fourth.ariaLabel}
        />
      ) : (
        <span aria-hidden="true" />
      )}
      <RadioKey glyph={HomeIcon} sub="HOME" skin="light" onPress={onHome} ariaLabel="Home" />
      <RadioKey
        glyph={ChevronUp}
        sub="UP"
        skin="light"
        onPress={onUp}
        onHold={onUpEnd}
        ariaLabel="Up — hold to the top"
      />
      <RadioKey
        glyph={ChevronDown}
        sub="DOWN"
        skin="light"
        onPress={onDown}
        onHold={onDownEnd}
        ariaLabel="Down — hold to the bottom"
      />
      <RadioKey glyph={Undo2} sub="BACK" skin="light" onPress={onBack} ariaLabel="Back" />
    </div>
  );
}
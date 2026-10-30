import { ChevronDown, ChevronUp, Home as HomeIcon, Share, Undo2 } from "lucide-react";
import RadioKeypad from "./RadioKeypad";
import RadioSpeaker from "./RadioSpeaker";
import RadioKey from "./RadioKey";

// The radio face: the handheld's other front.
//
// A field transceiver puts everything under two thumbs — the two lists (V: File, A: Edit),
// a cluster for walking and entering, the speaker punched across the case, and the keypad.
// The legend band across the head of the chin is the machine's own menu bar (see
// ChinMenuBar), so where you are and where you can go are read on the case, not floated
// over the picture.
//
// There is no foot plate. The finish the case is wearing and the face it is wearing it in
// are chosen in the Edit drawer now, so nothing is printed below the keypad and the keys
// run down to the case's own edge. Nothing here is decorative: the bank key prints the set
// of numbers the pad is standing on, so a hand can read it without looking up from the
// picture.
export default function RadioChin({
  bank,
  onDigit,
  onScan,
  onBank,
  onFile,
  onEdit,
  onUp,
  onDown,
  onUpEnd,
  onDownEnd,
  onHome,
  onBack,
  onEnter,
  onAnnounce,
  onSoundOn,
  onShare,
  shareOpen = false,
}) {
  return (
    <div className="flex h-full flex-col gap-[3px] px-3 pt-1.5">
      {/* The cluster: the two lists, the share, the bank the pad is standing on, and the
          keys that walk. */}
      <div className="grid h-[28px] shrink-0 grid-cols-8 gap-[3px]">
        <RadioKey label="V" sub="FILE" skin="copper" onPress={onFile} ariaLabel="V — the File list" />
        <RadioKey label="A" sub="EDIT" skin="navy" onPress={onEdit} ariaLabel="A — the Edit list" />
        <RadioKey
          glyph={Share}
          sub="SHARE"
          skin="copper"
          pressed={shareOpen}
          onPress={onShare}
          ariaLabel={shareOpen ? "Close the share drawer" : "Share this page"}
        />
        <RadioKey
          label={bank}
          sub="BANK"
          skin="light"
          onPress={onBank}
          ariaLabel={
            bank === "FN"
              ? "Bank — the surface's numbered options. Press for channels"
              : "Bank — the channels. Press for the surface's numbered options"
          }
        />
        <RadioKey glyph={HomeIcon} sub="HOME" skin="light" onPress={onHome} ariaLabel="Home" />
        <RadioKey glyph={ChevronUp} sub="UP" skin="light" onPress={onUp} onHold={onUpEnd} ariaLabel="Up — hold to the top" />
        <RadioKey glyph={ChevronDown} sub="DOWN" skin="light" onPress={onDown} onHold={onDownEnd} ariaLabel="Down — hold to the bottom" />
        <RadioKey glyph={Undo2} sub="BACK" skin="light" onPress={onBack} ariaLabel="Back" />
      </div>

      {/* The speaker slot, punched across the case, with the sound key at its right. */}
      <div className="flex h-[16px] shrink-0 items-center gap-1.5">
        <span className="hh-grille h-[7px] flex-1 rounded-[2px]" aria-hidden="true" />
        <RadioSpeaker onAnnounce={onAnnounce} onSoundOn={onSoundOn} />
      </div>

      <div className="min-h-0 flex-1">
        <RadioKeypad onDigit={onDigit} onScan={onScan} onEnter={onEnter} />
      </div>
    </div>
  );
}
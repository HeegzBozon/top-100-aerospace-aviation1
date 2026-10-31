import RadioKeypad from "./RadioKeypad";
import RadioSpeaker from "./RadioSpeaker";
import ConsoleKeyBar from "../ConsoleKeyBar";

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
    <div className="flex min-h-0 flex-1 flex-col gap-[3px] px-3 pt-1.5">
      {/* The cluster: the two lists, the share, the bank the pad is standing on, and the
          keys that walk. */}
      <ConsoleKeyBar
        fileKey="V"
        editKey="A"
        onFile={onFile}
        onEdit={onEdit}
        onShare={onShare}
        shareOpen={shareOpen}
        fourth={{
          label: bank,
          sub: "BANK",
          onPress: onBank,
          ariaLabel:
            bank === "FN"
              ? "Bank — the surface's numbered options. Press for channels"
              : "Bank — the channels. Press for the surface's numbered options",
        }}
        onHome={onHome}
        onUp={onUp}
        onDown={onDown}
        onUpEnd={onUpEnd}
        onDownEnd={onDownEnd}
        onBack={onBack}
      />

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
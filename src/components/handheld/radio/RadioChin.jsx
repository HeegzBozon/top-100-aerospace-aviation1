import { ChevronDown, ChevronUp, Home as HomeIcon, Share, Undo2 } from "lucide-react";
import RadioReadout from "./RadioReadout";
import RadioKeypad from "./RadioKeypad";
import RadioSpeaker from "./RadioSpeaker";
import RadioKey from "./RadioKey";
import ConsoleModeKey from "../ConsoleModeKey";
import CustomizeKey from "../CustomizeKey";

// The radio face: the handheld's other front.
//
// A field transceiver puts everything under two thumbs and nothing behind a menu — a
// backlit readout across the head, the two lists (V: File, A: Edit), a cluster for
// walking and entering, the keypad, and the maker's plate at the foot. The readout is
// not only printed but pressed: the displays switch the machine between the surface and
// its own drawer, and the bank badge swaps the keypad between channels and the surface's
// numbered options. Nothing here is decorative: every key prints the state it is standing
// in, so a hand can find it without looking up from the picture.
//
// The foot is the same plate the wheel's face wears (see HandheldPlate): the finish the
// case is dressed in at the left, the face the machine is wearing pinned centre, and who
// is holding it at the right. Share is not here — it is the lit key in the cluster.
export default function RadioChin({
  zone,
  bank,
  digits,
  total,
  label,
  signal,
  entering,
  legend,
  mode,
  finish,
  isSignedIn,
  onDigit,
  onScan,
  onBank,
  onZone,
  onFile,
  onEdit,
  onUp,
  onDown,
  onHome,
  onBack,
  onEnter,
  onStation,
  onCycleMode,
  onCustomize,
  onAnnounce,
  onSoundOn,
  onShare,
  shareOpen = false,
}) {
  const engrave =
    "hh-engrave flex shrink-0 items-center gap-1 text-[6px] font-bold uppercase tracking-[0.22em]";

  return (
    <div className="flex h-full flex-col gap-[3px] px-3 pt-1.5">
      <div className="h-[24px] shrink-0">
        <RadioReadout
          zone={zone}
          bank={bank}
          digits={digits}
          total={total}
          label={label}
          signal={signal}
          entering={entering}
          onZone={onZone}
          onBank={onBank}
        />
      </div>

      {/* The cluster. The two lit keys are the lists: V for File, A for Edit — the same
          two drawers the strip across the head of the glass prints, lettered with the keys
          that do the same thing on this face. Then the Share key, which is the one thing
          this machine offers that is not navigation; entering lives on the pad's lit corner
          key below (see RadioKeypad). The displays and the bank they switch between are up
          on the readout, pressed where they are printed. */}
      <div className="grid h-[28px] shrink-0 grid-cols-7 gap-[3px]">
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
        <RadioKey glyph={HomeIcon} sub="HOME" skin="light" onPress={onHome} ariaLabel="Home" />
        <RadioKey glyph={ChevronUp} sub="UP" skin="light" onPress={onUp} ariaLabel="Up" />
        <RadioKey glyph={ChevronDown} sub="DOWN" skin="light" onPress={onDown} ariaLabel="Down" />
        <RadioKey glyph={Undo2} sub="BACK" skin="light" onPress={onBack} ariaLabel="Back" />
      </div>

      {/* The speaker slot, punched across the case between the keys and the cluster. */}
      <span className="hh-grille h-[7px] w-full shrink-0 rounded-[2px]" aria-hidden="true" />

      <div className="min-h-0 flex-1">
        <RadioKeypad onDigit={onDigit} onScan={onScan} onEnter={onEnter} />
      </div>

      <div className="hh-footer grid h-[20px] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1.5 px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <CustomizeKey finish={finish} onPress={onCustomize} compact />
          <RadioSpeaker onAnnounce={onAnnounce} onSoundOn={onSoundOn} />
        </div>

        <ConsoleModeKey legend={legend} mode={mode} onCycle={onCycleMode} />

        <button
          type="button"
          onClick={onStation}
          className={`${engrave} min-w-0 justify-end`}
          style={{ color: "var(--hh-ink-soft)" }}
          aria-label={isSignedIn ? "Station — what has come in for you" : "Station — sign in"}
        >
          <span className="hh-footer-led" data-on={isSignedIn} aria-hidden="true" />
          {isSignedIn ? "Fellow" : "Visitor"}
        </button>
      </div>
    </div>
  );
}
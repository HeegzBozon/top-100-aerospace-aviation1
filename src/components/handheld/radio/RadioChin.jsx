import { ChevronDown, ChevronUp, Home as HomeIcon, Share, Undo2 } from "lucide-react";
import RadioReadout from "./RadioReadout";
import RadioKeypad from "./RadioKeypad";
import RadioSpeaker from "./RadioSpeaker";
import RadioKey from "./RadioKey";
import ConsoleModeKey from "../ConsoleModeKey";

// The radio face: the handheld's other front.
//
// A field transceiver puts everything under two thumbs and nothing behind a menu — a
// backlit readout across the head, the two lists (V: File, A: Edit), a cluster for
// walking and leaving, the keypad, and the maker's plate at the foot. The readout is
// not only printed but pressed: the displays switch the machine between the surface and
// its own drawer, and the bank badge swaps the keypad between channels and the surface's
// numbered options. Nothing here is decorative: every key prints the state it is standing
// in, so a hand can find it without looking up from the picture.
export default function RadioChin({
  zone,
  bank,
  digits,
  total,
  label,
  signal,
  entering,
  enterHint,
  legend,
  mode,
  isSignedIn,
  onDigit,
  onEnter,
  onScan,
  onBank,
  onZone,
  onFile,
  onEdit,
  onUp,
  onDown,
  onHome,
  onBack,
  onStation,
  onCycleMode,
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
          that do the same thing on this face. The displays and the bank they switch between
          are up on the readout, pressed where they are printed. */}
      <div className="grid h-[28px] shrink-0 grid-cols-6 gap-[3px]">
        <RadioKey label="V" sub="FILE" skin="copper" onPress={onFile} ariaLabel="V — the File list" />
        <RadioKey label="A" sub="EDIT" skin="navy" onPress={onEdit} ariaLabel="A — the Edit list" />
        <RadioKey glyph={HomeIcon} sub="HOME" skin="light" onPress={onHome} ariaLabel="Home" />
        <RadioKey glyph={ChevronUp} sub="UP" skin="light" onPress={onUp} ariaLabel="Up" />
        <RadioKey glyph={ChevronDown} sub="DOWN" skin="light" onPress={onDown} ariaLabel="Down" />
        <RadioKey glyph={Undo2} sub="BACK" skin="light" onPress={onBack} ariaLabel="Back" />
      </div>

      {/* The speaker slot, punched across the case between the keys and the cluster. */}
      <span className="hh-grille h-[7px] w-full shrink-0 rounded-[2px]" aria-hidden="true" />

      <div className="min-h-0 flex-1">
        <RadioKeypad onDigit={onDigit} onEnter={onEnter} onScan={onScan} enterHint={enterHint} />
      </div>

      <div className="hh-footer flex h-[20px] shrink-0 items-center gap-2">
        <span className={engrave} style={{ color: "var(--hh-ink-soft)" }}>
          <span className="hh-screw h-[6px] w-[6px] rounded-full" />
          HW-88 PRO
        </span>

        {/* The share, moved down off the glass: the radio prints the cycle on its own
            readout, so the band that carried this pill has been handed back to the
            picture and the pill rides the machine's footer instead. */}
        <button
          type="button"
          onClick={onShare}
          data-open={shareOpen || undefined}
          className={engrave}
          style={{ color: shareOpen ? "var(--hh-lcd-bright)" : "var(--hh-ink-soft)" }}
          aria-label={shareOpen ? "Close the share drawer" : "Share this page"}
        >
          <Share className="h-[7px] w-[7px] shrink-0" />
          Share
        </button>

        <span
          aria-hidden="true"
          className="h-px min-w-[4px] flex-1"
          style={{
            background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.04), rgb(var(--hh-metal-rgb) / 0.30))",
          }}
        />

        <RadioSpeaker onAnnounce={onAnnounce} onSoundOn={onSoundOn} />

        <ConsoleModeKey legend={legend} mode={mode} onCycle={onCycleMode} />

        <span
          className="h-px min-w-[4px] flex-1"
          style={{
            background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.20), rgb(var(--hh-metal-rgb) / 0.04))",
          }}
        />

        <button
          type="button"
          onClick={onStation}
          className={engrave}
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
import { Disc, Radio } from "lucide-react";

// The MODE key on the maker's plate: which face the machine is wearing.
//
// It steps Automatic → Wheel → Radio and prints what it is standing on, with the face
// it is actually drawing beside the word — so a machine left in Automatic still says
// which of the two the current surface was given, and the reason it was given it is in
// the label a screen reader reads.
export default function ConsoleModeKey({ legend, mode, onCycle }) {
  const Glyph = mode === "radio" ? Radio : Disc;

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Console face: ${legend}. Press to change between automatic, click wheel and radio keypad.`}
      title="Console face — Automatic, click wheel, or radio keypad"
      className="hh-pad-key flex h-[19px] min-w-0 shrink-0 items-center gap-[5px] rounded-[9px] px-2 text-[6.5px] font-bold uppercase tracking-[0.16em]"
      style={{ color: "var(--hh-pad-ink)" }}
    >
      <Glyph className="h-[9px] w-[9px] shrink-0" />
      <span className="truncate">{legend}</span>
    </button>
  );
}
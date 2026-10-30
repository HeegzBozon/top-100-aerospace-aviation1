import { Palette } from "lucide-react";

// The key that changes what the device is wearing.
//
// It is the same part on both faces and in the same place — the left of the maker's plate
// at the foot of the case — because the finish is hardware, not a setting of whichever face
// happens to be up. The swatches printed on the cap are the finish it is wearing right now,
// so the key reports the case's own state before it is pressed.
//
// `compact` is the radio's foot, which is two pixels shallower and shares its left with the
// speaker: the glyph and the arrow come off and the swatches and the word stay, so the key
// still says what it does and still shows what the case is wearing.
export default function CustomizeKey({ finish, onPress, compact = false }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Customize the console. Wearing ${finish.label}`}
      title="Customize — the finish the case is wearing"
      className={`hh-pad-key flex h-[19px] min-w-0 shrink-0 items-center gap-[6px] rounded-[9px] text-[6.5px] font-bold uppercase tracking-[0.18em] ${
        compact ? "px-2" : "px-2.5"
      }`}
      style={{ color: "var(--hh-pad-ink)" }}
    >
      {compact ? null : <Palette className="h-[8px] w-[8px] shrink-0" />}
      <span className="flex shrink-0 items-center gap-[3px]">
        {(finish.swatch || []).map((tone) => (
          <span
            key={tone}
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: tone, boxShadow: "inset 0 0 0 1px rgba(7,17,31,0.35)" }}
          />
        ))}
      </span>
      <span className="truncate">Customize</span>
      {compact ? null : (
        <span className="shrink-0" style={{ color: "rgb(var(--hh-metal-rgb) / 0.85)" }}>
          ▲
        </span>
      )}
    </button>
  );
}
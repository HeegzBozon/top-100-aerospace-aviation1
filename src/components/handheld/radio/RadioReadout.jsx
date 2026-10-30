// The backlit readout at the head of the keypad.
//
// A field radio prints its whole state on one strip and nothing else: which of its two
// displays is live (A or B), whether the keys are typing channels or acting on the
// surface (CH or FN), the number standing in the display, the name of what that number
// is, and the signal it is holding. All of it reads from live state — the number is the
// channel the machine is tuned to, or the section being read, or the entry the cursor is
// on — so the strip is an instrument rather than a decoration.
const BARS = [0, 1, 2, 3, 4];

export default function RadioReadout({ zone, bank, digits, label, signal = 3, entering = false }) {
  return (
    <div className="hr-lcd relative flex h-full shrink-0 items-center gap-1.5 px-1.5">
      {/* The two displays, A over B, with the live one lit. */}
      <span className="flex shrink-0 flex-col items-center justify-center gap-[1px] leading-none">
        {["A", "B"].map((letter) => (
          <span
            key={letter}
            className="text-[6px] font-bold leading-none"
            style={{
              color: zone === letter ? "var(--hh-lcd-bright)" : "rgb(var(--hh-lcd-rgb) / 0.26)",
              textShadow: zone === letter ? "0 0 6px rgb(var(--hh-lcd-rgb) / 0.6)" : "none",
            }}
          >
            {letter}
          </span>
        ))}
      </span>

      <span
        className="shrink-0 rounded-[2px] px-[3px] py-[1px] text-[5.5px] font-bold uppercase tracking-[0.12em]"
        style={{
          color: "var(--hh-lcd-soft)",
          boxShadow: "inset 0 0 0 1px rgb(var(--hh-lcd-rgb) / 0.22)",
        }}
      >
        {bank}
      </span>

      {/* The number in the display. It blinks while it is being typed. */}
      <span
        className={`shrink-0 text-[13px] font-bold leading-none ${entering ? "hh-blink" : ""}`}
        style={{
          color: "var(--hh-lcd-bright)",
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.10em",
          textShadow: "0 0 8px rgb(var(--hh-lcd-rgb) / 0.55)",
        }}
      >
        {digits}
      </span>

      <span
        className="min-w-0 flex-1 truncate text-[6px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "var(--hh-lcd)" }}
      >
        {label}
      </span>

      {/* The signal: how far into the surface the machine is standing. */}
      <span className="flex shrink-0 items-end gap-[1.5px]" aria-hidden="true">
        {BARS.map((bar) => (
          <span
            key={bar}
            className="w-[2.5px] rounded-[0.5px]"
            style={{
              height: 3 + bar * 2,
              background: bar < signal ? "var(--hh-lcd-bright)" : "rgb(var(--hh-lcd-rgb) / 0.16)",
              boxShadow: bar < signal ? "0 0 4px rgb(var(--hh-lcd-rgb) / 0.6)" : "none",
            }}
          />
        ))}
      </span>

      <span
        className="shrink-0 text-[5px] font-bold uppercase tracking-[0.1em]"
        style={{ color: "var(--hh-lcd-soft)" }}
      >
        SQL
      </span>
    </div>
  );
}
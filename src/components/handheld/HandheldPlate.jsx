import { Palette } from "lucide-react";

// The maker's plate: the band cut into the foot of the case, inside the moulding
// rather than across its edge. The model mark is engraved at the left, the key that
// changes what the device is wearing sits in the middle — the swatch row on it is the
// finish it is wearing right now — and the right says who is holding the console, with
// a lamp beside it. The two sides are drawn out to their marks by a machined hairline
// so the plate reads as one fitted part.
export default function HandheldPlate({ finish, isSignedIn, onCustomize }) {
  const engrave =
    "hh-engrave flex shrink-0 items-center gap-1.5 text-[6.5px] font-bold uppercase tracking-[0.24em]";

  return (
    <div className="hh-footer relative mt-2 flex h-[24px] items-center gap-2.5 px-3">
      <span className={engrave} style={{ color: "var(--hh-ink-soft)" }}>
        <span className="hh-screw h-[6px] w-[6px] rounded-full" />
        HW-88
      </span>

      <span
        aria-hidden="true"
        className="h-px min-w-[6px] flex-1"
        style={{
          background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.04), rgb(var(--hh-metal-rgb) / 0.30))",
        }}
      />

      <button
        type="button"
        onClick={onCustomize}
        aria-label={`Customize the console. Wearing ${finish.label}`}
        className="hh-pad-key flex h-[19px] min-w-0 shrink-0 items-center gap-[7px] rounded-[9px] px-2.5 text-[6.5px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "var(--hh-pad-ink)" }}
      >
        <Palette className="h-[8px] w-[8px] shrink-0" />
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
        <span className="shrink-0" style={{ color: "rgb(var(--hh-metal-rgb) / 0.85)" }}>
          ▲
        </span>
      </button>

      <span
        aria-hidden="true"
        className="h-px min-w-[6px] flex-1"
        style={{
          background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.30), rgb(var(--hh-metal-rgb) / 0.04))",
        }}
      />

      <span className={engrave} style={{ color: "var(--hh-ink-soft)" }}>
        <span className="hh-footer-led" data-on={isSignedIn} aria-hidden="true" />
        {isSignedIn ? "Fellow" : "Visitor"}
      </span>
    </div>
  );
}
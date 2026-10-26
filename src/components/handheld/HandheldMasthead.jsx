// The crown: the legend band printed across the top of the chassis, above the glass.
//
// It is branding and nothing else — the mark seated in a machined well, the name
// engraved beside it, and the year cut in at the right over the shell's grain.
// Everything that acts lives either in the rail inside the glass or on the chin
// below it, so this band stays one quiet line and the case stays thin.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

export default function HandheldMasthead() {
  return (
    <header
      className="fixed z-[44] select-none md:hidden"
      style={{
        left: "var(--hh-glass-inset, 32px)",
        right: "var(--hh-glass-inset, 32px)",
        top: "calc(var(--hh-shell-top, 21px) + env(safe-area-inset-top))",
        height: "var(--hh-bar, 34px)",
      }}
    >
      <div
        className="hh-band flex h-full items-center gap-2.5 px-2.5"
        style={{ borderRadius: "13px 13px 9px 9px" }}
      >
        {/* The mark, fitted to the case: a brass-rimmed well, the way a badge is
            actually seated in a moulding. */}
        <span className="hh-badge flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full">
          <img src={HANDHELD_LOGO} alt="" className="h-[17px] w-[17px] object-contain" />
        </span>

        <span
          className="hh-engrave min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.20em]"
          style={{ color: "var(--hh-ink)" }}
        >
          TOP 100 Aerospace &amp; Aviation
        </span>

        <span
          aria-hidden="true"
          className="h-px min-w-[10px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.42), rgba(184,115,51,0.02))",
          }}
        />

        <span
          className="hh-engrave shrink-0 text-[7px] font-bold uppercase tracking-[0.30em]"
          style={{ color: "var(--hh-ink-soft)" }}
        >
          MMXXVI
        </span>
      </div>

      {/* Where the crown meets the viewer: the case's parting line. */}
      <span aria-hidden="true" className="hh-band-edge absolute inset-x-3 -bottom-[1px] h-px" />
    </header>
  );
}
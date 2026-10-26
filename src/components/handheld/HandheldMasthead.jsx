// The legend band: the lockup printed across the top of the case, above the glass.
//
// It is branding and nothing else — the mark, the name, and a metal hairline drawn
// out to either side. Every control the device has lives either on the chin below
// the glass or in the bar inside it, so this band stays a single quiet line, and
// the case stays thin.
export const HANDHELD_LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";

export default function HandheldMasthead() {
  return (
    <header
      className="fixed z-[44] select-none md:hidden"
      style={{
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        top: "calc(var(--hh-shell-top, 21px) + env(safe-area-inset-top))",
        height: "var(--hh-bar, 30px)",
      }}
    >
      <div className="hh-band flex h-full items-center gap-2 px-3">
        <span
          aria-hidden="true"
          className="h-px min-w-0 flex-1"
          style={{
            background: "linear-gradient(90deg, rgba(184,115,51,0), rgb(var(--hh-metal-rgb) / 0.45))",
          }}
        />

        <img src={HANDHELD_LOGO} alt="" className="h-[17px] w-[17px] shrink-0 object-contain" />

        <p
          className="hh-engrave min-w-0 truncate text-[8.5px] font-bold uppercase tracking-[0.20em]"
          style={{ color: "var(--hh-ink)" }}
        >
          TOP 100 Aerospace &amp; Aviation
        </p>

        <span
          aria-hidden="true"
          className="h-px min-w-0 flex-1"
          style={{
            background: "linear-gradient(90deg, rgb(var(--hh-metal-rgb) / 0.45), rgba(184,115,51,0))",
          }}
        />
      </div>

      {/* Where the band meets the viewer: the case's parting line. */}
      <span aria-hidden="true" className="hh-band-edge absolute inset-x-3 -bottom-[1px] h-px" />
    </header>
  );
}
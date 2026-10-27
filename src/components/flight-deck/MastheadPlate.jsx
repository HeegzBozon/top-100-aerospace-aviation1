// The plate across the top of the moulding: the institution's lockup cut into the
// shell, the machine's own name, and the lamps that say what state it is in.
export default function MastheadPlate({ operator, live }) {
  return (
    <div className="fd-plate flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-5">
      <div className="flex items-center gap-2.5">
        <span
          className="fd-lamp h-2 w-2 rounded-full"
          style={{
            background: live ? "#6FD08C" : "rgba(239,233,220,0.20)",
            boxShadow: live ? "0 0 8px rgba(111,208,140,0.85)" : undefined,
          }}
        />
        <div className="leading-none">
          <p className="hh-engrave text-[9px] font-bold uppercase tracking-[0.34em]" style={{ color: "var(--hh-ink)" }}>
            TOP 100
          </p>
          <p className="hh-engrave mt-1 text-[7px] font-bold uppercase tracking-[0.28em]" style={{ color: "var(--hh-ink-soft)" }}>
            Aerospace &amp; Aviation
          </p>
        </div>
      </div>

      <span className="fd-seam hidden h-7 w-px sm:block" />

      <div className="leading-none">
        <p className="font-heading text-[15px]" style={{ color: "var(--hh-ink)" }}>
          Flight Deck
        </p>
      </div>

      <p className="hidden text-[7px] font-bold uppercase tracking-[0.28em] lg:block" style={{ color: "var(--hh-metal-1)" }}>
        Mission Control · Dashboard
      </p>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-[7px] font-bold uppercase tracking-[0.26em]" style={{ color: "var(--hh-ink-soft)" }}>
          Operator
        </span>
        <span className="max-w-[220px] truncate text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--hh-ink)" }}>
          {operator}
        </span>
      </div>
    </div>
  );
}
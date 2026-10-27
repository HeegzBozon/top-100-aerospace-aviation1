// The strip across the head of the deck: the same figures the columns print, laid
// out as a terminal line. Text only, and never moving — a readout you can read at
// a glance, not a thing that slides past you.
export default function TickerStrip({ cells = [] }) {
  return (
    <div className="fd-ticker flex flex-wrap items-center px-4 py-1.5 md:px-5">
      {cells.map((cell) => (
        <div key={cell.k} className="flex items-center">
          <span
            className="font-mono text-[8px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--hh-ink-soft)" }}
          >
            {cell.k}
          </span>
          <span className="af-readout ml-1.5 font-mono text-[9px] font-bold uppercase" style={{ color: "var(--hh-metal-1)" }}>
            {cell.v}
          </span>
          <span className="fd-seam mx-3 h-3.5 w-px" />
        </div>
      ))}
    </div>
  );
}
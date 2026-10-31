// The reader's own standing, read off one band on a cream page: what they have
// declared, what is still ahead of them, and how many Fellows are standing in those
// rooms. Same three readings the launcher prints on its instrument band, drawn in the
// house's ink because this one sits inside a printed surface.
export default function StandingReadout({ cells }) {
  return (
    <div
      className="grid grid-cols-3 overflow-hidden rounded-sm"
      style={{ background: '#16293f', border: '1px solid rgba(184,115,51,0.4)' }}
    >
      {cells.map((cell, i) => (
        <div
          key={cell.label}
          className="px-3 py-2 md:px-4 md:py-3"
          style={i > 0 ? { boxShadow: 'inset 1px 0 0 rgba(201,168,124,0.28)' } : undefined}
        >
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-gold/85 md:text-[9px]">
            {cell.label}
          </p>
          <p className="mt-1 font-heading text-[19px] leading-none tabular-nums text-editorial-cream md:text-[23px]">
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );
}
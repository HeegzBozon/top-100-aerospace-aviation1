// A panel's own stripe inside a desk: what the panel is called, and the keys it is
// worked with, so a merged desk still reads as one instrument per page.
export default function DeskPanelBar({ label, note, children }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: '#c9a87c' }}>
            {label}
          </p>
          {note && (
            <span className="text-[10px]" style={{ color: '#a7bccd' }}>
              {note}
            </span>
          )}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
      <div className="desk-rule mt-2" />
    </div>
  );
}
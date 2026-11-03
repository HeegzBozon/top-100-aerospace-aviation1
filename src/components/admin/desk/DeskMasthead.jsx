// The masthead every house desk opens on: a copper kicker, the desk's name set in the
// house serif, one line on what the chore is for, and the keys the desk is worked with.
export default function DeskMasthead({ kicker, title, blurb, children }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: '#c9a87c' }}>
            {kicker}
          </p>
          <h2 className="mt-1.5 font-heading text-[26px] leading-none" style={{ color: '#f5efe4' }}>
            {title}
          </h2>
          {blurb && (
            <p className="mt-2 max-w-xl text-xs leading-relaxed" style={{ color: '#a3b8c9' }}>
              {blurb}
            </p>
          )}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
      <div className="desk-rule mt-3.5" />
    </div>
  );
}
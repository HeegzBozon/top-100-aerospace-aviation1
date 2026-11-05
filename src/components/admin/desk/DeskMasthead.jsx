// The masthead every house desk opens on: a copper kicker, the desk's name set in the
// house serif, one line on what the chore is for, and the keys the desk is worked with.
//
// On a phone the name comes down a size and the line under it is held to two, so the desk
// itself — the figures, the ledger, the keys — is on the glass before the first scroll.
export default function DeskMasthead({ kicker, title, blurb, children }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: '#c9a87c' }}>
            {kicker}
          </p>
          <h2 className="mt-1.5 font-heading text-[21px] leading-[1.05] sm:text-[26px] sm:leading-none" style={{ color: '#f5efe4' }}>
            {title}
          </h2>
          {blurb && (
            <p
              className="mt-2 max-w-xl overflow-hidden text-[11px] leading-relaxed sm:text-xs"
              style={{
                color: '#a3b8c9',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {blurb}
            </p>
          )}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
      <div className="desk-rule mt-3" />
    </div>
  );
}
// ONE CARD, HELD
//
// A held record, cut to card size: a navy field, a copper hairline, the discipline's own
// accent down the spine, the portrait seated in its plate, and the serial at the foot. It
// reads as an institutional object — the card of a record you have met, not a game piece.
export default function StarCardFace({ card, litAt, compact = false }) {
  if (!card) return null;
  const accent = card.accent?.ink || '#c9a87c';
  const since = litAt ? new Date(litAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : null;
  return (
    <article
      className="relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-md"
      style={{
        background: 'linear-gradient(168deg, #1b324b 0%, #16293f 58%, #0e1d2d 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.45), 0 12px 26px -18px rgba(3,8,15,0.95)',
      }}
    >
      {/* The discipline's spine: structure, never a score. */}
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: accent }} />

      <div className="flex items-start justify-between px-3 pt-2.5">
        <p className="text-[7px] font-bold uppercase leading-tight tracking-[0.18em] text-editorial-cream/55">
          Top 100<br />Aerospace &amp; Aviation
        </p>
        <p className="text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
          {card.tier.label}
        </p>
      </div>

      <div className="mx-3 mt-2 flex flex-1 flex-col overflow-hidden">
        <div
          className="relative w-full overflow-hidden rounded-sm"
          style={{ aspectRatio: '1 / 1', border: `1px solid ${accent}55`, background: 'rgba(250,248,245,0.05)' }}
        >
          {card.face ? (
            <img src={card.face} alt={card.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-heading text-3xl" style={{ color: accent }}>
              {card.name.charAt(0)}
            </div>
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{ background: 'linear-gradient(to top, rgba(14,29,45,0.92), rgba(14,29,45,0))' }}
          />
          <p className="absolute bottom-1 left-1.5 right-1.5 truncate text-[7px] uppercase tracking-[0.14em]" style={{ color: accent }}>
            {card.accent.label}
          </p>
        </div>

        <h3 className={`mt-2 font-heading leading-tight text-editorial-cream ${compact ? 'text-sm' : 'text-base'}`}>
          {card.name}
        </h3>
        {card.role && <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-editorial-cream/70">{card.role}</p>}
        {card.org && <p className="truncate text-[9px] text-editorial-cream/50">{card.org}</p>}

        {card.stats.length > 0 && (
          <div className="mt-1.5 flex gap-2">
            {card.stats.map((s) => (
              <div key={s.label} className="min-w-0">
                <p className="font-heading text-[11px] leading-none text-editorial-cream">{s.value.toLocaleString()}</p>
                <p className="truncate text-[6.5px] uppercase tracking-[0.1em] text-editorial-cream/45">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-editorial-cream/12 px-3 py-1.5">
        <p className="text-[7px] uppercase tracking-[0.14em] text-editorial-cream/45">
          {since ? `Lit ${since}` : 'On the record'}
        </p>
        <p className="font-heading text-[8px] tracking-[0.12em] text-editorial-gold">No. {card.serial}</p>
      </div>
    </article>
  );
}
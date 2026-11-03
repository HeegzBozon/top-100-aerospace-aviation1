// THE OTHER SIDE OF THE CARD
//
// A card is two-sided because a record is: the face carries the person, the reverse
// carries what is filed. Discipline and place at the head, the measured work in the
// middle, the tier's own note under it, and the serial at the foot. It is drawn on the
// same field as the face — one object, turned — and nothing here is a score, a value or
// a comparison against anyone else.
export default function CardBack({ card }) {
  if (!card) return null;
  const accent = card.accent?.ink || '#c9a87c';
  const metrics = card.record?.metrics || [];
  const facts = [
    ['Discipline', card.accent?.label],
    ['Based in', card.country],
    ['Credential', card.record?.verified ? 'Verified' : 'On file'],
  ].filter(([, value]) => value);

  return (
    <article
      className="relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-md"
      style={{
        background: 'linear-gradient(168deg, #16293f 0%, #122234 58%, #0b1826 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(201,168,124,0.45), 0 12px 26px -18px rgba(3,8,15,0.95)',
      }}
    >
      <div className="absolute inset-y-0 right-0 w-1" style={{ background: accent }} />

      <div className="flex items-start justify-between px-3 pt-2.5">
        <p className="text-[7px] font-bold uppercase leading-tight tracking-[0.18em] text-editorial-cream/55">
          The Record
        </p>
        <p className="text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
          {card.tier.label}
        </p>
      </div>

      <div className="mx-3 mt-2 flex flex-1 flex-col overflow-hidden">
        <h3 className="font-heading text-sm leading-tight text-editorial-cream">{card.name}</h3>

        <div className="mt-2 space-y-1">
          {facts.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-2">
              <p className="shrink-0 text-[6.5px] uppercase tracking-[0.12em] text-editorial-cream/45">{label}</p>
              <p className="truncate text-[8px] text-editorial-cream/85">{value}</p>
            </div>
          ))}
        </div>

        <div className="my-2 h-px" style={{ background: `${accent}4d` }} />

        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="font-heading text-[11px] leading-none text-editorial-cream">{m.value.toLocaleString()}</p>
                <p className="truncate text-[6.5px] uppercase tracking-[0.1em] text-editorial-cream/45">{m.label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[8px] leading-snug text-editorial-cream/50">
            No measured figures are filed on this record yet.
          </p>
        )}

        <p className="mt-auto pt-2 text-[6.5px] leading-snug text-editorial-cream/40">{card.tier.note}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-editorial-cream/12 px-3 py-1.5">
        <p className="text-[6.5px] uppercase tracking-[0.12em] text-editorial-cream/45">A record held</p>
        <p className="font-heading text-[8px] tracking-[0.12em] text-editorial-gold">No. {card.serial}</p>
      </div>
    </article>
  );
}
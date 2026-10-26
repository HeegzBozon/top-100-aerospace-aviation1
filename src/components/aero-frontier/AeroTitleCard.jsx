import { AERO } from "./aeroConfig";

// The title card. Every chapter of Hollow Field opens on one: a veil over the
// field, a small kicker, the name of the moment, and one line under it. It plays
// itself out in CSS — in on the first sixth, held, then gone — and the game
// removes it on the same beat, so the scene behind it is never waiting.
export default function AeroTitleCard({ card }) {
  if (!card) return null;

  return (
    <div className="af-card absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/72 px-6 text-center">
      <p className="text-[7.5px] font-bold uppercase tracking-[0.34em]" style={{ color: AERO.amber }}>
        {card.kicker}
      </p>
      <h2 className="mt-3 font-heading text-[27px] leading-tight text-editorial-cream">{card.title}</h2>
      <span className="mt-3 block h-[1px] w-24" style={{ background: `linear-gradient(90deg, transparent, ${AERO.amber}, transparent)` }} />
      {card.line ? (
        <p className="mt-3 max-w-xs text-[11.5px] leading-relaxed" style={{ color: AERO.muted }}>
          {card.line}
        </p>
      ) : null}
    </div>
  );
}
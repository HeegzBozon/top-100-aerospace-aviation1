import { Check } from 'lucide-react';
import { P } from '../../patronConfig';
import { DECK_DELIVERABLES } from '../deckSlides';

// One bundle, three dates. The flagship is the plate that carries a rose-gold edge; nothing
// about that emphasis is a promise of position in an issue.
export default function SlideSlots({ tiers }) {
  return (
    <div>
      <h2 className="font-heading text-[1.25rem] leading-tight text-editorial-cream md:text-[1.7rem]">
        2026 / 2027 slot availability
      </h2>
      <p className="mt-1.5 text-[11px] leading-relaxed text-editorial-cream/60 md:text-[12px]">
        One bundle at three dates. Every slot carries the same four deliverables.
      </p>

      <div className="mt-5 grid gap-2.5 md:grid-cols-3 md:gap-3">
        {tiers.map((tier) => {
          const premium = tier.tier === 'flagship';
          return (
            <div
              key={tier.tier}
              className="border px-3 py-3"
              style={{
                borderColor: premium ? P.gold : 'rgba(250,248,245,0.22)',
                background: premium ? 'rgba(201,168,124,0.09)' : 'rgba(250,248,245,0.03)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-cream/70">
                {tier.name} slot
              </p>
              <p className="mt-1 font-heading text-[1.2rem] leading-none text-editorial-cream">{tier.price}</p>
              <p className="mt-1.5 text-[10px] leading-snug text-editorial-cream/55">{tier.when}</p>
              <div className="my-2.5 h-px" style={{ background: premium ? 'rgba(201,168,124,0.5)' : 'rgba(250,248,245,0.18)' }} />
              {tier.placed ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: P.gold }}>
                  Sponsor in place
                </p>
              ) : (
                <ul className="space-y-1">
                  {DECK_DELIVERABLES.map((line) => (
                    <li key={line} className="flex items-start gap-1.5 text-[10.5px] leading-snug text-editorial-cream/80">
                      <Check className="mt-0.5 h-3 w-3 flex-none" style={{ color: P.copper }} />
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
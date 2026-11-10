import { Eye, Mail, Megaphone } from 'lucide-react';
import { P } from '../../patronConfig';
import { DECK_FIGURES } from '../deckSlides';

const GLYPHS = { subscribers: Megaphone, email: Mail, opens: Eye };

export default function SlideAudience() {
  return (
    <div>
      <h2 className="font-heading text-[1.25rem] leading-tight text-editorial-cream md:text-[1.7rem]">
        Audience, as measured
      </h2>
      <p className="mt-1.5 text-[11px] leading-relaxed text-editorial-cream/60 md:text-[12px]">
        Dated, sourced, and never merged into one number.
      </p>

      <div className="mt-5 grid gap-2.5 md:grid-cols-3 md:gap-3">
        {DECK_FIGURES.map((figure) => {
          const Glyph = GLYPHS[figure.key] || Megaphone;
          return (
            <div
              key={figure.key}
              className="border px-3 py-3.5 text-center"
              style={{ borderColor: 'rgba(184,115,51,0.5)', background: 'rgba(250,248,245,0.035)' }}
            >
              <Glyph className="mx-auto h-4 w-4" style={{ color: P.gold }} />
              <p className="mt-2 font-heading text-[1.5rem] leading-none md:text-[1.85rem]" style={{ color: P.gold }}>
                {figure.value}
              </p>
              <p className="mt-2 text-[10.5px] leading-snug text-editorial-cream/80">{figure.label}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[9.5px] uppercase tracking-[0.16em] text-editorial-cream/40">
        Pulled October 2026 &middot; the email audience is part of the newsletter list, never a second one
      </p>
    </div>
  );
}
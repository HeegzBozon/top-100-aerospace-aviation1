import { Plane, ArrowUpRight } from 'lucide-react';

const NAVY = '#07111f';
const NAVY_MID = '#1e3a5a';
const GOLD = '#c9a87c';
const GOLD_LIGHT = '#e8d4b8';
const CREAM_BG = '#faf8f5';

const CONCORD_URL = 'https://www.concordaerospace.com';

export default function PartnerSpotlight() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Featured Partner</span>
        <div className="h-px flex-1" style={{ background: `${GOLD}30` }} />
      </div>

      <div
        className="flex flex-col items-center gap-8 overflow-hidden rounded-3xl p-8 md:flex-row md:p-12"
        style={{ background: CREAM_BG, border: `1px solid ${GOLD}30` }}
      >
        {/* Logo block */}
        <div
          className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_MID})`, border: `1px solid ${GOLD}40` }}
        >
          <Plane className="h-12 w-12" style={{ color: GOLD }} />
        </div>

        {/* Copy + CTA */}
        <div className="flex-1 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: GOLD }}>Partnership · Sponsored</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-light" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
            Concord Aerospace
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed md:mx-0" style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}>
            A featured partner of the TOP 100. Explore Concord Aerospace's collection of aerospace parts, kits, and mission-ready hardware — proudly our first sponsored partner.
          </p>
          <a
            href={CONCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-all hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: NAVY }}
          >
            Visit Concord Aerospace
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
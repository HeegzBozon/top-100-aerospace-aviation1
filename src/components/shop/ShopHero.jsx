import { ShoppingBag } from 'lucide-react';

const NAVY = '#07111f';
const NAVY_MID = '#1e3a5a';
const GOLD = '#c9a87c';

export default function ShopHero() {
  return (
    <section
      className="relative overflow-hidden px-4 py-16 md:py-24"
      style={{ background: `linear-gradient(150deg, ${NAVY} 0%, ${NAVY_MID} 100%)` }}
    >
      {/* faint orbit ring */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20"
        style={{ border: `1px solid ${GOLD}` }}
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full opacity-10"
        style={{ border: `1px solid ${GOLD}` }}
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ background: 'rgba(201,168,124,0.12)', border: `1px solid ${GOLD}40` }}>
          <ShoppingBag className="h-3.5 w-3.5" style={{ color: GOLD }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>The Hangar</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Official Gear & <span style={{ color: GOLD }}>Flagship Software</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm md:text-base text-white/60" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          From Ground Control — the business communication platform built for aerospace shops — to mission-grade apparel and collectibles.
        </p>
      </div>
    </section>
  );
}
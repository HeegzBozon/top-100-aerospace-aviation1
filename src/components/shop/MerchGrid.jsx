import { Shirt, Award, Sticker } from 'lucide-react';

const NAVY = '#07111f';
const NAVY_MID = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

const MERCH = [
  {
    id: 'hoodies',
    name: 'Mission Hoodies',
    tagline: 'Heavyweight navy fleece with rose-gold flight patch.',
    icon: Shirt,
  },
  {
    id: 'patches',
    name: 'Mission Patches',
    tagline: 'Embroidered collectible patches for every cohort & mission.',
    icon: Award,
  },
  {
    id: 'stickers',
    name: 'Vinyl Stickers',
    tagline: 'Weatherproof decals — fleets, programs & the TOP 100 mark.',
    icon: Sticker,
  },
];

function MerchCard({ item }) {
  const Icon = item.icon;
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#ffffff', border: `1px solid ${NAVY}12` }}
    >
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${NAVY} 0%, ${NAVY_MID} 100%)` }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{ background: `radial-gradient(circle at 70% 20%, ${GOLD} 0%, transparent 55%)` }}
        />
        <Icon className="h-12 w-12 transition-transform duration-500 group-hover:scale-110" style={{ color: GOLD }} />
        <span
          className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ background: `${GOLD}22`, color: GOLD, border: `1px solid ${GOLD}55` }}
        >
          Coming Soon
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
          {item.name}
        </h3>
        <p className="mt-1.5 flex-1 text-xs leading-relaxed" style={{ color: `${NAVY}99`, fontFamily: "'Montserrat', sans-serif" }}>
          {item.tagline}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: GOLD }}>Price TBA</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: `${NAVY}66` }}>
            In Production
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MerchGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>The Drop</span>
        <div className="h-px flex-1" style={{ background: `${GOLD}30` }} />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-light" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
          Mission-Grade Merch
        </h2>
        <p className="mt-2 max-w-xl text-sm" style={{ color: `${NAVY}88`, fontFamily: "'Montserrat', sans-serif" }}>
          Apparel and collectibles built for the aerospace community. First cohort drops soon.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MERCH.map((item) => (
          <MerchCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
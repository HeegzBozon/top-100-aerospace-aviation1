import { BookMarked, Layers } from 'lucide-react';

const NAVY = '#07111f';
const NAVY_MID = '#1e3a5a';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

const DROPS = [
  {
    id: 'comics',
    name: 'TOP 100 Comics',
    tagline: 'Illustrated origin stories of aerospace pioneers — issue by issue.',
    icon: BookMarked,
  },
  {
    id: 'trading-cards',
    name: 'Trading Cards',
    tagline: 'Collectible honoree cards with aura stats & mission variants.',
    icon: Layers,
  },
];

function DropCard({ item }) {
  const Icon = item.icon;
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-1"
      style={{ background: `linear-gradient(150deg, ${NAVY} 0%, ${NAVY_MID} 100%)`, border: `1px solid ${GOLD}25` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD} 0%, transparent 60%)` }}
      />
      <div className="relative mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ border: `1px solid ${GOLD}55`, background: `${GOLD}12` }}>
          <Icon className="h-7 w-7" style={{ color: GOLD }} />
        </div>
      </div>
      <h3 className="relative text-xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
        {item.name}
      </h3>
      <p className="relative mt-2 text-xs leading-relaxed text-white/55" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {item.tagline}
      </p>
      <span
        className="relative mt-5 inline-flex w-fit mx-auto items-center rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]"
        style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}55` }}
      >
        In the Hangar
      </span>
    </div>
  );
}

export default function ComicCardDrop() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: GOLD }}>Special · Coming Soon</span>
        <div className="h-px flex-1" style={{ background: `${GOLD}30` }} />
      </div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-light" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
          Comics & Trading Cards
        </h2>
        <p className="mt-2 max-w-xl text-sm" style={{ color: `${NAVY}88`, fontFamily: "'Montserrat', sans-serif" }}>
          A new collectibles line in development. Illustrated stories and stat-backed cards for the TOP 100 universe.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {DROPS.map((item) => (
          <DropCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ShopHero from '@/components/shop/ShopHero';
import GroundControlFlagship from '@/components/shop/GroundControlFlagship';
import MerchGrid from '@/components/shop/MerchGrid';
import PartnerSpotlight from '@/components/shop/PartnerSpotlight';
import ComicCardDrop from '@/components/shop/ComicCardDrop';

const NAVY = '#07111f';
const GOLD = '#c9a87c';
const CREAM = '#faf8f5';

export default function Shop() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      <ShopHero />

      <main>
        {/* Flagship product */}
        <GroundControlFlagship />

        {/* Merchandise collection */}
        <MerchGrid />

        {/* Comics & trading cards — coming soon */}
        <ComicCardDrop />

        {/* Featured partner */}
        <PartnerSpotlight />
      </main>

      {/* Back nav */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
          style={{ color: `${NAVY}99` }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: GOLD }} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
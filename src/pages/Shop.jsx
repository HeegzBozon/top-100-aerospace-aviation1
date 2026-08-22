import ShopHero from '@/components/shop/ShopHero';
import GroundControlFlagship from '@/components/shop/GroundControlFlagship';
import MerchGrid from '@/components/shop/MerchGrid';
import PartnerSpotlight from '@/components/shop/PartnerSpotlight';
import ComicCardDrop from '@/components/shop/ComicCardDrop';
import AnnouncementBanner from '@/components/home-v3/AnnouncementBanner';
import AdvocacyStrip from '@/components/events/AdvocacyStrip';
import HomeDock from '@/components/home-v3/HomeDock';

const CREAM = '#faf8f5';

export default function Shop() {
  return (
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* HomeV3-aligned top chrome: announcement + advocacy ticker */}
      <AnnouncementBanner />
      <div className="relative z-[99]">
        <AdvocacyStrip />
      </div>

      <ShopHero />

      <main>
        {/* Featured partner */}
        <PartnerSpotlight />

        {/* Flagship product */}
        <GroundControlFlagship />

        {/* Merchandise collection */}
        <MerchGrid />

        {/* Comics & trading cards — coming soon */}
        <ComicCardDrop />
      </main>

      {/* Spacer so the sticky dock never covers content */}
      <div className="h-24" />

      {/* HomeV3-aligned sticky bottom dock */}
      <HomeDock />
    </div>
  );
}
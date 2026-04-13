import RoomsHero from '@/components/rooms/RoomsHero';
import CadenceSection from '@/components/rooms/CadenceSection';
import PrinciplesSection from '@/components/rooms/PrinciplesSection';
import BuildStreamsSection from '@/components/rooms/BuildStreamsSection';
import TribeSection from '@/components/rooms/TribeSection';
import PartnersSection from '@/components/rooms/PartnersSection';
import JoinSection from '@/components/rooms/JoinSection';
import RoomsFooterCTA from '@/components/rooms/RoomsFooterCTA';

export default function MissionRooms() {
  return (
    <div className="min-h-screen bg-[#050d1a]">
      <RoomsHero />
      <CadenceSection />
      <PrinciplesSection />
      <BuildStreamsSection />
      <TribeSection />
      <PartnersSection />
      <JoinSection />
      <RoomsFooterCTA />
    </div>
  );
}
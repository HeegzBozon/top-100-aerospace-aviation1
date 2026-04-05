import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Landing2Hero from '@/components/landing/Landing2Hero';
import HomeSectionReorderPopover, { loadSectionConfig, DEFAULT_SECTIONS } from '@/components/admin/HomeSectionReorderPopover';

// Home Sections
import IndustrySpotlight from '@/components/home/IndustrySpotlight';
import FeaturedToday from '@/components/home/FeaturedToday';
import TrendingPrograms from '@/components/home/TrendingPrograms';
import TrendingTalent from '@/components/home/TrendingTalent';
import CommunityFavorites from '@/components/home/CommunityFavorites';
import UpcomingMissions from '@/components/home/UpcomingMissions';
import TopPrograms from '@/components/home/TopPrograms';
import DomainExplorer from '@/components/home/DomainExplorer';
import TopOriginals from '@/components/home/TopOriginals';
import MissionControlHeader from '@/components/home/MissionControlHeader';

const SECTION_COMPONENTS = {
  missionControl: MissionControlHeader,
  spotlight: IndustrySpotlight,
  featured: FeaturedToday,
  programs: TrendingPrograms,
  talent: TrendingTalent,
  favorites: CommunityFavorites,
  missions: UpcomingMissions,
  topPrograms: TopPrograms,
  domain: DomainExplorer,
  originals: TopOriginals,
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [sectionConfig, setSectionConfig] = useState(DEFAULT_SECTIONS.map(s => ({ ...s, visible: true })));

  useEffect(() => {
    const fetchUserAndConfig = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        const config = loadSectionConfig(currentUser);
        if (config) {
          setSectionConfig(config);
        }
      } catch (err) {
        setUser(null);
        const config = loadSectionConfig(null);
        if (config) setSectionConfig(config);
      }
    };
    fetchUserAndConfig();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24">
      <Landing2Hero user={user} />
      
      <div className="flex flex-col gap-6 md:gap-10 mt-6 md:mt-10">
        {sectionConfig.filter(s => s.visible).map(section => {
          const Component = SECTION_COMPONENTS[section.id];
          if (!Component) return null;
          return <Component key={section.id} />;
        })}
      </div>

      <HomeSectionReorderPopover 
        isAdmin={user?.role === 'admin'} 
        user={user} 
        onConfigChange={setSectionConfig} 
      />
    </div>
  );
}
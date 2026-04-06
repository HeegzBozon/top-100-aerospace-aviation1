import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/home-v2/HeroSection';
import InfrastructureGapSection from '@/components/home-v2/InfrastructureGapSection';
import MissionBriefSection from '@/components/home-v2/MissionBriefSection';
import TalentShowcaseSection from '@/components/home-v2/TalentShowcaseSection';
import ClosingCTA from '@/components/home-v2/ClosingCTA';

export default function HomeV2() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf8f5' }}>
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a87c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5efe8 40%, #faf8f5 100%)' }}>
      <div className="max-w-[1400px] mx-auto px-0 md:px-5 pt-2 pb-4">
        <HeroSection user={user} />
        <MissionBriefSection />
        <InfrastructureGapSection />
        <TalentShowcaseSection />
        <ClosingCTA />

        {/* Footer signature */}
        <footer className="text-center py-8 border-t border-slate-200/60 mt-4">
          <p className="text-[#c9a87c] font-bold tracking-widest uppercase text-[10px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Top 100 Aerospace & Aviation • The Perception Engine
          </p>
        </footer>
      </div>
    </div>
  );
}
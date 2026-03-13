import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { Sponsor } from '@/entities/Sponsor';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Dashboard Components
import HeroHeader from '@/components/home/HeroHeader';
import FirstTimeUserWelcome from '@/components/FirstTimeUserWelcome';
import MissingProfilePhotoPrompt from '@/components/MissingProfilePhotoPrompt';
import { Season3Onboarding } from '@/components/capabilities/onboarding';
import { DashboardOverview } from '@/components/epics/04-project-containers/dashboard';
import { PassportView } from '@/components/epics/04-project-containers/dashboard';

const brandColors = {
  navyDeep: '#1e3a5a',
  cream: '#faf8f5',
};

export default function Passport() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSeason3Onboarding, setShowSeason3Onboarding] = useState(false);
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      if (!currentUser.onboarding_completed) {
        setShowWelcome(true);
      } else if (!currentUser.seen_season3_onboarding) {
        setShowSeason3Onboarding(true);
      }

      // Load sponsors
      const sponsorList = await Sponsor.list('-created_date', 4);
      setSponsors(sponsorList);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploaded = (newAvatarUrl) => {
    setUser(prev => ({ ...prev, avatar_url: newAvatarUrl }));
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    loadUserAndData();
  };

  const handleSeason3Complete = () => {
    setShowSeason3Onboarding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <FirstTimeUserWelcome user={user} onComplete={handleWelcomeComplete} />
      )}

      {showSeason3Onboarding && (
        <Season3Onboarding 
          onComplete={handleSeason3Complete} 
          onSkip={handleSeason3Complete} 
        />
      )}

      {!showWelcome && (
        <div className="min-h-screen p-2 md:p-6 lg:p-8" style={{ background: brandColors.cream }}>
          <div className="max-w-6xl mx-auto space-y-3 md:space-y-6">
            {/* Top Messages */}
            <MissingProfilePhotoPrompt user={user} onPhotoUploaded={handlePhotoUploaded} />

            {/* Hero Header */}
            <HeroHeader user={user} onUpdate={loadUserAndData} />

            {/* Mobile: Single column, Desktop: 3-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
              {/* Main Content - Full width on mobile, 2 cols on desktop */}
              <div className="lg:col-span-2 space-y-3 md:space-y-6">
                <DashboardOverview user={user} />
              </div>

              {/* Sidebar Content - Below main on mobile */}
              <div className="lg:col-span-1 space-y-3 md:space-y-6">
                <PassportView user={user} setUser={setUser} />
              </div>
            </div>

            {/* Footer Spacing for bottom nav */}
            <div className="h-16 md:h-12" />
          </div>
        </div>
      )}
    </>
  );
}
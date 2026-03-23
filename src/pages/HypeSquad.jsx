import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Nominee } from '@/entities/Nominee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// HypeSquad Components
import HypeScoreRing from '@/components/hypesquad/HypeScoreRing';
import HypeLevelBadge from '@/components/hypesquad/HypeLevelBadge';
import ProfileCompletionChecklist from '@/components/hypesquad/ProfileCompletionChecklist';
import AmbassadorStats from '@/components/hypesquad/AmbassadorStats';
import LevelProgressCard from '@/components/hypesquad/LevelProgressCard';
import SocialShareTools from '@/components/hypesquad/SocialShareTools';
import WeeklyMissions from '@/components/hypesquad/WeeklyMissions';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

function calculateHypeScore(user, nominee) {
  let score = 0;
  
  // Profile Completion (20%)
  const profileChecks = [
    !!user?.full_name,
    !!user?.avatar_url,
    !!user?.headline,
    user?.bio?.length > 50,
    !!user?.location,
    !!user?.linkedin_url,
    user?.expertise_tags?.length > 0,
    !!nominee,
  ];
  const profileCompletion = (profileChecks.filter(Boolean).length / profileChecks.length) * 100;
  score += (profileCompletion / 100) * 20;
  
  // Engagement Contributions (25%)
  const engagementScore = Math.min(((user?.nominations_made || 0) * 5 + (user?.hype_missions_completed || 0) * 3), 25);
  score += engagementScore;
  
  // Ambassador Activity (25%)
  const ambassadorScore = Math.min(((user?.shares_count || 0) * 2 + (user?.referrals_count || 0) * 5), 25);
  score += ambassadorScore;
  
  // Influence Metrics (20%)
  const influenceScore = Math.min((user?.votes_influenced || 0) * 2, 20);
  score += influenceScore;
  
  // Community Impact (10%)
  const communityScore = Math.min((user?.weekly_engagement_streak || 0) * 2, 10);
  score += communityScore;
  
  return Math.round(Math.min(score, 100));
}

function determineLevel(user, profileCompletion) {
  const shares = user?.shares_count || 0;
  const streak = user?.weekly_engagement_streak || 0;
  
  if (profileCompletion >= 100 && shares >= 50 && streak >= 8) return 'elite_vanguard';
  if (profileCompletion >= 100 && shares >= 15 && streak >= 4) return 'champion';
  if (profileCompletion >= 80 && shares >= 5 && streak >= 2) return 'ambassador';
  if (profileCompletion >= 40 && shares >= 1) return 'hype_agent';
  return 'recruit';
}

export default function HypeSquad() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hypeScore, setHypeScore] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Find claimed nominee
      if (currentUser.email) {
        const nominees = await Nominee.filter({ claimed_by_user_email: currentUser.email });
        if (nominees.length > 0) {
          setNominee(nominees[0]);
        }
      }

      // Calculate scores
      const profileChecks = [
        !!currentUser?.full_name,
        !!currentUser?.avatar_url,
        !!currentUser?.headline,
        currentUser?.bio?.length > 50,
        !!currentUser?.location,
        !!currentUser?.linkedin_url,
        currentUser?.expertise_tags?.length > 0,
        nominees?.length > 0,
      ];
      const completion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100);
      setProfileCompletion(completion);
      
      const score = calculateHypeScore(currentUser, nominees?.[0]);
      setHypeScore(score);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: brandColors.navyDeep }} />
      </div>
    );
  }

  const currentLevel = user?.hype_level || determineLevel(user, profileCompletion);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hero Header */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div 
            className="p-6 md:p-8"
            style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2c4a6e 100%)` }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <HypeScoreRing score={hypeScore} size={140} strokeWidth={10} />
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <Users className="w-6 h-6 text-white/80" />
                  <h1 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    HypeSquad
                  </h1>
                </div>
                <p className="text-white/70 mb-4 max-w-lg">
                  Build your personal brand, become a TOP 100 ambassador, and earn exclusive rewards for growing our community.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <HypeLevelBadge level={currentLevel} size="lg" />
                </div>
              </div>
              <div className="hidden md:block">
                <Link to={createPageUrl('HypeSquadWizard')}>
                  <Button 
                    size="lg"
                    className="gap-2"
                    style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
                  >
                    <Rocket className="w-5 h-5" />
                    Start Mission
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Mobile CTA */}
        <div className="md:hidden">
          <Link to={createPageUrl('HypeSquadWizard')}>
            <Button 
              size="lg"
              className="w-full gap-2"
              style={{ background: brandColors.goldPrestige, color: brandColors.navyDeep }}
            >
              <Rocket className="w-5 h-5" />
              Start Mission
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Ambassador Stats */}
        <AmbassadorStats user={user} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6">
            <LevelProgressCard 
              currentLevel={currentLevel} 
              profileCompletion={profileCompletion}
              user={user}
            />
            <SocialShareTools user={user} nominee={nominee} />
          </div>

          {/* Right Column - Checklist & Missions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg" style={{ color: brandColors.navyDeep }}>
                  Profile Completion
                </CardTitle>
                <CardDescription>
                  Complete your profile to unlock higher levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileCompletionChecklist user={user} nominee={nominee} />
              </CardContent>
            </Card>
            
            <WeeklyMissions user={user} completedMissions={[]} />
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Share2,
  Vote,
  User as UserIcon
} from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const WEEKLY_MISSIONS = [
  {
    id: 'share_profile',
    title: 'Share Your Profile',
    description: 'Share your profile on any social platform',
    icon: Share2,
    reward: 10,
    rewardType: 'stardust',
    link: null, // handled in-page
  },
  {
    id: 'cast_vote',
    title: 'Cast a Vote',
    description: 'Participate in pairwise or ranked voting',
    icon: Vote,
    reward: 15,
    rewardType: 'stardust',
    link: 'Arena',
  },
  {
    id: 'complete_profile',
    title: 'Complete Profile Section',
    description: 'Fill in a missing profile field',
    icon: UserIcon,
    reward: 5,
    rewardType: 'stardust',
    link: 'Home?tab=profile',
  },
  {
    id: 'spotlight_nominee',
    title: 'Spotlight Someone',
    description: 'Give a spotlight vote to a deserving nominee',
    icon: Sparkles,
    reward: 20,
    rewardType: 'stardust',
    link: 'Arena',
  },
];

export default function WeeklyMissions({ user, completedMissions = [] }) {
  return (
    <Card className="border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: brandColors.navyDeep }}>
          <Target className="w-5 h-5" />
          Weekly Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {WEEKLY_MISSIONS.map((mission) => {
          const isComplete = completedMissions.includes(mission.id);
          const Icon = mission.icon;
          
          return (
            <div 
              key={mission.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isComplete 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isComplete ? 'bg-green-100' : 'bg-slate-100'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-medium ${isComplete ? 'text-green-800 line-through' : 'text-slate-800'}`}>
                    {mission.title}
                  </div>
                  <div className="text-xs text-slate-500">{mission.description}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ 
                    background: `${brandColors.goldPrestige}20`,
                    color: brandColors.navyDeep 
                  }}
                >
                  +{mission.reward} ✨
                </span>
                {!isComplete && mission.link && (
                  <Link to={createPageUrl(mission.link)}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 text-center">
          <span className="text-xs text-slate-500">
            Missions reset every Monday at midnight
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
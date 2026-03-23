import { Card, CardContent } from '@/components/ui/card';
import { Share2, Users, Vote, Award, Flame, Target } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function AmbassadorStats({ user }) {
  const stats = [
    { 
      icon: Share2, 
      label: 'Shares', 
      value: user?.shares_count || 0,
      color: brandColors.skyBlue
    },
    { 
      icon: Users, 
      label: 'Referrals', 
      value: user?.referrals_count || 0,
      color: brandColors.navyDeep
    },
    { 
      icon: Vote, 
      label: 'Nominations', 
      value: user?.nominations_made || 0,
      color: brandColors.goldPrestige
    },
    { 
      icon: Target, 
      label: 'Votes Influenced', 
      value: user?.votes_influenced || 0,
      color: '#7c3aed'
    },
    { 
      icon: Flame, 
      label: 'Weekly Streak', 
      value: user?.weekly_engagement_streak || 0,
      color: '#ea580c'
    },
    { 
      icon: Award, 
      label: 'Missions Done', 
      value: user?.hype_missions_completed || 0,
      color: '#059669'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: brandColors.navyDeep }}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
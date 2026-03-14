import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Lock, Check } from 'lucide-react';
import HypeLevelBadge, { LEVELS } from './HypeLevelBadge';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const LEVEL_ORDER = ['recruit', 'hype_agent', 'ambassador', 'champion', 'elite_vanguard'];

const LEVEL_REQUIREMENTS = {
  recruit: { profile: 0, shares: 0, streak: 0 },
  hype_agent: { profile: 40, shares: 1, streak: 0 },
  ambassador: { profile: 80, shares: 5, streak: 2 },
  champion: { profile: 100, shares: 15, streak: 4 },
  elite_vanguard: { profile: 100, shares: 50, streak: 8 },
};

export default function LevelProgressCard({ currentLevel, profileCompletion, user }) {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);
  const nextLevel = LEVEL_ORDER[currentIndex + 1];
  const nextReqs = nextLevel ? LEVEL_REQUIREMENTS[nextLevel] : null;

  const currentReqs = nextReqs ? [
    { label: 'Profile Completion', current: profileCompletion, target: nextReqs.profile, unit: '%' },
    { label: 'Social Shares', current: user?.shares_count || 0, target: nextReqs.shares, unit: '' },
    { label: 'Weekly Streak', current: user?.weekly_engagement_streak || 0, target: nextReqs.streak, unit: ' weeks' },
  ] : [];

  return (
    <Card className="border-0 shadow-md bg-white overflow-hidden">
      <CardHeader className="pb-3" style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #2c4a6e 100%)` }}>
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <span>Level Progress</span>
          <HypeLevelBadge level={currentLevel} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Level Timeline */}
        <div className="flex items-center justify-between px-2">
          {LEVEL_ORDER.map((level, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isLocked = index > currentIndex;
            const Icon = LEVELS[level].icon;
            
            return (
              <React.Fragment key={level}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isComplete 
                        ? 'bg-green-100 border-green-500' 
                        : isCurrent 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isCurrent ? 'text-amber-600' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${isCurrent ? 'font-semibold text-amber-700' : 'text-slate-500'}`}>
                    {LEVELS[level].label.split(' ')[0]}
                  </span>
                </div>
                {index < LEVEL_ORDER.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Next Level Requirements */}
        {nextLevel && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-sm font-medium text-slate-700 mb-3">
              To unlock <span className="font-bold">{LEVELS[nextLevel].label}</span>:
            </div>
            <div className="space-y-2">
              {currentReqs.map((req) => {
                const progress = Math.min((req.current / req.target) * 100, 100);
                const isComplete = req.current >= req.target;
                
                return (
                  <div key={req.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isComplete ? 'text-green-700' : 'text-slate-600'}>
                        {req.label}
                      </span>
                      <span className={isComplete ? 'text-green-700 font-medium' : 'text-slate-600'}>
                        {req.current}{req.unit} / {req.target}{req.unit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!nextLevel && (
          <div className="text-center p-4 rounded-lg" style={{ background: `${brandColors.goldPrestige}20` }}>
            <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
              🏆 You've reached the highest level!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
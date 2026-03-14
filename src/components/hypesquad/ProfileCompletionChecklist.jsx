import React from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function ProfileCompletionChecklist({ user, nominee }) {
  const checks = [
    { 
      id: 'name', 
      label: 'Display Name', 
      complete: !!user?.full_name,
      link: 'Home?tab=profile'
    },
    { 
      id: 'avatar', 
      label: 'Profile Photo', 
      complete: !!user?.avatar_url,
      link: 'Home?tab=profile'
    },
    { 
      id: 'headline', 
      label: 'Professional Headline', 
      complete: !!user?.headline,
      link: 'Home?tab=profile'
    },
    { 
      id: 'bio', 
      label: 'Biography (50+ chars)', 
      complete: user?.bio?.length > 50,
      link: 'Home?tab=profile'
    },
    { 
      id: 'location', 
      label: 'Location', 
      complete: !!user?.location,
      link: 'Home?tab=profile'
    },
    { 
      id: 'linkedin', 
      label: 'LinkedIn Profile', 
      complete: !!user?.linkedin_url,
      link: 'Home?tab=profile'
    },
    { 
      id: 'expertise', 
      label: 'Expertise Tags', 
      complete: user?.expertise_tags?.length > 0,
      link: 'Home?tab=profile'
    },
    { 
      id: 'nominee_claimed', 
      label: 'Nominee Profile Claimed', 
      complete: !!nominee,
      link: 'ClaimProfile'
    },
  ];

  const completedCount = checks.filter(c => c.complete).length;
  const percentage = Math.round((completedCount / checks.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
          {completedCount} of {checks.length} complete
        </span>
        <span 
          className="text-sm font-bold"
          style={{ color: percentage >= 80 ? brandColors.goldPrestige : brandColors.navyDeep }}
        >
          {percentage}%
        </span>
      </div>
      
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            background: percentage >= 80 
              ? `linear-gradient(90deg, ${brandColors.goldPrestige}, #e8d4b8)`
              : brandColors.navyDeep
          }}
        />
      </div>

      <div className="space-y-2 mt-4">
        {checks.map((check) => (
          <div 
            key={check.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              check.complete 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {check.complete ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              <span className={check.complete ? 'text-green-800' : 'text-slate-700'}>
                {check.label}
              </span>
            </div>
            {!check.complete && (
              <Link to={createPageUrl(check.link)}>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Complete <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
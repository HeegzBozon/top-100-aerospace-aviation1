import React from 'react';
import { Card } from '@/components/ui/card';
import { Rocket, Plane, Globe, GraduationCap, Scale, Briefcase, Microscope, Heart } from 'lucide-react';
import { BRAND_COLORS } from '@/components/core/brandConstants';
import { createPageUrl } from '@/utils';

const DOMAINS = [
  { id: 'space', label: 'Space', icon: Rocket, color: 'text-blue-600' },
  { id: 'aviation', label: 'Aviation', icon: Plane, color: 'text-sky-600' },
  { id: 'aerospace', label: 'Aerospace', icon: Globe, color: 'text-purple-600' },
  { id: 'academia', label: 'Academia & Education', icon: GraduationCap, color: 'text-indigo-600' },
  { id: 'policy', label: 'Policy, Law & Governance', icon: Scale, color: 'text-slate-700' },
  { id: 'business', label: 'Consulting, Business & Non-Profit', icon: Briefcase, color: 'text-amber-600' },
  { id: 'stem', label: 'STEM & Science Communication', icon: Microscope, color: 'text-green-600' },
  { id: 'healthcare', label: 'Healthcare & Medical Research', icon: Heart, color: 'text-red-600' },
];

export default function DomainExplorer() {
  const handleDomainClick = (domain) => {
    window.location.href = createPageUrl('NomineesByDomain', `domain=${domain.label}`);
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-slate-900" style={{ color: BRAND_COLORS.navyDeep }}>Explore by Domain</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {DOMAINS.map(domain => {
          const Icon = domain.icon;
          return (
            <Card 
              key={domain.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer text-center border-t-4" 
              style={{ borderTopColor: BRAND_COLORS.goldLight }}
              onClick={() => handleDomainClick(domain)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleDomainClick(domain)}
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${domain.color}`} />
              <p className="text-sm font-semibold text-slate-900">{domain.label}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
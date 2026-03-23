import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Briefcase, TrendingUp, Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  roseAccent: '#d4a574',
  cream: '#faf8f5',
};

const SENIORITY_DATA = [
  { label: 'Senior', percentage: 30.7 },
  { label: 'Entry', percentage: 23.6 },
  { label: 'Director', percentage: 8.9 },
  { label: 'CXO', percentage: 7.0 },
  { label: 'Manager', percentage: 6.7 },
  { label: 'VP', percentage: 5.2 },
  { label: 'Partner', percentage: 4.1 },
  { label: 'Owner', percentage: 3.8 },
];

const INDUSTRIES_DATA = [
  { label: 'Aviation and Aerospace Component Manufacturing', percentage: 22.5 },
  { label: 'Airlines and Aviation', percentage: 15.4 },
  { label: 'Defense and Space Manufacturing', percentage: 5.2 },
  { label: 'Space Research and Technology', percentage: 4.0 },
  { label: 'IT Services and IT Consulting', percentage: 3.3 },
  { label: 'Higher Education', percentage: 2.8 },
  { label: 'Government Administration', percentage: 2.5 },
  { label: 'Venture Capital and Private Equity', percentage: 2.1 },
];

const JOB_TITLES_DATA = [
  { label: 'Founder', percentage: 3.3 },
  { label: 'Chief Executive Officer', percentage: 2.3 },
  { label: 'President', percentage: 1.4 },
  { label: 'Co-Founder', percentage: 1.2 },
  { label: 'System Engineer', percentage: 1.2 },
  { label: 'Aerospace Engineer', percentage: 1.1 },
  { label: 'Director of Engineering', percentage: 1.0 },
  { label: 'Program Manager', percentage: 0.9 },
];

function DemographicBar({ label, percentage, maxPercentage }) {
  const widthPercent = (percentage / maxPercentage) * 100;
  
  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-medium text-sm" style={{ color: brandColors.navyDeep }}>
          {label}
        </span>
        <span className="text-sm" style={{ color: brandColors.navyDeep, opacity: 0.7 }}>
          {percentage}%
        </span>
      </div>
      <div className="h-2 rounded-full" style={{ background: `${brandColors.navyDeep}15` }}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${widthPercent}%`,
            background: `linear-gradient(90deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`
          }}
        />
      </div>
    </div>
  );
}

function DemographicsCard({ title, data, icon: Icon }) {
  const maxPercentage = Math.max(...data.map(d => d.percentage));
  
  return (
    <Card className="bg-white" style={{ border: `1px solid ${brandColors.navyDeep}10` }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
          <Icon className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.map((item, idx) => (
          <DemographicBar 
            key={idx}
            label={item.label}
            percentage={item.percentage}
            maxPercentage={maxPercentage}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function Demographics() {
  const [activeView, setActiveView] = useState('all');

  const VIEWS = [
    { id: 'all', label: 'All Demographics' },
    { id: 'seniority', label: 'Seniority' },
    { id: 'industries', label: 'Industries' },
    { id: 'titles', label: 'Job Titles' },
  ];

  return (
    <div className="min-h-screen" style={{ background: brandColors.cream }}>
      {/* Hero Section */}
      <div 
        className="py-16 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, ${brandColors.skyBlue} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8" style={{ color: brandColors.goldPrestige }} />
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Subscriber Demographics
            </h1>
          </div>
          <p className="text-white/80 max-w-2xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Understanding our community of aerospace and aviation professionals across 30+ countries
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Subscribers', value: '12,500+', icon: Users },
            { label: 'Countries', value: '30+', icon: Globe },
            { label: 'Industries', value: '15+', icon: Building2 },
            { label: 'Avg. Seniority', value: 'Senior', icon: TrendingUp },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white shadow-lg" style={{ border: `1px solid ${brandColors.goldPrestige}30` }}>
              <CardContent className="p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: brandColors.goldPrestige }} />
                <div className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>{stat.value}</div>
                <div className="text-xs" style={{ color: brandColors.navyDeep, opacity: 0.6 }}>{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2"
              style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
            >
              {VIEWS.find(v => v.id === activeView)?.label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VIEWS.map(view => (
              <DropdownMenuItem key={view.id} onClick={() => setActiveView(view.id)}>
                {view.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Demographics Cards */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeView === 'all' || activeView === 'seniority') && (
            <DemographicsCard 
              title="Seniority Level" 
              data={SENIORITY_DATA} 
              icon={TrendingUp}
            />
          )}
          {(activeView === 'all' || activeView === 'industries') && (
            <DemographicsCard 
              title="Industries" 
              data={INDUSTRIES_DATA} 
              icon={Building2}
            />
          )}
          {(activeView === 'all' || activeView === 'titles') && (
            <DemographicsCard 
              title="Job Titles" 
              data={JOB_TITLES_DATA} 
              icon={Briefcase}
            />
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <Card 
          className="p-8 text-center"
          style={{ 
            background: `linear-gradient(135deg, ${brandColors.goldPrestige}15, ${brandColors.roseAccent}15)`,
            border: `1px solid ${brandColors.goldPrestige}40`
          }}
        >
          <h3 className="text-xl font-bold mb-2" style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}>
            Want to reach this audience?
          </h3>
          <p className="text-sm mb-4" style={{ color: brandColors.navyDeep, opacity: 0.7, fontFamily: "'Montserrat', sans-serif" }}>
            Partner with TOP 100 to connect with aerospace and aviation decision-makers
          </p>
          <Button 
            className="text-white"
            style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.roseAccent})` }}
          >
            Become a Sponsor
          </Button>
        </Card>
      </div>
    </div>
  );
}
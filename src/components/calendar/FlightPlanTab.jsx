import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, Vote, Trophy, Users, Megaphone, CheckCircle2, Clock, ArrowRight, Heart, Rocket } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const MILESTONES = [
  {
    id: 1,
    date: 'December 12, 2025',
    title: 'Final Round of Voting',
    objective: 'Complete Season 3 voting with maximum community participation',
    icon: Vote,
    status: 'completed',
    highlight: true,
    keyResults: [
      { label: 'Ranked Choice votes collected', target: '500+', achieved: true },
      { label: 'Voter turnout rate', target: '60%', achieved: true },
      { label: 'Final rankings calculated', target: 'Complete', achieved: true },
    ],
  },
  {
    id: 2,
    date: 'End of 2025',
    title: 'Publication & Season 4 Launch',
    objective: 'Publish TOP 100 list and launch Season 4 nominations for Women and Men',
    icon: Trophy,
    status: 'completed',
    highlight: true,
    keyResults: [
      { label: 'TOP 100 Women 2025 list published', target: 'Complete', achieved: true },
      { label: 'Season 4 nominations opened', target: 'Live', achieved: true },
      { label: 'Press coverage secured', target: '5+ outlets', achieved: true },
    ],
  },
  {
    id: 3,
    date: 'Q1 2026',
    title: 'Nominations Phase',
    objective: 'Build the strongest nominee pool in aerospace & aviation history',
    icon: Users,
    status: 'upcoming',
    highlight: true,
    keyResults: [
      { label: 'Total nominations received', target: '1,000+', achieved: false },
      { label: 'Unique nominators', target: '500+', achieved: false },
      { label: 'Industry verticals covered', target: '8+', achieved: false },
    ],
  },
  {
    id: 'ff',
    date: 'Q1 2026',
    title: 'Friends & Family Fundraising Round',
    objective: 'Launch community-backed fundraise with exclusive perks',
    icon: Heart,
    status: 'future',
    highlight: true,
    keyResults: [
      { label: 'Fundraising campaign launched', target: 'Republic/StartEngine', achieved: false },
      { label: 'Collectibles & swag designed', target: 'Complete', achieved: false },
      { label: 'Community investors onboarded', target: '100+', achieved: false },
    ],
  },
  {
    id: 4,
    date: 'Q2 2026',
    title: 'Nominations & Voting',
    objective: 'Transition to voting while maintaining nomination momentum',
    icon: Megaphone,
    status: 'future',
    keyResults: [
      { label: 'Early voting rounds initiated', target: 'Live', achieved: false },
      { label: 'Nominee profiles completed', target: '90%', achieved: false },
      { label: 'Community engagement rate', target: '40%+', achieved: false },
    ],
  },
  {
    id: 5,
    date: 'Q3 2026',
    title: 'Voting Phase',
    objective: 'Execute fair and transparent community-driven rankings',
    icon: Vote,
    status: 'future',
    keyResults: [
      { label: 'Active voters', target: '2,000+', achieved: false },
      { label: 'Pairwise comparisons completed', target: '50,000+', achieved: false },
      { label: 'Voting integrity score', target: '99%+', achieved: false },
    ],
  },
  {
    id: 'seed',
    date: 'Q3 2026',
    title: 'Seed Fundraising Round',
    objective: 'Enable community ownership and scale platform growth',
    icon: Rocket,
    status: 'future',
    highlight: true,
    keyResults: [
      { label: 'Seed round closed', target: 'Target TBD', achieved: false },
      { label: 'Community shareholders', target: '500+', achieved: false },
      { label: 'Platform roadmap funded', target: '18 months', achieved: false },
    ],
  },
  {
    id: 6,
    date: 'Q4 2026',
    title: 'Season 4 Publication',
    objective: 'Publish definitive TOP 100 lists for Women and Men in Aerospace',
    icon: Trophy,
    status: 'future',
    keyResults: [
      { label: 'TOP 100 Women 2026 published', target: 'Complete', achieved: false },
      { label: 'TOP 100 Men 2026 published', target: 'Complete', achieved: false },
      { label: 'Media impressions', target: '1M+', achieved: false },
    ],
  },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  upcoming: { label: 'Upcoming', className: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  future: { label: 'Planned', className: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
};

function MilestoneCard({ milestone, index, isLast }) {
  const Icon = milestone.icon;
  const statusConfig = STATUS_CONFIG[milestone.status];
  const completedKRs = milestone.keyResults?.filter(kr => kr.achieved).length || 0;
  const totalKRs = milestone.keyResults?.length || 0;
  const progressPercent = totalKRs > 0 ? (completedKRs / totalKRs) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200" style={{ height: 'calc(100% - 2rem)' }} />
      )}
      
      <div className="flex gap-4">
        {/* Timeline dot */}
        <div className="relative z-10 shrink-0">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
              milestone.highlight ? 'ring-4 ring-offset-2' : ''
            }`}
            style={{ 
              background: milestone.status === 'completed' ? '#22c55e' : milestone.highlight ? brandColors.goldPrestige : 'white',
              ringColor: milestone.highlight ? `${brandColors.goldPrestige}40` : 'transparent',
            }}
          >
            {milestone.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <Icon className={`w-5 h-5 ${milestone.highlight ? 'text-white' : ''}`} style={{ color: milestone.highlight ? 'white' : brandColors.navyDeep }} />
            )}
          </div>
        </div>
        
        {/* Content */}
        <Card className={`flex-1 mb-6 border ${milestone.highlight ? 'border-2' : ''}`} style={{ borderColor: milestone.highlight ? brandColors.goldPrestige : undefined }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm font-semibold" style={{ color: brandColors.navyDeep }}>
                    {milestone.date}
                  </span>
                </div>
                <h3 className="font-bold text-lg" style={{ color: brandColors.navyDeep }}>
                  {milestone.title}
                </h3>
              </div>
              <Badge variant="outline" className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            
            {/* Objective */}
            <p className="text-sm text-slate-600 mb-3 italic">"{milestone.objective}"</p>
            
            {/* Progress bar */}
            {totalKRs > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Key Results</span>
                  <span>{completedKRs}/{totalKRs} achieved</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progressPercent}%`,
                      background: progressPercent === 100 ? '#22c55e' : brandColors.goldPrestige 
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Key Results */}
            {milestone.keyResults && (
              <div className="space-y-1.5">
                {milestone.keyResults.map((kr, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      kr.achieved ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {kr.achieved ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <span className={kr.achieved ? 'text-slate-600' : 'text-slate-500'}>
                      {kr.label}: <span className="font-medium">{kr.target}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default function FlightPlanTab() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: brandColors.navyDeep }}
          >
            <Plane className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          Flight Plan
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Our journey through the TOP 100 Aerospace & Aviation season. Mark your calendar for these key milestones.
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-8">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
            <span className="text-slate-600">{config.label}</span>
          </div>
        ))}
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {MILESTONES.map((milestone, index) => (
          <MilestoneCard 
            key={milestone.id} 
            milestone={milestone} 
            index={index}
            isLast={index === MILESTONES.length - 1}
          />
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8 p-6 rounded-xl"
        style={{ background: `${brandColors.goldPrestige}15` }}
      >
        <p className="text-sm font-medium" style={{ color: brandColors.navyDeep }}>
          Stay tuned for updates as we approach each milestone
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Dates are subject to change. Follow us for real-time announcements.
        </p>
      </motion.div>
    </div>
  );
}
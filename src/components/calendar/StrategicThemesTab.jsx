import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, TrendingUp, Sparkles, Target, Zap, Globe } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  cream: '#faf8f5',
};

const HORIZONS = [
  {
    id: 'h1',
    horizon: 'Horizon 1',
    title: 'Defend & Extend the Core',
    timeframe: 'Now – 12 months',
    icon: Target,
    color: brandColors.navyDeep,
    bgGradient: 'linear-gradient(135deg, #1e3a5a 0%, #2c4a6e 100%)',
    description: 'Optimize and scale current operations. Focus on efficiency, customer satisfaction, and market leadership in core business.',
    themes: [
      { name: 'Community Engagement Excellence', status: 'active' },
      { name: 'Voting Platform Optimization', status: 'active' },
      { name: 'Member Experience Enhancement', status: 'active' },
      { name: 'Sponsor Value Maximization', status: 'planned' },
    ],
    metrics: ['Community Growth Rate', 'Engagement Score', 'NPS'],
  },
  {
    id: 'h2',
    horizon: 'Horizon 2',
    title: 'Build Emerging Opportunities',
    timeframe: '12 – 36 months',
    icon: TrendingUp,
    color: brandColors.skyBlue,
    bgGradient: 'linear-gradient(135deg, #4a90b8 0%, #6ba8cc 100%)',
    description: 'Invest in adjacent markets and new capabilities. Scale successful pilots into sustainable revenue streams.',
    themes: [
      { name: 'Talent Exchange Marketplace', status: 'building' },
      { name: 'Global Chapter Expansion', status: 'building' },
      { name: 'Industry Certification Programs', status: 'planned' },
      { name: 'Strategic Partnership Network', status: 'planned' },
    ],
    metrics: ['New Revenue Streams', 'Market Expansion', 'Partnership Growth'],
  },
  {
    id: 'h3',
    horizon: 'Horizon 3',
    title: 'Create Future Options',
    timeframe: '36+ months',
    icon: Rocket,
    color: brandColors.goldPrestige,
    bgGradient: 'linear-gradient(135deg, #c9a87c 0%, #d4b896 100%)',
    description: 'Explore disruptive innovations and transformational opportunities. Plant seeds for long-term category leadership.',
    themes: [
      { name: 'AI-Powered Talent Matching', status: 'exploring' },
      { name: 'Virtual Reality Networking', status: 'exploring' },
      { name: 'Aerospace Innovation Lab', status: 'concept' },
      { name: 'Next-Gen Leadership Academy', status: 'concept' },
    ],
    metrics: ['Innovation Pipeline', 'R&D Initiatives', 'Future Readiness'],
  },
];

const STATUS_STYLES = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
  building: { label: 'Building', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  planned: { label: 'Planned', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  exploring: { label: 'Exploring', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  concept: { label: 'Concept', className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

function HorizonCard({ horizon, index }) {
  const Icon = horizon.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="relative"
    >
      {/* Timeline connector */}
      {index < HORIZONS.length - 1 && (
        <div 
          className="hidden lg:block absolute top-1/2 -right-8 w-16 h-0.5"
          style={{ background: `linear-gradient(90deg, ${horizon.color}, ${HORIZONS[index + 1].color})` }}
        />
      )}
      
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
        {/* Header */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ background: horizon.bgGradient }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <Icon className="w-full h-full" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium opacity-80">{horizon.horizon}</span>
            </div>
            <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {horizon.title}
            </h3>
            <Badge 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white text-xs"
            >
              {horizon.timeframe}
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <CardContent className="p-6 space-y-5" style={{ background: brandColors.cream }}>
          <p className="text-sm text-slate-600 leading-relaxed">
            {horizon.description}
          </p>
          
          {/* Strategic Themes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Strategic Themes
            </h4>
            <div className="space-y-2">
              {horizon.themes.map((theme, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100"
                >
                  <span className="text-sm font-medium text-slate-700">{theme.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${STATUS_STYLES[theme.status].className}`}
                  >
                    {STATUS_STYLES[theme.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          
          {/* Key Metrics */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Key Metrics
            </h4>
            <div className="flex flex-wrap gap-2">
              {horizon.metrics.map((metric, i) => (
                <Badge 
                  key={i}
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-600"
                >
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StrategicThemesTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" style={{ color: brandColors.goldPrestige }} />
          <span 
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: brandColors.goldPrestige }}
          >
            Escape Velocity Framework
          </span>
        </div>
        <h2 
          className="text-2xl font-bold mb-2"
          style={{ color: brandColors.navyDeep, fontFamily: "'Playfair Display', serif" }}
        >
          Three Horizons of Growth
        </h2>
        <p className="text-slate-600 text-sm">
          Our strategic roadmap balances defending current strengths while investing in future opportunities.
        </p>
      </div>
      
      {/* Timeline Indicator */}
      <div className="hidden lg:flex items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full" style={{ background: brandColors.navyDeep }} />
          <span>Now</span>
        </div>
        <div 
          className="flex-1 max-w-md h-1 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${brandColors.navyDeep}, ${brandColors.skyBlue}, ${brandColors.goldPrestige})` 
          }}
        />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Future</span>
          <div className="w-3 h-3 rounded-full" style={{ background: brandColors.goldPrestige }} />
        </div>
      </div>
      
      {/* Horizon Cards */}
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
        {HORIZONS.map((horizon, index) => (
          <HorizonCard key={horizon.id} horizon={horizon} index={index} />
        ))}
      </div>
      
      {/* Footer Note */}
      <div className="text-center pt-4">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <Globe className="w-3 h-3" />
          Based on Geoffrey Moore's "Escape Velocity" framework
        </p>
      </div>
    </div>
  );
}
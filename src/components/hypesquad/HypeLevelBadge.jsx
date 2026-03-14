import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Award, Crown, Sparkles } from 'lucide-react';

const LEVELS = {
  recruit: {
    label: 'Recruit',
    icon: Shield,
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Welcome to the squad!',
  },
  hype_agent: {
    label: 'Hype Agent',
    icon: Zap,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Building momentum',
  },
  ambassador: {
    label: 'Ambassador',
    icon: Award,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Community champion',
  },
  champion: {
    label: 'Champion',
    icon: Crown,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    description: 'Elite advocate',
  },
  elite_vanguard: {
    label: 'Elite Vanguard',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-900 border-amber-400',
    description: 'Top 1% contributor',
  },
};

export default function HypeLevelBadge({ level, showDescription = false, size = 'default' }) {
  const config = LEVELS[level] || LEVELS.recruit;
  const Icon = config.icon;

  const sizeClasses = size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm';

  return (
    <div className="flex flex-col items-start gap-1">
      <div className={`inline-flex items-center gap-2 rounded-full border ${config.color} ${sizeClasses}`}>
        <Icon className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span className="font-semibold">{config.label}</span>
      </div>
      {showDescription && (
        <span className="text-xs text-slate-500 ml-1">{config.description}</span>
      )}
    </div>
  );
}

export { LEVELS };
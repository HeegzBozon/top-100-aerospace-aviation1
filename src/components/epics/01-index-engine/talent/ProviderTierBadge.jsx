import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Shield, Crown, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TIER_CONFIG = {
  bronze: {
    label: 'Bronze',
    icon: Award,
    color: '#CD7F32',
    bg: '#CD7F3220',
    requirements: '0+ bookings'
  },
  silver: {
    label: 'Silver',
    icon: Shield,
    color: '#C0C0C0',
    bg: '#C0C0C020',
    requirements: '10+ bookings, 4.0+ rating'
  },
  gold: {
    label: 'Gold',
    icon: Star,
    color: '#FFD700',
    bg: '#FFD70020',
    requirements: '25+ bookings, 4.5+ rating'
  },
  platinum: {
    label: 'Platinum',
    icon: Crown,
    color: '#E5E4E2',
    bg: '#E5E4E220',
    requirements: '50+ bookings, 4.8+ rating, $5k+ earnings'
  }
};

const BADGE_CONFIG = {
  top_rated: { label: 'Top Rated', icon: Star, color: '#FFD700' },
  fast_responder: { label: 'Fast Responder', icon: Zap, color: '#3B82F6' },
  verified: { label: 'Verified', icon: Shield, color: '#22C55E' },
};

export default function ProviderTierBadge({ providerEmail, size = 'default' }) {
  const { data: tierData } = useQuery({
    queryKey: ['provider-tier', providerEmail],
    queryFn: async () => {
      const tiers = await base44.entities.ProviderTier.filter({ provider_email: providerEmail });
      return tiers[0] || { tier: 'bronze', badges: [] };
    },
    enabled: !!providerEmail
  });

  if (!tierData) return null;

  const config = TIER_CONFIG[tierData.tier] || TIER_CONFIG.bronze;
  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {/* Tier Badge */}
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              className={`gap-1 ${isSmall ? 'text-xs px-1.5 py-0.5' : ''}`}
              style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}40` }}
            >
              <Icon className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{config.label} Provider</p>
            <p className="text-xs text-slate-400">{config.requirements}</p>
          </TooltipContent>
        </Tooltip>

        {/* Achievement Badges */}
        {tierData.badges?.slice(0, 2).map((badgeKey) => {
          const badge = BADGE_CONFIG[badgeKey];
          if (!badge) return null;
          const BadgeIcon = badge.icon;
          return (
            <Tooltip key={badgeKey}>
              <TooltipTrigger>
                <div 
                  className={`rounded-full flex items-center justify-center ${isSmall ? 'w-5 h-5' : 'w-6 h-6'}`}
                  style={{ background: `${badge.color}20` }}
                >
                  <BadgeIcon className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} style={{ color: badge.color }} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{badge.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
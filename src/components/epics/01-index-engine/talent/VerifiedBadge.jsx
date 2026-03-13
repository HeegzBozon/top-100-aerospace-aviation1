import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
};

export default function VerifiedBadge({ type = 'provider', size = 'sm' }) {
  const configs = {
    provider: {
      label: 'Verified Provider',
      tooltip: 'This provider has been verified by TOP 100',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-200',
    },
    employer: {
      label: 'Verified Employer',
      tooltip: 'This employer has been verified by TOP 100',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    nominee: {
      label: 'TOP 100 Nominee',
      tooltip: 'This person is a verified TOP 100 Nominee',
      icon: CheckCircle,
      color: 'bg-amber-100 text-amber-700 border-amber-200',
    }
  };

  const config = configs[type] || configs.provider;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${config.color} ${sizeClasses[size]} font-medium cursor-help`}
          >
            <Icon className={`${iconSizes[size]} mr-1`} />
            {size !== 'xs' && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldCheck, Award, FileCheck, Briefcase } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

const verificationConfig = {
  identity: { icon: ShieldCheck, label: 'Identity Verified', color: '#22c55e' },
  credentials: { icon: Award, label: 'Credentials Verified', color: brandColors.goldPrestige },
  background: { icon: FileCheck, label: 'Background Checked', color: '#3b82f6' },
  portfolio: { icon: Briefcase, label: 'Portfolio Reviewed', color: '#8b5cf6' },
};

export default function ProviderVerificationBadge({ providerEmail, showAll = false }) {
  const { data: verifications = [] } = useQuery({
    queryKey: ['provider-verifications', providerEmail],
    queryFn: () => base44.entities.ProviderVerification.filter({ 
      provider_email: providerEmail,
      status: 'approved'
    }),
    enabled: !!providerEmail,
  });

  if (verifications.length === 0) return null;

  const displayVerifications = showAll 
    ? verifications 
    : verifications.slice(0, 2);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {displayVerifications.map((v) => {
          const config = verificationConfig[v.verification_type];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <Tooltip key={v.id}>
              <TooltipTrigger asChild>
                <div 
                  className="p-1 rounded-full"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Icon 
                    className="w-4 h-4" 
                    style={{ color: config.color }} 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{config.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {!showAll && verifications.length > 2 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className="text-xs h-6 px-1.5"
                style={{ borderColor: brandColors.navyDeep, color: brandColors.navyDeep }}
              >
                +{verifications.length - 2}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{verifications.length - 2} more verification{verifications.length - 2 > 1 ? 's' : ''}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Compact version for cards
export function VerifiedBadge({ providerEmail }) {
  const { data: verifications = [] } = useQuery({
    queryKey: ['provider-verifications-check', providerEmail],
    queryFn: () => base44.entities.ProviderVerification.filter({ 
      provider_email: providerEmail,
      status: 'approved'
    }),
    enabled: !!providerEmail,
  });

  if (verifications.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className="text-xs gap-1"
            style={{ backgroundColor: '#22c55e', color: 'white' }}
          >
            <ShieldCheck className="w-3 h-3" />
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{verifications.length} verification{verifications.length > 1 ? 's' : ''} approved</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
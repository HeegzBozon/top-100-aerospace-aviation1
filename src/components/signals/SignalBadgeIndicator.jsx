import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, BookOpen, Newspaper, Zap } from 'lucide-react';

const typeConfig = {
  patent: { icon: Award, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  publication: { icon: BookOpen, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  media_mention: { icon: Newspaper, color: 'bg-orange-100 text-orange-700 border-orange-300' },
  citation: { icon: Zap, color: 'bg-green-100 text-green-700 border-green-300' },
};

/**
 * Compact signal badge for leaderboard/standings
 * Shows total signal count with optional type breakdown
 */
export default function SignalBadgeIndicator({ nomineeId, showBreakdown = false }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.SignalCard.filter(
          { nominee_id: nomineeId },
          null,
          100
        );
        setSignals(data || []);
      } catch {
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nomineeId]);

  if (loading || signals.length === 0) {
    return null;
  }

  const counts = {
    patent: signals.filter(s => s.signal_type === 'patent').length,
    publication: signals.filter(s => s.signal_type === 'publication').length,
    media_mention: signals.filter(s => s.signal_type === 'media_mention').length,
    citation: signals.filter(s => s.signal_type === 'citation').length,
  };

  const total = signals.length;

  if (showBreakdown) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(counts).map(([type, count]) => {
          if (count === 0) return null;
          const Icon = typeConfig[type].icon;
          return (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={`${typeConfig[type].color} border cursor-help text-xs py-0.5`}>
                    <Icon className="w-3 h-3 mr-0.5" />
                    {count}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{type.replace('_', ' ')}: {count}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-help text-xs py-0.5">
            <Zap className="w-3 h-3 mr-1" />
            {total} signals
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-medium">{total} impact signal{total !== 1 ? 's' : ''}</p>
            {counts.patent > 0 && <p>Patents: {counts.patent}</p>}
            {counts.publication > 0 && <p>Research: {counts.publication}</p>}
            {counts.media_mention > 0 && <p>Media: {counts.media_mention}</p>}
            {counts.citation > 0 && <p>Citations: {counts.citation}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
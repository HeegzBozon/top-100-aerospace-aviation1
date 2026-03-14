import React, { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import RefreshCountdown from './RefreshCountdown';

const StandingsHeader = memo(({
  seasons,
  activeSeason,
  onSeasonChange,
  searchTerm,
  onSearchChange,
  showRefreshCountdown,
}) => {
  return (
    <div className="p-4 bg-[var(--card)]/50 backdrop-blur-md rounded-2xl border border-[var(--border)] mb-6 sticky top-20 z-30">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <Select value={activeSeason?.id} onValueChange={onSeasonChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a season..." />
            </SelectTrigger>
            <SelectContent>
              {seasons && seasons.map(season => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <Input
            placeholder="Search nominees..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <RefreshCountdown isActive={showRefreshCountdown} />
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
});

StandingsHeader.displayName = 'StandingsHeader';

export default StandingsHeader;
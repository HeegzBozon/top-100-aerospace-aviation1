import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Star, LayoutGrid, List } from 'lucide-react';

export default function LeaderboardControls({
  activeTab,
  setActiveTab,
  activeView,
  setActiveView,
  seasons,
  selectedSeason,
  onSeasonChange
}) {
  return (
    <div className="bg-[var(--card)] backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === 'nominees' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('nominees')}
          className="gap-2"
        >
          <Star className="w-4 h-4" /> Nominees
        </Button>
        <Button
          variant={activeTab === 'users' ? 'secondary' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="gap-2"
        >
          <Users className="w-4 h-4" /> Users
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {activeTab === 'nominees' && (
          <Select value={selectedSeason || ''} onValueChange={onSeasonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map(season => (
                <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {activeTab === 'nominees' && (
          <div className="flex items-center rounded-lg bg-black/10 p-1">
            <Button
              size="icon"
              variant={activeView === 'grid' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={activeView === 'standings' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('standings')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
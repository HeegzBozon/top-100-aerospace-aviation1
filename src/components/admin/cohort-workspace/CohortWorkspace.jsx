import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, BarChart3, FileText, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import NominationsPhase from './NominationsPhase';
import SelectionPhase from './SelectionPhase';
import EditorialPhase from './EditorialPhase';
import WorkspaceEmptyState from './WorkspaceEmptyState';

// season.status → default phase tab
export const STATUS_PHASE = {
  planning: 'nominate',
  rollover: 'nominate',
  nominations_open: 'nominate',
  voting_open: 'selection',
  review: 'selection',
  completed: 'editorial',
  archived: 'editorial',
};

const fmt = (d) => (d ? format(new Date(d), 'MMM d, yyyy') : '—');

export default function CohortWorkspace({ phase, season, seasons, onNavigate, onSeasonsUpdate }) {
  const [activePhase, setActivePhase] = useState(phase || STATUS_PHASE[season?.status] || 'nominate');

  if (!season) {
    return <WorkspaceEmptyState onNavigate={onNavigate} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Cohort masthead */}
      <header className="rounded-2xl bg-editorial-navy text-white px-6 py-6 md:px-8 border-b-2 border-editorial-copper">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold font-bold">Cohort Workspace</p>
            <h2 className="font-heading text-3xl mt-1 truncate">{season.cohort_label || season.name}</h2>
            <p className="text-sm text-white/60 mt-1">
              {season.name} · <span className="capitalize">{(season.status || '').replace(/_/g, ' ')}</span>
              {' · '}nominations {fmt(season.nomination_start)}–{fmt(season.nomination_end)}
              {' · '}voting {fmt(season.voting_start)}–{fmt(season.voting_end)}
            </p>
          </div>
          <Button variant="ghost" onClick={() => onNavigate?.('seasons')} className="text-white hover:bg-white/10 shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> All cohorts
          </Button>
        </div>
      </header>

      <Tabs value={activePhase} onValueChange={setActivePhase}>
        <TabsList className="bg-editorial-cream">
          <TabsTrigger value="nominate" className="gap-1.5"><Trophy className="w-3.5 h-3.5" /> Nominations</TabsTrigger>
          <TabsTrigger value="selection" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Selection</TabsTrigger>
          <TabsTrigger value="editorial" className="gap-1.5"><FileText className="w-3.5 h-3.5" /> Editorial</TabsTrigger>
        </TabsList>

        {/* Copper rule between phases — visual phase progression */}
        <div className="h-px bg-gradient-to-r from-transparent via-editorial-copper/40 to-transparent my-1" />

        <TabsContent value="nominate" className="mt-6">
          <NominationsPhase season={season} onSeasonsUpdate={onSeasonsUpdate} />
        </TabsContent>
        <TabsContent value="selection" className="mt-6">
          <SelectionPhase season={season} onNavigate={onNavigate} />
        </TabsContent>
        <TabsContent value="editorial" className="mt-6">
          <EditorialPhase season={season} onNavigate={onNavigate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
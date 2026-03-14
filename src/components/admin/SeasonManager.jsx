import React, { useState } from 'react';
import { Season } from '@/entities/Season';
import { Nominee } from '@/entities/Nominee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, formatDistanceToNowStrict } from 'date-fns';
import { 
  Plus, Calendar, Users, Vote, CheckCircle, Edit, Eye, Play, Square, 
  RotateCcw, Loader2, RefreshCw, Award, Copy, ExternalLink, ChevronDown, ChevronRight, Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import SeasonForm from './SeasonForm';
import SeasonTimeline from './SeasonTimeline';
import NomineeRolloverWizard from './NomineeRolloverWizard';
import SeasonNomineeManager from './SeasonNomineeManager';

const STATUS_CONFIG = {
  planning: { 
    label: 'Planning', 
    color: 'bg-gray-100 text-gray-800', 
    icon: Calendar,
    actions: [
      { label: 'Start Rollover', nextStatus: 'rollover', icon: RefreshCw, color: 'bg-blue-600 hover:bg-blue-700', requiresRollover: true },
      { label: 'Open Nominations', nextStatus: 'nominations_open', icon: Play, color: 'bg-green-600 hover:bg-green-700' },
    ]
  },
  rollover: { 
    label: 'Rollover Phase', 
    color: 'bg-blue-100 text-blue-800', 
    icon: RefreshCw,
    actions: [
      { label: 'Rollover Nominees', nextStatus: null, icon: RefreshCw, color: 'bg-blue-600 hover:bg-blue-700', requiresRollover: true },
      { label: 'Open Nominations', nextStatus: 'nominations_open', icon: Play, color: 'bg-green-600 hover:bg-green-700' },
      { label: '← Planning', nextStatus: 'planning', icon: RotateCcw, color: 'border-gray-400 text-gray-600 hover:bg-gray-50', variant: 'outline' },
    ]
  },
  nominations_open: { 
    label: 'Nominations Open', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Users,
    actions: [
      { label: 'Open Voting', nextStatus: 'voting_open', icon: Vote, color: 'bg-blue-600 hover:bg-blue-700', requiresValidation: true },
      { label: '← Rollover', nextStatus: 'rollover', icon: RotateCcw, color: 'border-gray-400 text-gray-600 hover:bg-gray-50', variant: 'outline' },
    ]
  },
  voting_open: { 
    label: 'Voting Open', 
    color: 'bg-green-100 text-green-800', 
    icon: Vote,
    actions: [
      { label: 'Start Review', nextStatus: 'review', icon: Award, color: 'bg-purple-600 hover:bg-purple-700' },
      { label: 'Close Season', nextStatus: 'completed', icon: Square, color: 'bg-red-600 hover:bg-red-700' },
      { label: '← Nominations', nextStatus: 'nominations_open', icon: RotateCcw, color: 'border-gray-400 text-gray-600 hover:bg-gray-50', variant: 'outline' },
    ]
  },
  review: { 
    label: 'Review Phase', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Award,
    actions: [
      { label: 'Complete Season', nextStatus: 'completed', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
      { label: '← Voting', nextStatus: 'voting_open', icon: RotateCcw, color: 'border-gray-400 text-gray-600 hover:bg-gray-50', variant: 'outline' },
    ]
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle,
    actions: [
      { label: 'Rollover Nominees', nextStatus: null, icon: RefreshCw, color: 'bg-blue-600 hover:bg-blue-700', requiresRollover: true },
      { label: 'Archive', nextStatus: 'archived', icon: Square, color: 'bg-gray-600 hover:bg-gray-700' },
      { label: 'Reopen', nextStatus: 'planning', icon: RotateCcw, color: 'border-amber-500 text-amber-600 hover:bg-amber-50', variant: 'outline' },
    ]
  },
  archived: { 
    label: 'Archived', 
    color: 'bg-indigo-100 text-indigo-800', 
    icon: Calendar,
    actions: []
  },
};

export default function SeasonManager({ seasons, onSeasonsUpdate, onViewSeason }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [processingSeasonId, setProcessingSeasonId] = useState(null);
  const [showRolloverWizard, setShowRolloverWizard] = useState(null);
  const [cloningSeason, setCloningSeason] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [activeTab, setActiveTab] = useState('current');
  const { toast } = useToast();

  const previousSeasons = seasons.filter(s => s.status === 'completed' || s.status === 'archived');
  const currentSeasons = seasons.filter(s => s.status !== 'completed' && s.status !== 'archived');

  const toggleExpanded = (seasonId) => {
    setExpandedSeasons(prev => ({ ...prev, [seasonId]: !prev[seasonId] }));
  };

  const handleCreate = () => {
    setEditingSeason(null);
    setCloningSeason(null);
    setShowCreateForm(true);
  };

  const handleClone = (season) => {
    setCloningSeason(season);
    setEditingSeason({
      ...season,
      id: null,
      name: `${season.name} (Copy)`,
      status: 'planning',
      cloned_from_season_id: season.id,
      rollover_config: {
        ...season.rollover_config,
        source_season_id: season.id,
        rollover_completed: false,
      },
      start_date: null,
      end_date: null,
      nomination_start: null,
      nomination_end: null,
      voting_start: null,
      voting_end: null,
      review_start: null,
      review_end: null,
    });
    setShowCreateForm(true);
  };

  const handleEdit = (season) => {
    setEditingSeason(season);
    setCloningSeason(null);
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingSeason(null);
    setCloningSeason(null);
  };

  const handleFormSuccess = async () => {
    handleFormClose();
    if (onSeasonsUpdate) await onSeasonsUpdate();
  };

  const handleLifecycleAction = async (season, action) => {
    // Validation for voting phase
    if (action.requiresValidation) {
      try {
        const nominees = await Nominee.filter({ season_id: season.id, status: 'approved' });
        if (nominees.length < 2) {
          toast({
            variant: "destructive",
            title: "Cannot Open Voting",
            description: "Need at least 2 approved nominees to start voting.",
          });
          return;
        }
      } catch (error) {
        console.error('Validation error:', error);
        return;
      }
    }

    // Rollover action opens wizard - always allow for completed/rollover seasons
    if (action.requiresRollover) {
      setShowRolloverWizard(season);
      return;
    }

    const confirmMessage = `Are you sure you want to ${action.label.toLowerCase()} for "${season.name}"?`;
    if (!confirm(confirmMessage)) return;

    setProcessingSeasonId(season.id);
    try {
      await Season.update(season.id, { status: action.nextStatus });
      toast({ title: `${action.label}`, description: `"${season.name}" status updated.` });
      if (onSeasonsUpdate) await onSeasonsUpdate();
    } catch (error) {
      console.error('Lifecycle action failed:', error);
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
    } finally {
      setProcessingSeasonId(null);
    }
  };

  const getStatusSubtext = (season) => {
    const now = new Date();
    if (!season.start_date) return 'Dates not set';
    
    if (season.status === 'completed' || season.status === 'archived') return 'Season ended';
    
    if (season.voting_end && now <= new Date(season.voting_end) && now >= new Date(season.voting_start || 0)) {
      return `${formatDistanceToNowStrict(new Date(season.voting_end))} left`;
    }
    if (season.nomination_end && now <= new Date(season.nomination_end) && now >= new Date(season.nomination_start || 0)) {
      return `${formatDistanceToNowStrict(new Date(season.nomination_end))} left`;
    }
    if (new Date(season.start_date) > now) {
      return `Starts in ${formatDistanceToNowStrict(new Date(season.start_date))}`;
    }
    return '';
  };

  const renderSeasonCard = (season) => {
    const statusConfig = STATUS_CONFIG[season.status] || STATUS_CONFIG.planning;
    const StatusIcon = statusConfig.icon;
    const isProcessing = processingSeasonId === season.id;
    const subtext = getStatusSubtext(season);
    const isExpanded = expandedSeasons[season.id] ?? false;

    return (
      <Collapsible key={season.id} open={isExpanded} onOpenChange={() => toggleExpanded(season.id)}>
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]/50 hover:bg-[var(--card)] transition-colors">
          {/* Collapsible Header */}
          <CollapsibleTrigger asChild>
            <div className="p-4 cursor-pointer hover:bg-[var(--card)]/80 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[var(--muted)] flex-shrink-0" />
                  )}
                  <h3 className="text-lg font-bold text-[var(--text)] truncate">{season.name}</h3>
                  <Badge className={`flex items-center gap-1.5 ${statusConfig.color} flex-shrink-0`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig.label}
                    {subtext && <span className="opacity-75 hidden sm:inline">• {subtext}</span>}
                  </Badge>
                  {season.rollover_config?.enabled && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300 hidden md:flex">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Rollover
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)] flex-shrink-0">
                  {season.start_date && (
                    <span className="hidden lg:block">
                      {format(new Date(season.start_date), 'MMM d')} - {format(new Date(season.end_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* Collapsible Content */}
          <CollapsibleContent>
            <div className="border-t border-[var(--border)]">
              {/* Actions Bar */}
              <div className="p-4 bg-gray-50/50 flex flex-wrap gap-2">
                {/* Lifecycle Actions */}
                {statusConfig.actions.map((action, idx) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={idx}
                      size="sm"
                      variant={action.variant || 'default'}
                      onClick={() => handleLifecycleAction(season, action)}
                      disabled={isProcessing}
                      className={action.variant !== 'outline' ? action.color : action.color}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <ActionIcon className="w-4 h-4 mr-1" />
                      )}
                      {action.label}
                    </Button>
                  );
                })}
                
                {/* Standard Actions */}
                <Button size="sm" variant="outline" onClick={() => handleClone(season)} className="border-[var(--border)]">
                  <Copy className="w-4 h-4 mr-1" />
                  Clone
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(season)} className="border-[var(--border)]">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onViewSeason(season)} className="border-[var(--border)]">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" asChild className="border-[var(--border)]">
                  <Link to={createPageUrl('Arena') + `?season_id=${season.id}`} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Standings
                  </Link>
                </Button>
              </div>

              {/* Theme */}
              {season.theme && (
                <div className="px-4 py-2 text-[var(--muted)] italic text-sm">
                  Theme: "{season.theme}"
                </div>
              )}

              {/* Timeline */}
              <div className="px-4 pb-4">
                <SeasonTimeline season={season} />
              </div>

              {/* Rollover Stats (if completed) */}
              {season.rollover_config?.rollover_completed && season.rollover_config?.rollover_stats && (
                <div className="px-4 pb-4">
                  <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-4 text-sm">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium">Rollover Complete:</span>
                    <span className="text-blue-700">
                      {season.rollover_config.rollover_stats.revalidated_count} rolled over, 
                      {' '}{season.rollover_config.rollover_stats.declined_count} excluded
                    </span>
                  </div>
                </div>
              )}

              {/* Nominee Manager */}
              <SeasonNomineeManager 
                season={season} 
                onViewNominee={(n) => console.log('View nominee:', n)}
                onEditNominee={(n) => console.log('Edit nominee:', n)}
              />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Season Management</h2>
          <p className="text-[var(--muted)]">Create and manage voting seasons with lifecycle controls.</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Season
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Current ({currentSeasons.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Past ({previousSeasons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentSeasons.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[var(--border)] rounded-xl">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
              <p className="text-[var(--muted)]">No active seasons. Create one to get started.</p>
            </div>
          ) : (
            currentSeasons.map(renderSeasonCard)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {previousSeasons.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-[var(--border)] rounded-xl">
              <Archive className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
              <p className="text-[var(--muted)]">No completed or archived seasons yet.</p>
            </div>
          ) : (
            previousSeasons.map(renderSeasonCard)
          )}
        </TabsContent>
      </Tabs>

      {/* Season Form Modal */}
      {showCreateForm && (
        <SeasonForm
          season={editingSeason}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          previousSeasons={previousSeasons}
        />
      )}

      {/* Rollover Wizard Modal */}
      {showRolloverWizard && (
        <NomineeRolloverWizard
          sourceSeason={showRolloverWizard}
          allSeasons={seasons}
          onClose={() => setShowRolloverWizard(null)}
          onComplete={onSeasonsUpdate}
        />
      )}
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function FeatureToTeamMapper() {
  const [editingLink, setEditingLink] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const queryClient = useQueryClient();

  const { data: features = [] } = useQuery({
    queryKey: ['features'],
    queryFn: () => base44.entities.Feature.list(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => base44.entities.AgentTeam.list(),
  });

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ['feature-team-links'],
    queryFn: async () => {
      const allLinks = [];
      for (const feature of features) {
        if (feature.team_id) {
          allLinks.push({ feature_id: feature.id, team_id: feature.team_id, feature });
        }
      }
      return allLinks;
    },
    enabled: features.length > 0,
  });

  const updateFeatureMutation = useMutation({
    mutationFn: ({ id, team_id }) => base44.entities.Feature.update(id, { team_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['features']);
      queryClient.invalidateQueries(['feature-team-links']);
      setFormOpen(false);
      setSelectedTeam('');
      setSelectedFeature('');
      toast.success('Feature assigned to team');
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (feature_id) => base44.entities.Feature.update(feature_id, { team_id: null }),
    onSuccess: () => {
      queryClient.invalidateQueries(['features']);
      queryClient.invalidateQueries(['feature-team-links']);
      toast.success('Assignment removed');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedFeature || !selectedTeam) {
      toast.error('Please select both feature and team');
      return;
    }
    updateFeatureMutation.mutate({ id: selectedFeature, team_id: selectedTeam });
  };

  const getTeamName = (team_id) => teams.find(t => t.id === team_id)?.name || 'Unknown';
  const getFeatureName = (feature_id) => features.find(f => f.id === feature_id)?.name || 'Unknown';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-green-600" />
            Feature-to-Team Mapper
          </h1>
          <p className="text-sm text-slate-500 mt-1">Assign features to agent teams and ARTs</p>
        </div>

        <Button onClick={() => setFormOpen(true)} className="bg-green-600 hover:bg-green-700 gap-2">
          <Plus className="w-4 h-4" /> Assign Feature
        </Button>

        {linksLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No feature assignments yet</div>
        ) : (
          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{getFeatureName(link.feature_id)}</h3>
                  <p className="text-sm text-slate-500">Team: {getTeamName(link.team_id)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeAssignmentMutation.mutate(link.feature_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Feature to Team</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Feature</label>
                <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose feature..." />
                  </SelectTrigger>
                  <SelectContent>
                    {features.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Assign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
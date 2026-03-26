import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManager() {
  const [editingTeam, setEditingTeam] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedART, setSelectedART] = useState('');
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', selectedART],
    queryFn: () => base44.entities.AgentTeam.filter({ art_id: selectedART }),
    enabled: !!selectedART,
  });

  const { data: arts = [] } = useQuery({
    queryKey: ['arts-for-teams'],
    queryFn: () => base44.entities.AgileReleaseTrain.list(),
  });

  const createTeamMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentTeam.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setFormOpen(false);
      setEditingTeam(null);
      toast.success('Team created');
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentTeam.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setFormOpen(false);
      setEditingTeam(null);
      toast.success('Team updated');
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentTeam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      toast.success('Team deleted');
    },
  });

  const handleNewTeam = () => {
    setEditingTeam(null);
    setFormOpen(true);
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      art_id: selectedART,
    };

    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data });
    } else {
      createTeamMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Team Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage agent teams within ARTs</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <label className="text-sm font-medium">Select ART</label>
          <Select value={selectedART} onValueChange={setSelectedART}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choose an ART..." />
            </SelectTrigger>
            <SelectContent>
              {arts.map(art => (
                <SelectItem key={art.id} value={art.id}>{art.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedART && (
          <div className="space-y-4">
            <Button onClick={handleNewTeam} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" /> New Team
            </Button>

            {teamsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
                ))}
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No teams in this ART yet</div>
            ) : (
              <div className="space-y-2">
                {teams.map(team => (
                  <div key={team.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{team.name}</h3>
                      <p className="text-sm text-slate-500">{team.description}</p>
                      <div className="text-xs text-slate-400 mt-2">{team.member_count || 0} members</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTeam(team)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTeamMutation.mutate(team.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'New Team'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input name="name" defaultValue={editingTeam?.name} required />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input name="description" defaultValue={editingTeam?.description} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
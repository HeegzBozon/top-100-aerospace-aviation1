import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegistryTeamManager() {
  const [editingTeam, setEditingTeam] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedART, setSelectedART] = useState('');
  const queryClient = useQueryClient();

  const { data: arts = [] } = useQuery({
    queryKey: ['arts-for-teams-registry'],
    queryFn: () => base44.entities.AgileReleaseTrain.list(),
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams-registry', selectedART],
    queryFn: () => selectedART
      ? base44.entities.AgentTeam.filter({ art_id: selectedART })
      : base44.entities.AgentTeam.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentTeam.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams-registry']);
      setFormOpen(false);
      toast.success('Team created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentTeam.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams-registry']);
      setFormOpen(false);
      setEditingTeam(null);
      toast.success('Team updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentTeam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['teams-registry']);
      toast.success('Team deleted');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      art_id: selectedART,
    };

    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedART} onValueChange={setSelectedART}>
        <SelectTrigger className="w-full md:w-80">
          <SelectValue placeholder="Filter by ART (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All Teams</SelectItem>
          {arts.map(a => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => { setEditingTeam(null); setFormOpen(true); }} className="gap-2">
        <Plus className="w-4 h-4" /> New Team
      </Button>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(n => (
            <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No Teams</div>
      ) : (
        <div className="space-y-2">
          {teams.map(team => (
            <div key={team.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-slate-500">{team.description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingTeam(team); setFormOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(team.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Edit Team' : 'New Team'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <Input name="name" defaultValue={editingTeam?.name} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" defaultValue={editingTeam?.description} />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
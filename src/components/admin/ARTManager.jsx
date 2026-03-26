import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ARTManager() {
  const [editingART, setEditingART] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState('');
  const queryClient = useQueryClient();

  const { data: trains = [] } = useQuery({
    queryKey: ['trains-for-arts'],
    queryFn: () => base44.entities.SolutionTrain.list(),
  });

  const { data: arts = [], isLoading } = useQuery({
    queryKey: ['arts-registry', selectedTrain],
    queryFn: () => selectedTrain 
      ? base44.entities.AgileReleaseTrain.filter({ solution_train_id: selectedTrain })
      : base44.entities.AgileReleaseTrain.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AgileReleaseTrain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts-registry']);
      setFormOpen(false);
      toast.success('ART created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgileReleaseTrain.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts-registry']);
      setFormOpen(false);
      setEditingART(null);
      toast.success('ART updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgileReleaseTrain.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts-registry']);
      toast.success('ART deleted');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      solution_train_id: selectedTrain || undefined,
      program_increment_id: formData.get('program_increment_id'),
    };

    if (editingART) {
      updateMutation.mutate({ id: editingART.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedTrain} onValueChange={setSelectedTrain}>
        <SelectTrigger className="w-full md:w-80">
          <SelectValue placeholder="Filter by Solution Train (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>All ARTs</SelectItem>
          {trains.map(t => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => { setEditingART(null); setFormOpen(true); }} className="gap-2">
        <Plus className="w-4 h-4" /> New ART
      </Button>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(n => (
            <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      ) : arts.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No ARTs</div>
      ) : (
        <div className="space-y-2">
          {arts.map(art => (
            <div key={art.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{art.name}</h3>
                <p className="text-sm text-slate-500">{art.description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingART(art); setFormOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(art.id)}>
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
            <DialogTitle>{editingART ? 'Edit ART' : 'New ART'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={editingART?.name} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" defaultValue={editingART?.description} />
            </div>
            <div>
              <label className="text-sm font-medium">Program Increment ID</label>
              <Input name="program_increment_id" defaultValue={editingART?.program_increment_id} required />
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
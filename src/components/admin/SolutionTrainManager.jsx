import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SolutionTrainManager() {
  const [editingTrain, setEditingTrain] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: trains = [], isLoading } = useQuery({
    queryKey: ['solution-trains-registry'],
    queryFn: () => base44.entities.SolutionTrain.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SolutionTrain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains-registry']);
      setFormOpen(false);
      toast.success('Solution Train created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SolutionTrain.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains-registry']);
      setFormOpen(false);
      setEditingTrain(null);
      toast.success('Solution Train updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SolutionTrain.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains-registry']);
      toast.success('Solution Train deleted');
    },
  });

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (editingTrain) {
      updateMutation.mutate({ id: editingTrain.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => { setEditingTrain(null); setFormOpen(true); }} className="gap-2">
        <Plus className="w-4 h-4" /> New Solution Train
      </Button>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(n => (
            <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      ) : trains.length === 0 ? (
        <div className="text-center py-8 text-slate-400">No Solution Trains</div>
      ) : (
        <div className="space-y-2">
          {trains.map(train => (
            <div key={train.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{train.name}</h3>
                <p className="text-sm text-slate-500">{train.description}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditingTrain(train); setFormOpen(true); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(train.id)}>
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
            <DialogTitle>{editingTrain ? 'Edit Solution Train' : 'New Solution Train'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" defaultValue={editingTrain?.name} required />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" defaultValue={editingTrain?.description} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">Vision</label>
              <Textarea name="vision" defaultValue={editingTrain?.vision} rows={2} />
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
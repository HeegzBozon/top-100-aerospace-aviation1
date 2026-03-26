import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ARTCommandCenter() {
  const [editingART, setEditingART] = useState(null);
  const [editingTrain, setEditingTrain] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState('art');
  const queryClient = useQueryClient();

  const { data: arts = [], isLoading: artsLoading } = useQuery({
    queryKey: ['arts'],
    queryFn: () => base44.entities.AgileReleaseTrain.list(),
  });

  const { data: trains = [], isLoading: trainsLoading } = useQuery({
    queryKey: ['solution-trains'],
    queryFn: () => base44.entities.SolutionTrain.list(),
  });

  const createARTMutation = useMutation({
    mutationFn: (data) => base44.entities.AgileReleaseTrain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts']);
      setFormOpen(false);
      setEditingART(null);
      toast.success('ART created');
    },
  });

  const updateARTMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgileReleaseTrain.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts']);
      setFormOpen(false);
      setEditingART(null);
      toast.success('ART updated');
    },
  });

  const deleteARTMutation = useMutation({
    mutationFn: (id) => base44.entities.AgileReleaseTrain.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['arts']);
      toast.success('ART deleted');
    },
  });

  const createTrainMutation = useMutation({
    mutationFn: (data) => base44.entities.SolutionTrain.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains']);
      setFormOpen(false);
      setEditingTrain(null);
      toast.success('Solution Train created');
    },
  });

  const updateTrainMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SolutionTrain.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains']);
      setFormOpen(false);
      setEditingTrain(null);
      toast.success('Solution Train updated');
    },
  });

  const deleteTrainMutation = useMutation({
    mutationFn: (id) => base44.entities.SolutionTrain.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-trains']);
      toast.success('Solution Train deleted');
    },
  });

  const handleNewART = () => {
    setFormType('art');
    setEditingART(null);
    setFormOpen(true);
  };

  const handleEditART = (art) => {
    setFormType('art');
    setEditingART(art);
    setFormOpen(true);
  };

  const handleNewTrain = () => {
    setFormType('train');
    setEditingTrain(null);
    setFormOpen(true);
  };

  const handleEditTrain = (train) => {
    setFormType('train');
    setEditingTrain(train);
    setFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (formType === 'art') {
      if (editingART) {
        updateARTMutation.mutate({ id: editingART.id, data });
      } else {
        createARTMutation.mutate(data);
      }
    } else {
      if (editingTrain) {
        updateTrainMutation.mutate({ id: editingTrain.id, data });
      } else {
        createTrainMutation.mutate(data);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600" />
              ART Command Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage Agile Release Trains and Solution Trains</p>
          </div>
        </div>

        <Tabs defaultValue="arts" className="mt-6">
          <TabsList>
            <TabsTrigger value="arts">Agile Release Trains</TabsTrigger>
            <TabsTrigger value="trains">Solution Trains</TabsTrigger>
          </TabsList>

          <TabsContent value="arts" className="mt-4 space-y-4">
            <Button onClick={handleNewART} className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Plus className="w-4 h-4" /> New ART
            </Button>

            {artsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
                ))}
              </div>
            ) : arts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No ARTs found</div>
            ) : (
              <div className="space-y-2">
                {arts.map(art => (
                  <div key={art.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{art.name}</h3>
                      <p className="text-sm text-slate-500">{art.description}</p>
                      <div className="text-xs text-slate-400 mt-2">{art.team_count || 0} teams</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditART(art)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteARTMutation.mutate(art.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trains" className="mt-4 space-y-4">
            <Button onClick={handleNewTrain} className="bg-violet-600 hover:bg-violet-700 gap-2">
              <Plus className="w-4 h-4" /> New Solution Train
            </Button>

            {trainsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-20 bg-slate-200 rounded animate-pulse" />
                ))}
              </div>
            ) : trains.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No Solution Trains found</div>
            ) : (
              <div className="space-y-2">
                {trains.map(train => (
                  <div key={train.id} className="bg-white border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{train.name}</h3>
                      <p className="text-sm text-slate-500">{train.description}</p>
                      <div className="text-xs text-slate-400 mt-2">{train.art_count || 0} ARTs</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditTrain(train)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTrainMutation.mutate(train.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {formType === 'art' ? (editingART ? 'Edit ART' : 'New ART') : editingTrain ? 'Edit Solution Train' : 'New Solution Train'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  defaultValue={formType === 'art' ? editingART?.name : editingTrain?.name}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  name="description"
                  defaultValue={formType === 'art' ? editingART?.description : editingTrain?.description}
                />
              </div>

              {formType === 'train' && (
                <div>
                  <label className="text-sm font-medium">Vision</label>
                  <Input name="vision" defaultValue={editingTrain?.vision} />
                </div>
              )}

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
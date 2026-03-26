import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const ASSIGNMENT_STATUSES = ['unassigned', 'ready_for_duty', 'bench', 'beach'];

const EMPTY_SKILL = {
  name: '',
  display_name: '',
  description: '',
  instructions: '',
  input_schema: {},
  output_schema: {},
  associated_resource_ids: [],
  required_agent_capabilities: [],
  version: '1.0.0',
  is_active: true,
  tags: [],
  team_id: '',
  assignment_status: 'unassigned',
};

export default function SkillManager() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [form, setForm] = useState(EMPTY_SKILL);
  const [filterTeam, setFilterTeam] = useState('all');

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => base44.entities.Skill.list('-updated_date', 100),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.AgentTeam.list(),
  });

  const filteredSkills = filterTeam === 'all' ? skills : skills.filter(s => s.team_id === filterTeam);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Skill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setEditorOpen(false);
      setForm(EMPTY_SKILL);
      toast.success('Skill created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Skill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setEditorOpen(false);
      setForm(EMPTY_SKILL);
      toast.success('Skill updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Skill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill deleted');
    },
  });

  const handleNew = () => {
    setEditingSkill(null);
    setForm(EMPTY_SKILL);
    setEditorOpen(true);
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setForm(skill);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.display_name) {
      toast.error('Name and Display Name are required');
      return;
    }
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Skills Library</h2>
        <div className="flex gap-2">
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Skill
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">No skills yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <div key={skill.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900">{skill.display_name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(skill)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(skill.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-2">{skill.name}</p>
              <p className="text-sm text-slate-600 line-clamp-2">{skill.description}</p>
              <div className="flex gap-1 mt-3 flex-wrap">
                {skill.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-xs rounded text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'New Skill'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="skill-name">Name</Label>
                <Input
                  id="skill-name"
                  placeholder="CodeGeneration"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="Code Generation"
                  value={form.display_name}
                  onChange={e => setForm({ ...form, display_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                rows={3}
                value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assign to Team</Label>
                <Select value={form.team_id || ''} onValueChange={v => setForm({ ...form, team_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Unassigned</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.assignment_status} onValueChange={v => setForm({ ...form, assignment_status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {editingSkill ? 'Update' : 'Create'} Skill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Search, Bot, FlaskConical, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import SkillEditorModal from '@/components/admin/SkillEditorModal';
import SkillCard from '@/components/admin/SkillCard';

const PERSONA_ROLES = [
  'chief-of-staff', 'principal-engineer', 'staff-engineer', 'senior-engineer',
  'junior-engineer', 'scrum-master', 'product-owner', 'art-conductor', 'qa-engineer', 'custom'
];

export default function AgentSkillRegistry() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['agent-skills'],
    queryFn: () => base44.entities.AgentSkill.list('-updated_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentSkill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-skills']);
      toast.success('Skill deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.AgentSkill.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['agent-skills']),
  });

  const handleNew = () => { setEditingSkill(null); setEditorOpen(true); };
  const handleEdit = (skill) => { setEditingSkill(skill); setEditorOpen(true); };
  const handleDuplicate = async (skill) => {
    const { id, created_date, updated_date, ...rest } = skill;
    await base44.entities.AgentSkill.create({ ...rest, name: `${rest.name}-copy`, display_name: `${rest.display_name} (Copy)`, version: '1.0.0' });
    queryClient.invalidateQueries(['agent-skills']);
    toast.success('Skill duplicated');
  };

  const filtered = skills.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || s.persona_role === filterRole;
    return matchesSearch && matchesRole;
  });

  const activeCount = skills.filter(s => s.is_active).length;
  const tddCount = skills.filter(s => s.tdd_enforced).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-600" />
              Agent Skill Registry
            </h1>
            <p className="text-sm text-slate-500 mt-1">Centralized configuration for all AI agent personas and skills</p>
          </div>
          <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> New Skill
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Skills', value: skills.length, Icon: Bot, color: 'text-indigo-600' },
            { label: 'Active', value: activeCount, Icon: Zap, color: 'text-green-600' },
            { label: 'TDD Enforced', value: tddCount, Icon: FlaskConical, color: 'text-amber-600' },
            { label: 'Personas', value: new Set(skills.map(s => s.persona_role)).size, Icon: ShieldCheck, color: 'text-blue-600' },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {PERSONA_ROLES.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skills Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No skills found</p>
            <p className="text-sm mt-1">Create your first skill to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={() => handleEdit(skill)}
                onDelete={() => deleteMutation.mutate(skill.id)}
                onDuplicate={() => handleDuplicate(skill)}
                onToggle={(is_active) => toggleMutation.mutate({ id: skill.id, is_active })}
              />
            ))}
          </div>
        )}
      </div>

      <SkillEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        skill={editingSkill}
        onSaved={() => {
          queryClient.invalidateQueries(['agent-skills']);
          setEditorOpen(false);
        }}
      />
    </div>
  );
}
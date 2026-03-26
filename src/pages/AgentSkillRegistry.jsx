import { useState, useRef } from 'react';
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
import { Plus, Search, Bot, FlaskConical, ShieldCheck, Zap, Download, Upload, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import SkillEditorModal from '@/components/admin/SkillEditorModal';
import SkillCard from '@/components/admin/SkillCard';
import AgentSkillOrgChart from '@/components/admin/AgentSkillOrgChart';
import { skillToMarkdown, markdownToSkill, downloadMarkdown } from '@/lib/agentSkillMarkdown';

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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importAction, setImportAction] = useState('create'); // 'create' or 'replace'
  const [importedSkill, setImportedSkill] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleMarkdownImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const parsed = markdownToSkill(text);
      setImportedSkill(parsed);
      setImportModalOpen(true);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }
  };

  const confirmImport = async () => {
    if (!importedSkill) return;

    try {
      if (importAction === 'replace') {
        const existing = skills.find(s => s.name === importedSkill.name);
        if (existing) {
          await base44.entities.AgentSkill.update(existing.id, importedSkill);
          toast.success(`Updated ${importedSkill.display_name}`);
        } else {
          await base44.entities.AgentSkill.create(importedSkill);
          toast.success(`Created ${importedSkill.display_name}`);
        }
      } else {
        await base44.entities.AgentSkill.create(importedSkill);
        toast.success(`Created ${importedSkill.display_name}`);
      }
      queryClient.invalidateQueries(['agent-skills']);
      setImportModalOpen(false);
      setImportedSkill(null);
    } catch (err) {
      toast.error('Import failed');
    }
  };

  const exportSkill = (skill) => {
    const md = skillToMarkdown(skill);
    downloadMarkdown(md, `${skill.name}.md`);
    toast.success('Downloaded');
  };

  const exportAll = () => {
    const allMarkdown = skills
      .map(s => skillToMarkdown(s))
      .join('\n\n---\n\n');
    downloadMarkdown(allMarkdown, 'all-agent-skills.md');
    toast.success('Downloaded all skills');
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
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-h-[44px]">
              <Plus className="w-4 h-4" /> New Skill
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2 min-h-[44px]">
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button onClick={exportAll} variant="outline" className="gap-2 min-h-[44px]">
              <Download className="w-4 h-4" /> Export All
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleMarkdownImport}
              className="hidden"
            />
          </div>
        </div>

        <Tabs defaultValue="skills" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="org-chart">Org Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-6 space-y-6">
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
        </TabsContent>

        <TabsContent value="org-chart" className="mt-6">
          <AgentSkillOrgChart skills={skills} onSelectSkill={skill => { setEditingSkill(skill); setEditorOpen(true); }} />
        </TabsContent>
      </Tabs>

      {/* Import confirmation modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Skill: {importedSkill?.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">Preview:</p>
              <p><strong>Name:</strong> {importedSkill?.name}</p>
              <p><strong>Role:</strong> {importedSkill?.persona_role}</p>
              <p><strong>Version:</strong> {importedSkill?.version}</p>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <select
                value={importAction}
                onChange={e => setImportAction(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="create">Create new (if name exists, add copy suffix)</option>
                <option value="replace">Replace existing (if name matches)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportModalOpen(false)}>Cancel</Button>
              <Button onClick={confirmImport} className="bg-indigo-600 hover:bg-indigo-700 text-white">Import</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
      </div>
      );
      }
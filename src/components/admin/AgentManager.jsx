import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PERSONA_ROLES = [
  'chief-of-staff', 'principal-engineer', 'staff-engineer', 'senior-engineer',
  'junior-engineer', 'scrum-master', 'product-owner', 'art-conductor', 'qa-engineer', 'custom'
];

const ASSIGNMENT_STATUSES = ['unassigned', 'ready_for_duty', 'bench', 'beach'];

const EMPTY_AGENT = {
  name: '', display_name: '', persona_role: 'custom', description: '',
  instructions: '', output_format: '', allowed_tools: [], tags: [],
  is_active: true, tdd_enforced: false, version: '1.0.0', team_id: '', assignment_status: 'unassigned',
  ai_agent_function_type: 'generator', allowed_domains: [], data_access_policies: {},
};

export default function AgentManager() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [form, setForm] = useState(EMPTY_AGENT);
  const [filterTeam, setFilterTeam] = useState('all');
  const [tagsInput, setTagsInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [domainsInput, setDomainsInput] = useState('');

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agent-skills'],
    queryFn: () => base44.entities.AgentSkill.list('-updated_date', 100),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.AgentTeam.list(),
  });

  const filteredAgents = filterTeam === 'all' ? agents : agents.filter(a => a.team_id === filterTeam);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AgentSkill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-skills']);
      setEditorOpen(false);
      setForm(EMPTY_AGENT);
      toast.success('Agent created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AgentSkill.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-skills']);
      setEditorOpen(false);
      setForm(EMPTY_AGENT);
      toast.success('Agent updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AgentSkill.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-skills']);
      toast.success('Agent deleted');
    },
  });

  const handleNew = () => {
    setEditingAgent(null);
    setForm(EMPTY_AGENT);
    setTagsInput('');
    setToolsInput('');
    setDomainsInput('');
    setEditorOpen(true);
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setForm(agent);
    setTagsInput((agent.tags || []).join(', '));
    setToolsInput((agent.allowed_tools || []).join(', '));
    setDomainsInput((agent.allowed_domains || []).join(', '));
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.display_name || !form.instructions) {
      toast.error('Name, Display Name, and Instructions are required');
      return;
    }
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      allowed_tools: toolsInput.split(',').map(t => t.trim()).filter(Boolean),
      allowed_domains: domainsInput.split(',').map(d => d.trim()).filter(Boolean),
    };
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Agents Management</h2>
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
            <Plus className="w-4 h-4" /> New Agent
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="font-medium">No agents yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900">{agent.display_name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(agent)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(agent.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-2">{agent.name}</p>
              <p className="text-xs text-slate-600 mb-2">Role: <span className="font-medium">{agent.persona_role}</span></p>
              <p className="text-sm text-slate-600 line-clamp-2">{agent.description}</p>
              <div className="flex gap-1 mt-3 flex-wrap">
                {agent.is_active && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>}
                {agent.tdd_enforced && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">TDD</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'New Agent'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="identity" className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="identity" className="flex-1">Identity</TabsTrigger>
              <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
              <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="agent-name">Agent Name (slug)</Label>
                  <Input id="agent-name" placeholder="senior-engineer" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" placeholder="Senior Engineer" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Persona Role</Label>
                  <Select value={form.persona_role} onValueChange={v => setForm({ ...form, persona_role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PERSONA_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" placeholder="1.0.0" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={2} placeholder="When to activate..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="output-format">Output Format Prefix</Label>
                <Input id="output-format" placeholder="SE: [IMPLEMENT / REVIEW / REFACTOR]" value={form.output_format} onChange={e => setForm({ ...form, output_format: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" placeholder="engineering, review, implementation" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Team Assignment</Label>
                  <Select value={form.team_id || ''} onValueChange={v => setForm({ ...form, team_id: v || '' })}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.assignment_status} onValueChange={v => setForm({ ...form, assignment_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch id="is-active" checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                  <Label htmlFor="is-active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="tdd" checked={form.tdd_enforced} onCheckedChange={v => setForm({ ...form, tdd_enforced: v })} />
                  <Label htmlFor="tdd">TDD Enforced</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="instructions">Full Instructions Prompt</Label>
                <Textarea
                  id="instructions"
                  rows={18}
                  className="font-mono text-sm"
                  placeholder="You are a Senior Engineer..."
                  value={form.instructions}
                  onChange={e => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="config" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>AI Agent Function Type</Label>
                <Select value={form.ai_agent_function_type} onValueChange={v => setForm({ ...form, ai_agent_function_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['generator', 'critic', 'verifier', 'manager', 'executor', 'custom'].map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tools">Allowed Tools (comma-separated)</Label>
                <Textarea
                  id="tools"
                  rows={4}
                  className="font-mono text-sm"
                  placeholder="createTestCase, updateJiraTicket, reviewCode"
                  value={toolsInput}
                  onChange={e => setToolsInput(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domains">Allowed Domains (comma-separated)</Label>
                <Textarea
                  id="domains"
                  rows={3}
                  className="font-mono text-sm"
                  placeholder="frontend, backend, data-pipeline"
                  value={domainsInput}
                  onChange={e => setDomainsInput(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {editingAgent ? 'Update Agent' : 'Create Agent'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
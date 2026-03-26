import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';

const PERSONA_ROLES = [
  'chief-of-staff', 'principal-engineer', 'staff-engineer', 'senior-engineer',
  'junior-engineer', 'scrum-master', 'product-owner', 'art-conductor', 'qa-engineer', 'custom'
];

const ASSIGNMENT_STATUSES = ['unassigned', 'ready_for_duty', 'bench', 'beach'];

const EMPTY_SKILL = {
  name: '', display_name: '', persona_role: 'custom', description: '',
  instructions: '', output_format: '', allowed_tools: [], tags: [],
  is_active: true, tdd_enforced: false, version: '1.0.0', team_id: '', assignment_status: 'unassigned',
};

export default function SkillEditorModal({ open, onClose, skill, onSaved }) {
  const [form, setForm] = useState(EMPTY_SKILL);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [toolsInput, setToolsInput] = useState('');

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-for-skill-editor'],
    queryFn: () => base44.entities.AgentTeam.list(),
  });

  useEffect(() => {
    if (skill) {
      setForm({ ...EMPTY_SKILL, ...skill });
      setTagsInput((skill.tags || []).join(', '));
      setToolsInput((skill.allowed_tools || []).join(', '));
    } else {
      setForm(EMPTY_SKILL);
      setTagsInput('');
      setToolsInput('');
    }
  }, [skill, open]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.name || !form.display_name || !form.instructions) {
      toast.error('Name, Display Name, and Instructions are required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      allowed_tools: toolsInput.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (skill?.id) {
      await base44.entities.AgentSkill.update(skill.id, payload);
      toast.success('Skill updated');
    } else {
      await base44.entities.AgentSkill.create(payload);
      toast.success('Skill created');
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{skill ? 'Edit Skill' : 'New Skill'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="identity" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="identity" className="flex-1">Identity</TabsTrigger>
            <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
            <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="skill-name">Skill Name (slug)</Label>
                <Input id="skill-name" placeholder="qa-engineer" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="QA Engineer" value={form.display_name} onChange={e => set('display_name', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Persona Role</Label>
                <Select value={form.persona_role} onValueChange={v => set('persona_role', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERSONA_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="version">Version</Label>
                <Input id="version" placeholder="1.0.0" value={form.version} onChange={e => set('version', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (when to activate)</Label>
              <Textarea id="description" rows={2} placeholder="Activate when the user needs QA test plans, bug reports, or verification..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="output-format">Output Format Prefix</Label>
              <Input id="output-format" placeholder="QA: [TEST PLAN / BUG REPORT / VERIFY / REGRESSION]" value={form.output_format} onChange={e => set('output_format', e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="testing, quality, automation" value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Assign to Team (optional)</Label>
                <Select value={form.team_id || ''} onValueChange={v => set('team_id', v || '')}>
                  <SelectTrigger><SelectValue placeholder="No team assigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>None</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.assignment_status || 'unassigned'} onValueChange={v => set('assignment_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch id="is-active" checked={form.is_active} onCheckedChange={v => set('is_active', v)} />
                <Label htmlFor="is-active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="tdd" checked={form.tdd_enforced} onCheckedChange={v => set('tdd_enforced', v)} />
                <Label htmlFor="tdd">TDD Enforced</Label>
              </div>
            </div>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="instructions">Full Skill Instructions</Label>
              <p className="text-xs text-slate-500">This is the prompt body injected when the skill is activated.</p>
              <Textarea
                id="instructions"
                rows={18}
                className="font-mono text-sm"
                placeholder="You are a QA Engineer agent. Your responsibilities are..."
                value={form.instructions}
                onChange={e => set('instructions', e.target.value)}
              />
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tools">Allowed Tools / Functions (comma-separated)</Label>
              <p className="text-xs text-slate-500">Backend function names this skill is permitted to invoke.</p>
              <Textarea
                id="tools"
                rows={4}
                className="font-mono text-sm"
                placeholder="getJiraTickets, updateJiraTicket, createTestCase, startTestSession"
                value={toolsInput}
                onChange={e => setToolsInput(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 min-h-[44px]">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Skill'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
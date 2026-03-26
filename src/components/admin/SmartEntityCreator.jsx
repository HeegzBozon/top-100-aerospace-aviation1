import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Wand2, Copy, Save } from 'lucide-react';
import { parseMarkdownEntity, ENTITY_TEMPLATES } from '@/lib/markdownEntityParser';

const ENTITY_TYPES = ['AgentSkill', 'Skill', 'AgentTeam', 'AgileReleaseTrain', 'SolutionTrain'];

export default function SmartEntityCreator({ open, onClose, onEntityCreated }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState('upload');
  const [entityType, setEntityType] = useState('AgentSkill');
  const [parsed, setParsed] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(ENTITY_TEMPLATES.AgentSkill);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseMarkdownEntity(text);
      const detectedType = result.entity_type || 'AgentSkill';
      
      setParsed(result);
      setEntityType(detectedType);
      // Merge parsed data with template defaults to fill in missing fields
      setForm(prev => ({
        ...ENTITY_TEMPLATES[detectedType],
        ...result.data,
      }));
      setTab('review');
      toast.success(`Parsed ${detectedType}`);
    } catch (err) {
      toast.error(`Parse failed: ${err.message}`);
    }
  };

  const handleAiReview = async () => {
    setLoading(true);
    try {
      const prompt = `Review and improve this ${entityType} entity definition. Fill in any missing critical fields, enhance descriptions, and suggest better instructions if vague. Return JSON with 'improvements' (array of strings) and 'data' (full improved entity object):\n\n${JSON.stringify(form, null, 2)}`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            improvements: { type: 'array', items: { type: 'string' } },
            data: { type: 'object' },
          },
          required: ['improvements', 'data'],
        },
      });
      console.log('AI Response:', response);
      setAiSuggestions(response);
      setTab('ai-review');
      toast.success('AI review complete');
    } catch (err) {
      console.error('AI review error:', err);
      toast.error(`AI review failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestions = () => {
    if (aiSuggestions?.data) {
      setForm(prev => ({ ...prev, ...aiSuggestions.data }));
      setAiSuggestions(null);
      setTab('review');
      toast.success('Suggestions applied');
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!entityType || !ENTITY_TYPES.includes(entityType)) {
        throw new Error(`Invalid entity type: ${entityType}`);
      }
      
      const entityMap = {
        'AgentSkill': base44.entities.AgentSkill,
        'Skill': base44.entities.Skill,
        'AgentTeam': base44.entities.AgentTeam,
        'AgileReleaseTrain': base44.entities.AgileReleaseTrain,
        'SolutionTrain': base44.entities.SolutionTrain,
      };
      
      const entity = entityMap[entityType];
      if (!entity) throw new Error(`Entity ${entityType} not found in base44.entities`);
      
      console.log(`[SmartEntityCreator] Creating ${entityType}:`, data);
      const result = await entity.create(data);
      console.log(`[SmartEntityCreator] Success:`, result);
      return result;
    },
    onSuccess: (result) => {
      console.log(`[SmartEntityCreator] onSuccess fired, closing modal...`);
      queryClient.invalidateQueries({ queryKey: ['agent-skills'] });
      queryClient.invalidateQueries({ queryKey: ['agent-teams'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success(`${entityType} created successfully`);
      if (onEntityCreated) onEntityCreated(result);
      // Close after a short delay to allow toast to display
      setTimeout(() => handleClose(), 500);
    },
    onError: (err) => {
      console.error(`[SmartEntityCreator] Creation failed:`, err);
      toast.error(`Failed to create ${entityType}: ${err.message}`);
    },
  });

  const handleCreate = () => {
    console.log('[SmartEntityCreator] handleCreate: type=', entityType, 'form=', form);
    
    const required = ['name', 'display_name', 'description'];
    if (entityType === 'AgentSkill' || entityType === 'Skill') required.push('instructions');
    
    const missing = required.filter(f => !form[f]);
    if (missing.length > 0) {
      const msg = `Missing: ${missing.join(', ')}`;
      console.log('[SmartEntityCreator]', msg);
      toast.error(msg);
      return;
    }
    
    console.log('[SmartEntityCreator] Validation OK, calling mutation...');
    createMutation.mutate(form);
  };

  const handleClose = () => {
    setParsed(null);
    setAiSuggestions(null);
    setForm(ENTITY_TEMPLATES[entityType] || {});
    setTab('upload');
    setEntityType('AgentSkill');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Smart Entity Creator</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">Upload</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">Manual</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">Review</TabsTrigger>
            <TabsTrigger value="ai-review" className="flex-1">AI Review</TabsTrigger>
          </TabsList>

          {/* UPLOAD TAB */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Upload Markdown Entity</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 py-8 border-dashed"
              >
                <Upload className="w-5 h-5" /> Choose .md file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-slate-500">
                File should have YAML frontmatter (entity_type, name, display_name, etc.) + body as instructions.
              </p>
            </div>

            {parsed && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-sm">Detected: {parsed.entity_type}</p>
                <p className="text-xs text-slate-600 mt-1">Ready to review—go to Review tab.</p>
              </div>
            )}
          </TabsContent>

          {/* MANUAL TAB */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-name">Name</Label>
              <Input
                id="m-name"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-display">Display Name</Label>
              <Input
                id="m-display"
                value={form.display_name || ''}
                onChange={e => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">Description</Label>
              <Textarea
                id="m-desc"
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {(entityType === 'AgentSkill' || entityType === 'Skill') && (
              <div className="space-y-2">
                <Label htmlFor="m-inst">Instructions</Label>
                <Textarea
                  id="m-inst"
                  rows={6}
                  className="font-mono text-sm"
                  value={form.instructions || ''}
                  onChange={e => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
            )}
          </TabsContent>

          {/* REVIEW TAB */}
          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs uppercase text-slate-600">{key}</Label>
                  {typeof value === 'string' && value.length > 100 ? (
                    <Textarea
                      value={value}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      rows={4}
                      className="text-sm font-mono"
                    />
                  ) : Array.isArray(value) ? (
                    <Input
                      value={value.join(', ')}
                      onChange={e => setForm({ ...form, [key]: e.target.value.split(',').map(v => v.trim()) })}
                    />
                  ) : (
                    <Input
                      value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleAiReview}
                disabled={loading}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Wand2 className="w-4 h-4" /> {loading ? 'Reviewing...' : 'AI Review'}
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 flex-1 min-h-[44px]"
              >
                <Save className="w-4 h-4" /> {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
            {createMutation.error && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                Error: {createMutation.error.message}
              </div>
            )}
          </TabsContent>

          {/* AI REVIEW TAB */}
          {aiSuggestions && (
            <TabsContent value="ai-review" className="space-y-4 mt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-sm">AI Suggestions:</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {aiSuggestions.improvements?.map((imp, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600">•</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(aiSuggestions.data || {}).map(([key, value]) => (
                  <div key={key} className="space-y-1 border-b pb-2">
                    <Label className="text-xs uppercase text-slate-600">{key}</Label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 bg-slate-100 p-2 rounded text-xs font-mono">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setForm(prev => ({ ...prev, [key]: value }))}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setTab('review')} variant="outline" className="flex-1">
                  Back to Review
                </Button>
                <Button onClick={handleApplySuggestions} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
                  Apply All
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
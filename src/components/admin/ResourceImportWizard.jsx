import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Upload, FileText, ClipboardPaste, Type, Loader2, Sparkles,
  CheckCircle2, X, ChevronRight, RotateCcw, Tag
} from 'lucide-react';
import { toast } from 'sonner';

const RESOURCE_TYPES = [
  'knowledge_base', 'system', 'framework', 'process', 'methodology',
  'strategy', 'tactic', 'llm', 'api_endpoint', 'external_service',
  'tool_runner', 'rag_pipeline', 'database_access', 'sandbox_environment',
  'model_serving_infrastructure',
];

const TYPE_COLORS = {
  knowledge_base: 'bg-emerald-100 text-emerald-700',
  system: 'bg-blue-100 text-blue-700',
  framework: 'bg-violet-100 text-violet-700',
  process: 'bg-orange-100 text-orange-700',
  methodology: 'bg-pink-100 text-pink-700',
  strategy: 'bg-red-100 text-red-700',
  tactic: 'bg-yellow-100 text-yellow-700',
  llm: 'bg-slate-100 text-slate-700',
  api_endpoint: 'bg-cyan-100 text-cyan-700',
  external_service: 'bg-indigo-100 text-indigo-700',
  tool_runner: 'bg-teal-100 text-teal-700',
};

const INGEST_MODES = [
  { id: 'file', icon: Upload, label: 'File Upload', desc: 'PDF, Markdown, JSON, TXT' },
  { id: 'paste', icon: ClipboardPaste, label: 'Paste Content', desc: 'Paste raw text or markdown' },
  { id: 'text', icon: Type, label: 'Quick Note', desc: 'Type a short description' },
];

export default function ResourceImportWizard({ open, onClose, agentSkills = [], teams = [] }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1=ingest, 2=triage, 3=confirm
  const [ingestMode, setIngestMode] = useState('file');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [triaging, setTriaging] = useState(false);

  const [triageResult, setTriageResult] = useState(null);
  // triageResult shape: { display_name, description, type, tags, suggested_skills, suggested_teams, usage_hint }

  const [form, setForm] = useState({
    display_name: '',
    name: '',
    description: '',
    type: 'knowledge_base',
    tags: [],
    assignment_status: 'ready_for_duty',
    data_retrieval_method: 'file_read',
    access_config: {},
    file_urls: [],
    reference_urls: [],
    is_active: true,
    team_id: '',
  });

  const [newTag, setNewTag] = useState('');

  const reset = () => {
    setStep(1);
    setIngestMode('file');
    setRawText('');
    setFileName('');
    setUploadedFileUrl('');
    setTriageResult(null);
    setForm({
      display_name: '', name: '', description: '', type: 'knowledge_base',
      tags: [], assignment_status: 'ready_for_duty', data_retrieval_method: 'file_read',
      access_config: {}, file_urls: [], reference_urls: [], is_active: true, team_id: '',
    });
    setNewTag('');
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Step 1: File upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    try {
      // Read text for triage
      const text = await file.text();
      setRawText(text.slice(0, 8000)); // cap for LLM

      // Upload file for storage
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);
      toast.success('File loaded');
    } catch {
      toast.error('Failed to read file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const canProceedStep1 = () => {
    if (ingestMode === 'file') return !!uploadedFileUrl || !!rawText;
    return rawText.trim().length > 10;
  };

  // ── Step 2: AI Triage
  const runTriage = async () => {
    setTriaging(true);
    try {
      const skillNames = agentSkills.slice(0, 20).map(s => s.display_name || s.name).join(', ');
      const teamNames = teams.slice(0, 10).map(t => t.name).join(', ');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a resource triage AI. Analyze the following content and classify it for optimal use by AI agents and skills.

CONTENT:
"""
${rawText.slice(0, 6000)}
"""

AVAILABLE AGENT SKILLS: ${skillNames || 'none listed'}
AVAILABLE TEAMS: ${teamNames || 'none listed'}

Return a JSON object with these fields:
- display_name: string (short, human-readable title, max 5 words)
- name: string (slug version, snake_case, max 4 words)
- description: string (1-2 sentence summary of what this resource is and how agents should use it)
- type: one of [knowledge_base, system, framework, process, methodology, strategy, tactic, llm, api_endpoint, external_service, tool_runner, rag_pipeline]
- tags: array of 3-6 relevant tag strings (lowercase, no spaces)
- suggested_skills: array of skill names from the available list that would benefit most from this resource
- suggested_teams: array of team names from the available list that would use this
- data_retrieval_method: one of [file_read, api_call, database_query, search_engine, none]
- usage_hint: string (1 sentence telling agents HOW to use this resource in practice)`,
        response_json_schema: {
          type: 'object',
          properties: {
            display_name: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            suggested_skills: { type: 'array', items: { type: 'string' } },
            suggested_teams: { type: 'array', items: { type: 'string' } },
            data_retrieval_method: { type: 'string' },
            usage_hint: { type: 'string' },
          },
        },
      });

      setTriageResult(result);
      setForm(f => ({
        ...f,
        display_name: result.display_name || f.display_name,
        name: result.name || f.name,
        description: result.description || f.description,
        type: RESOURCE_TYPES.includes(result.type) ? result.type : f.type,
        tags: result.tags || f.tags,
        data_retrieval_method: result.data_retrieval_method || f.data_retrieval_method,
        file_urls: uploadedFileUrl ? [uploadedFileUrl] : f.file_urls,
      }));
      setStep(3);
    } catch (err) {
      toast.error('Triage failed — you can label manually');
      setStep(3);
    } finally {
      setTriaging(false);
    }
  };

  // ── Step 3: Save
  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Resource.create({
      ...form,
      access_config: form.access_config || {},
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success(`"${form.display_name}" added to resources`);
      handleClose();
    },
  });

  const addTag = () => {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '_');
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setNewTag('');
  };

  const removeTag = (tag) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1e3a5a]">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Import Resource
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-2">
          {['Ingest', 'Triage', 'Confirm'].map((label, i) => {
            const s = i + 1;
            const active = step === s;
            const done = step > s;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-[#1e3a5a] text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-[#1e3a5a]' : 'text-slate-400'}`}>{label}</span>
                {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: INGEST ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {INGEST_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setIngestMode(m.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all
                    ${ingestMode === m.id ? 'border-[#1e3a5a] bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <m.icon className={`w-5 h-5 mb-1 ${ingestMode === m.id ? 'text-[#1e3a5a]' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500">{m.desc}</p>
                </button>
              ))}
            </div>

            {ingestMode === 'file' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${fileName ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-[#1e3a5a] hover:bg-slate-50'}`}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 mx-auto text-slate-400 animate-spin mb-2" />
                ) : fileName ? (
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                )}
                <p className="text-sm font-semibold text-slate-700">
                  {uploading ? 'Loading…' : fileName ? fileName : 'Click to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-1">.md, .pdf, .json, .txt supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.pdf,.json,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {(ingestMode === 'paste' || ingestMode === 'text') && (
              <Textarea
                rows={ingestMode === 'paste' ? 10 : 5}
                placeholder={ingestMode === 'paste'
                  ? 'Paste your markdown, JSON, or text content here…'
                  : 'Describe this resource in a few sentences…'}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="font-mono text-sm"
              />
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                disabled={!canProceedStep1() || uploading}
                onClick={() => setStep(2)}
                className="bg-[#1e3a5a] text-white hover:bg-[#0f2438] gap-1.5"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: AI TRIAGE ── */}
        {step === 2 && (
          <div className="space-y-5 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">AI Triage</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                The AI will analyze your content and suggest the best type, tags, and which agents & skills should have access.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Content Preview</p>
              <p className="text-xs text-slate-600 font-mono line-clamp-4 whitespace-pre-wrap">
                {rawText.slice(0, 400)}{rawText.length > 400 ? '…' : ''}
              </p>
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)} className="text-slate-600">
                  Skip — Label Manually
                </Button>
                <Button
                  onClick={runTriage}
                  disabled={triaging}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  {triaging
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
                    : <><Sparkles className="w-4 h-4" /> Run AI Triage</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: CONFIRM ── */}
        {step === 3 && (
          <div className="space-y-4">
            {triageResult && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800">AI Triage Complete</p>
                  {triageResult.usage_hint && (
                    <p className="text-xs text-amber-700 mt-0.5">{triageResult.usage_hint}</p>
                  )}
                  {triageResult.suggested_skills?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Suggested agents: <span className="font-semibold">{triageResult.suggested_skills.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Display Name</Label>
                <Input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="My Resource"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug (internal name)</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="my_resource"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What is this resource and how should agents use it?"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign to Team</Label>
                <Select value={form.team_id || ''} onValueChange={v => setForm(f => ({ ...f, team_id: v }))}>
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
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tags</Label>
              <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                {form.tags.map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[tag] || 'bg-slate-100 text-slate-600'}`}>
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag…"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()}
                  className="text-sm"
                />
                <Button type="button" variant="outline" onClick={addTag} size="sm">Add</Button>
              </div>
            </div>

            {/* File attached notice */}
            {uploadedFileUrl && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-semibold truncate">{fileName} — will be attached</p>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Back
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!form.display_name || !form.name || saveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
              >
                {saveMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><CheckCircle2 className="w-4 h-4" /> Save Resource</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
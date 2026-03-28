import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch, Bot, Zap, Package, Plus, Pencil, Trash2,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, X, Save, Upload, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── MD Parser for Harness ───────────────────────────────────────────────────
function parseMdToHarness(text) {
  const lines = text.split('\n');
  const result = { name: '', description: '', routing_rules: [] };

  // Extract title from first H1
  const h1 = lines.find(l => l.startsWith('# '));
  if (h1) result.name = h1.replace(/^#\s+/, '').trim();

  // Extract description — lines after title until next heading or blank block
  const h1idx = lines.findIndex(l => l.startsWith('# '));
  if (h1idx >= 0) {
    const descLines = [];
    for (let i = h1idx + 1; i < lines.length; i++) {
      if (lines[i].startsWith('#')) break;
      descLines.push(lines[i]);
    }
    result.description = descLines.join('\n').trim();
  }

  // Extract use_case from metadata line like "use_case: linkedin_outreach"
  const ucMatch = text.match(/use[_\s]case[:\s]+([a-z_]+)/i);
  if (ucMatch) result.use_case = ucMatch[1].toLowerCase().replace(/\s+/g, '_');

  // Extract model preference
  const modelMatch = text.match(/model[_\s]preference[:\s]+([a-z0-9_]+)/i);
  if (modelMatch) result.model_preference = modelMatch[1];

  // Extract routing rules from "- condition → agent" or bullet patterns
  const ruleLines = lines.filter(l => /^[-*]\s+.+[→>].+/.test(l));
  result.routing_rules = ruleLines.map(l => {
    const [condition, agent] = l.replace(/^[-*]\s+/, '').split(/[→>]/);
    return { condition: condition?.trim(), agent_skill_id: '' };
  });

  return result;
}

// ─── Harness Modal ────────────────────────────────────────────────────────────
function HarnessModal({ open, onClose, harness, agentSkills }) {
  const qc = useQueryClient();
  const isEdit = !!harness;
  const fileInputRef = useEffect ? React.useRef(null) : null;
  const mdFileRef = React.useRef(null);
  const [mdFileName, setMdFileName] = useState(null);
  const [form, setForm] = useState(harness || {
    name: '',
    description: '',
    use_case: 'linkedin_outreach',
    default_agent_skill_id: '',
    active_agent_skill_ids: [],
    is_active: true,
    model_preference: 'automatic',
    temperature_hint: 'balanced',
  });

  React.useEffect(() => {
    setForm(harness || {
      name: '', description: '', use_case: 'linkedin_outreach',
      default_agent_skill_id: '', active_agent_skill_ids: [],
      is_active: true, model_preference: 'automatic', temperature_hint: 'balanced',
    });
    setMdFileName(null);
  }, [harness, open]);

  const handleMdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseMdToHarness(text);
    setMdFileName(file.name);
    setForm(f => ({
      ...f,
      name: parsed.name || f.name,
      description: parsed.description || f.description,
      use_case: parsed.use_case || f.use_case,
      model_preference: parsed.model_preference || f.model_preference,
      routing_rules: parsed.routing_rules?.length ? parsed.routing_rules : f.routing_rules,
    }));
  };

  const save = useMutation({
    mutationFn: () => isEdit
      ? base44.entities.Harness.update(harness.id, form)
      : base44.entities.Harness.create(form),
    onSuccess: () => { qc.invalidateQueries(['harnesses']); onClose(); },
  });

  const toggleSkill = (id) => {
    setForm(f => ({
      ...f,
      active_agent_skill_ids: f.active_agent_skill_ids?.includes(id)
        ? f.active_agent_skill_ids.filter(x => x !== id)
        : [...(f.active_agent_skill_ids || []), id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1e3a5a]">{isEdit ? 'Edit Harness' : 'New Harness'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* MD Upload */}
          {!isEdit && (
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Import from Markdown</label>
              <div
                onClick={() => mdFileRef.current?.click()}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors
                  ${mdFileName ? 'border-amber-400 bg-amber-50' : 'border-slate-300 hover:border-amber-400 hover:bg-amber-50/30'}`}
              >
                {mdFileName
                  ? <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  : <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                <span className={`text-xs ${mdFileName ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                  {mdFileName ? `Loaded: ${mdFileName}` : 'Upload .md file to pre-fill fields'}
                </span>
                {mdFileName && (
                  <button onClick={e => { e.stopPropagation(); setMdFileName(null); }}
                    className="ml-auto text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input ref={mdFileRef} type="file" accept=".md,.txt" onChange={handleMdUpload} className="hidden" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Use Case</label>
              <select value={form.use_case} onChange={e => setForm(f => ({ ...f, use_case: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {['linkedin_outreach','triage','content_generation','research','custom'].map(v => (
                  <option key={v} value={v}>{v.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Model</label>
              <select value={form.model_preference} onChange={e => setForm(f => ({ ...f, model_preference: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {['automatic','gpt_5_mini','gpt_5','claude_sonnet_4_6','gemini_3_flash'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Default Agent</label>
            <select value={form.default_agent_skill_id} onChange={e => setForm(f => ({ ...f, default_agent_skill_id: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="">None</option>
              {agentSkills.map(s => (
                <option key={s.id} value={s.id}>{s.display_name || s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Wired Agent Skills</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
              {agentSkills.map(s => {
                const active = form.active_agent_skill_ids?.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSkill(s.id)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${active
                      ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                    {s.display_name || s.name}
                  </button>
                );
              })}
              {agentSkills.length === 0 && <p className="text-xs text-slate-400">No agent skills found</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
              {form.is_active
                ? <ToggleRight className="w-6 h-6 text-green-500" />
                : <ToggleLeft className="w-6 h-6 text-slate-400" />}
            </button>
            <span className="text-sm text-slate-600">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}
              className="bg-[#1e3a5a] text-white hover:bg-[#0f2438]">
              {save.isPending ? 'Saving…' : <><Save className="w-4 h-4 mr-1.5" />Save</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Quick Edit Modal (Agent Skill) ──────────────────────────────────────────
function AgentSkillQuickModal({ open, onClose, skill }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(skill || {});

  React.useEffect(() => { setForm(skill || {}); }, [skill]);

  const save = useMutation({
    mutationFn: () => base44.entities.AgentSkill.update(skill.id, {
      display_name: form.display_name,
      description: form.description,
      instructions: form.instructions,
      is_active: form.is_active,
    }),
    onSuccess: () => { qc.invalidateQueries(['pe-agent-skills']); onClose(); },
  });

  if (!skill) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1e3a5a]">Edit Agent: {skill.display_name || skill.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Display Name</label>
            <input value={form.display_name || ''} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Instructions (Prompt)</label>
            <textarea value={form.instructions || ''} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              rows={6} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none font-mono text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
              {form.is_active
                ? <ToggleRight className="w-6 h-6 text-green-500" />
                : <ToggleLeft className="w-6 h-6 text-slate-400" />}
            </button>
            <span className="text-sm text-slate-600">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}
              className="bg-[#1e3a5a] text-white hover:bg-[#0f2438]">
              {save.isPending ? 'Saving…' : <><Save className="w-4 h-4 mr-1.5" />Save</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Card Shell ───────────────────────────────────────────────────────────────
function PECard({ icon: Icon, label, color, count, children, onAdd }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${open ? 'lg:col-span-1' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-bold text-slate-800">{label}</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">{count}</span>
        </div>
        <div className="flex items-center gap-1">
          {onAdd && (
            <button onClick={e => { e.stopPropagation(); onAdd(); }}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 pt-3 max-h-72 overflow-y-auto space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PerceptionEngineeringBar() {
  const qc = useQueryClient();
  const [harnessModal, setHarnessModal] = useState(false);
  const [editingHarness, setEditingHarness] = useState(null);
  const [editingSkill, setEditingSkill] = useState(null);

  const { data: harnesses = [] } = useQuery({
    queryKey: ['harnesses'],
    queryFn: () => base44.entities.Harness.list('-updated_date', 20),
  });

  const { data: agentSkills = [] } = useQuery({
    queryKey: ['pe-agent-skills'],
    queryFn: () => base44.entities.AgentSkill.list('-updated_date', 50),
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['pe-resources'],
    queryFn: () => base44.entities.Resource.list('-updated_date', 50),
  });

  const deleteHarness = useMutation({
    mutationFn: (id) => base44.entities.Harness.delete(id),
    onSuccess: () => qc.invalidateQueries(['harnesses']),
  });

  const toggleSkill = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.AgentSkill.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries(['pe-agent-skills']),
  });

  const activeSkills = agentSkills.filter(s => s.is_active);
  const activeHarnesses = harnesses.filter(h => h.is_active);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-[#1e3a5a] rounded-2xl p-5 shadow-lg border border-slate-700">
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#D4A574] uppercase tracking-widest">Perception Engineering</h2>
          <p className="text-xs text-slate-400 mt-0.5">Harness · Agents · Skills · Resources</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{activeHarnesses.length} harness{activeHarnesses.length !== 1 ? 'es' : ''} active</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-xs text-slate-400">{activeSkills.length} agents live</span>
        </div>
      </div>

      {/* Four cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* ── Harness ── */}
        <PECard
          icon={GitBranch}
          label="Harness"
          color="text-amber-500"
          count={harnesses.length}
          onAdd={() => { setEditingHarness(null); setHarnessModal(true); }}
        >
          {harnesses.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">No harnesses yet</p>
          )}
          {harnesses.map(h => (
            <div key={h.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 group">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{h.name}</p>
                <p className="text-xs text-slate-500 truncate">{h.use_case?.replace(/_/g, ' ')}</p>
                <div className="flex gap-1 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${h.is_active ? 'bg-green-400' : 'bg-slate-300'}`} />
                  <span className="text-xs text-slate-400">{h.active_agent_skill_ids?.length || 0} agents wired</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => { setEditingHarness(h); setHarnessModal(true); }}
                  className="p-1 rounded hover:bg-white text-slate-500 hover:text-indigo-600">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => deleteHarness.mutate(h.id)}
                  className="p-1 rounded hover:bg-white text-slate-500 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </PECard>

        {/* ── Agents ── */}
        <PECard
          icon={Bot}
          label="Agents"
          color="text-indigo-500"
          count={agentSkills.length}
        >
          {agentSkills.map(s => (
            <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 group">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{s.display_name || s.name}</p>
                <p className="text-xs text-slate-500 truncate">{s.persona_role}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0 items-center">
                <button onClick={() => toggleSkill.mutate({ id: s.id, is_active: !s.is_active })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.is_active
                    ? <ToggleRight className="w-4 h-4 text-green-500" />
                    : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                </button>
                <button onClick={() => setEditingSkill(s)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white text-slate-500 hover:text-indigo-600">
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {agentSkills.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No agents yet</p>}
        </PECard>

        {/* ── Skills ── */}
        <PECard
          icon={Zap}
          label="Skills"
          color="text-purple-500"
          count={activeSkills.length}
        >
          {agentSkills.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.is_active ? 'bg-green-400' : 'bg-slate-300'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate">{s.display_name || s.name}</p>
                {s.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-0.5">
                    {s.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-purple-50 text-purple-600 px-1.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {s.ai_agent_function_type && (
                <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">{s.ai_agent_function_type}</span>
              )}
            </div>
          ))}
          {agentSkills.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No skills yet</p>}
        </PECard>

        {/* ── Resources ── */}
        <PECard
          icon={Package}
          label="Resources"
          color="text-teal-500"
          count={resources.length}
        >
          {resources.map(r => {
            const bookingUrl = r.tags?.includes('booking') ? r.reference_urls?.[0] : null;
            return (
              <div key={r.id} className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-800 truncate">{r.display_name}</p>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.is_active ? 'bg-green-400' : 'bg-slate-300'}`} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{r.type?.replace(/_/g, ' ')}</p>
                {bookingUrl && (
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:underline truncate block mt-1">
                    📅 {bookingUrl}
                  </a>
                )}
              </div>
            );
          })}
          {resources.length === 0 && <p className="text-xs text-slate-400 text-center py-2">No resources yet</p>}
        </PECard>

      </div>

      {/* Modals */}
      <HarnessModal
        open={harnessModal}
        onClose={() => { setHarnessModal(false); setEditingHarness(null); }}
        harness={editingHarness}
        agentSkills={agentSkills}
      />
      <AgentSkillQuickModal
        open={!!editingSkill}
        onClose={() => setEditingSkill(null)}
        skill={editingSkill}
      />
    </div>
  );
}
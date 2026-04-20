import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'nps', label: 'NPS (0–10)' },
];

function makeId() {
  return 'q_' + Math.random().toString(36).slice(2, 9);
}

export default function SurveyFormEditor({ survey, isNew, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: survey.title || '',
    description: survey.description || '',
    status: survey.status || 'draft',
    target_audience: survey.target_audience || 'all_users',
    questions: survey.questions?.length ? survey.questions : [],
    opens_at: survey.opens_at || '',
    closes_at: survey.closes_at || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addQuestion = () => {
    update('questions', [...form.questions, { id: makeId(), type: 'text', label: '', required: false, options: [] }]);
  };

  const updateQuestion = (idx, patch) => {
    const next = [...form.questions];
    next[idx] = { ...next[idx], ...patch };
    update('questions', next);
  };

  const removeQuestion = (idx) => {
    update('questions', form.questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    const next = [...form.questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    update('questions', next);
  };

  const addOption = (qIdx) => {
    const next = [...form.questions];
    next[qIdx] = { ...next[qIdx], options: [...(next[qIdx].options || []), ''] };
    update('questions', next);
  };

  const updateOption = (qIdx, oIdx, val) => {
    const next = [...form.questions];
    const opts = [...(next[qIdx].options || [])];
    opts[oIdx] = val;
    next[qIdx] = { ...next[qIdx], options: opts };
    update('questions', next);
  };

  const removeOption = (qIdx, oIdx) => {
    const next = [...form.questions];
    next[qIdx] = { ...next[qIdx], options: next[qIdx].options.filter((_, i) => i !== oIdx) };
    update('questions', next);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const hasOptions = (type) => type === 'single_choice' || type === 'multiple_choice';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button onClick={onCancel} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Surveys
      </button>

      <h2 className="text-xl font-bold text-[var(--text)]">{isNew ? 'Create Survey' : 'Edit Survey'}</h2>

      {/* Basic Info */}
      <div className="space-y-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div>
          <label className="text-sm font-medium text-[var(--text)] mb-1 block">Title *</label>
          <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Season 4 Fellow Feedback" />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text)] mb-1 block">Description</label>
          <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Brief description of this survey's purpose..." rows={2} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--text)] mb-1 block">Status</label>
            <Select value={form.status} onValueChange={v => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text)] mb-1 block">Target Audience</label>
            <Select value={form.target_audience} onValueChange={v => update('target_audience', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All Users</SelectItem>
                <SelectItem value="fellows">Fellows</SelectItem>
                <SelectItem value="nominees">Nominees</SelectItem>
                <SelectItem value="investors">Investors</SelectItem>
                <SelectItem value="sponsors">Sponsors</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--text)] mb-1 block">Opens At</label>
            <Input type="datetime-local" value={form.opens_at?.slice(0, 16) || ''} onChange={e => update('opens_at', e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text)] mb-1 block">Closes At</label>
            <Input type="datetime-local" value={form.closes_at?.slice(0, 16) || ''} onChange={e => update('closes_at', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">Questions ({form.questions.length})</h3>
          <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Question
          </Button>
        </div>

        {form.questions.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-xl">
            <p className="text-sm text-[var(--muted)]">No questions yet. Add your first question above.</p>
          </div>
        )}

        {form.questions.map((q, qi) => (
          <div key={q.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--muted)] w-6">Q{qi + 1}</span>
              <div className="flex-1">
                <Input
                  value={q.label}
                  onChange={e => updateQuestion(qi, { label: e.target.value })}
                  placeholder="Question text..."
                />
              </div>
              <Select value={q.type} onValueChange={v => updateQuestion(qi, { type: v })}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => moveQuestion(qi, -1)} disabled={qi === 0}>
                  <ChevronUp className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => moveQuestion(qi, 1)} disabled={qi === form.questions.length - 1}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 cursor-pointer" onClick={() => removeQuestion(qi)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Required toggle */}
            <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={q.required || false}
                onChange={e => updateQuestion(qi, { required: e.target.checked })}
                className="rounded"
              />
              Required
            </label>

            {/* Options for choice types */}
            {hasOptions(q.type) && (
              <div className="pl-8 space-y-2">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <Input
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="text-sm h-8"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 cursor-pointer" onClick={() => removeOption(qi, oi)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addOption(qi)} className="text-xs gap-1 cursor-pointer">
                  <Plus className="w-3 h-3" /> Add Option
                </Button>
              </div>
            )}

            {/* Labels for rating/nps */}
            {(q.type === 'rating' || q.type === 'nps') && (
              <div className="pl-8 grid grid-cols-2 gap-3">
                <Input
                  value={q.min_label || ''}
                  onChange={e => updateQuestion(qi, { min_label: e.target.value })}
                  placeholder={q.type === 'nps' ? 'Not at all likely' : 'Poor'}
                  className="text-sm h-8"
                />
                <Input
                  value={q.max_label || ''}
                  onChange={e => updateQuestion(qi, { max_label: e.target.value })}
                  placeholder={q.type === 'nps' ? 'Extremely likely' : 'Excellent'}
                  className="text-sm h-8"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button variant="outline" onClick={onCancel} className="cursor-pointer">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!form.title.trim() || saving}
          className="bg-[#1e3a5a] hover:bg-[#1e3a5a]/90 text-white cursor-pointer"
        >
          {saving ? 'Saving...' : isNew ? 'Create Survey' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
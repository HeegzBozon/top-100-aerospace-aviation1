import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['welcome', 'follow_up', 'payment_reminder', 'kickoff', 'custom'];

const VARIABLES = [
  { key: '{{client_name}}', desc: "Client's name" },
  { key: '{{package_name}}', desc: 'Package internal name' },
  { key: '{{onboarding_url}}', desc: 'Link to onboarding page' },
  { key: '{{deposit_amount}}', desc: 'Deposit $' },
  { key: '{{total_amount}}', desc: 'Total contract $' },
];

export default function EmailTemplateEditor({ template, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: template?.name ?? '',
    category: template?.category ?? 'custom',
    subject: template?.subject ?? '',
    body: template?.body ?? '',
    is_default: template?.is_default ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const insertVar = (v) => setForm(f => ({ ...f, body: f.body + v }));

  const handleSave = async () => {
    setSaving(true);
    if (template?.id) {
      await base44.entities.EmailTemplate.update(template.id, form);
    } else {
      await base44.entities.EmailTemplate.create(form);
    }
    setSaving(false);
    onSave();
  };

  const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Template Name *</label>
          <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Welcome Email" />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Subject Line *</label>
        <input className={inputClass} value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="Welcome {{client_name}} — Your Project Starts Here" />
      </div>
      <div>
        <label className={labelClass}>Body *</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {VARIABLES.map(v => (
            <button key={v.key} onClick={() => insertVar(v.key)} title={v.desc}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-mono transition-colors">
              {v.key}
            </button>
          ))}
        </div>
        <textarea
          className={`${inputClass} h-64 resize-none font-mono text-xs leading-relaxed`}
          value={form.body}
          onChange={e => set('body', e.target.value)}
          placeholder="Hi {{client_name}},&#10;&#10;Your onboarding page is ready..."
        />
      </div>
      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button onClick={handleSave} disabled={saving || !form.name || !form.subject || !form.body}>
          {saving ? 'Saving...' : template?.id ? 'Update Template' : 'Create Template'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
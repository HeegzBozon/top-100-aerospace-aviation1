import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B, ACCENTS } from '@/components/fellow-home/fellowHomeConfig';
import { RESOURCE_TYPES, LEVELS } from './careerResourceConfig';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border bg-white outline-none focus:ring-1';
const inputStyle = { borderColor: B.border, color: B.navy };

// Admin-only composer for the curated career library.
export default function CareerResourceComposer({ accent = B.navy, onSubmitted }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [resourceType, setResourceType] = useState('guide');
  const [level, setLevel] = useState('all');
  const [domain, setDomain] = useState('');
  const [link, setLink] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      await base44.entities.CareerResource.create({
        title: title.trim(),
        summary: summary.trim(),
        resource_type: resourceType,
        level,
        domain_focus: domain || undefined,
        link: link.trim(),
        source_name: sourceName.trim(),
        is_active: true,
      });
      toast.success('Resource added to the center.');
      setTitle(''); setSummary(''); setLink(''); setSourceName(''); setDomain('');
      onSubmitted?.();
    } catch {
      toast.error('Could not add resource.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: B.border, background: B.cream }}>
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Add a Career Resource</span>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputCls} style={inputStyle} />
      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" rows={2} className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className={inputCls} style={inputStyle}>
          {RESOURCE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls} style={inputStyle}>
          {LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
        </select>
      </div>
      <select value={domain} onChange={(e) => setDomain(e.target.value)} className={inputCls} style={inputStyle}>
        <option value="">No domain focus</option>
        {ACCENTS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
      </select>
      <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link URL (optional)" className={inputCls} style={inputStyle} />
      <input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Source / author (optional)" className={inputCls} style={inputStyle} />
      <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60" style={{ background: accent, color: '#fff' }}>
        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding</> : 'Add Resource'}
      </button>
    </form>
  );
}
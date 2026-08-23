import { useState } from 'react';
import { Briefcase, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { JOB_TYPE_LABELS, EXP_LABELS, REMOTE_LABELS } from './jobBoardConfig';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border bg-white outline-none focus:ring-1';
const inputStyle = { borderColor: B.border, color: B.navy };

// Member-facing job composer. Any Fellow can post a role on behalf of their
// company without an Employer record. Creates a Job with status 'active'.
export default function JobComposer({ user, accent = B.navy, onSubmitted }) {
  const [form, setForm] = useState({
    title: '',
    company_name: '',
    job_type: 'full_time',
    experience_level: 'mid',
    location: '',
    remote_policy: 'onsite',
    summary: '',
    description: '',
    application_url: '',
    application_email: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      toast.error('Title, location, and description are required.');
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Job.create({
        ...form,
        poster_email: user?.email,
        poster_name: user?.full_name,
        status: 'active',
        posted_date: new Date().toISOString(),
      });
      toast.success('Role posted to the board.');
      setForm({ title: '', company_name: '', job_type: 'full_time', experience_level: 'mid', location: '', remote_policy: 'onsite', summary: '', description: '', application_url: '', application_email: '' });
      onSubmitted?.();
    } catch {
      toast.error('Could not post the role. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: B.border, background: B.cream }}>
      <div className="flex items-center gap-2">
        <Briefcase className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Post a Role</span>
      </div>
      <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Role title *" className={inputCls} style={inputStyle} />
      <input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="Company name" className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.job_type} onChange={(e) => set('job_type', e.target.value)} className={inputCls} style={inputStyle}>
          {Object.entries(JOB_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={form.experience_level} onChange={(e) => set('experience_level', e.target.value)} className={inputCls} style={inputStyle}>
          {Object.entries(EXP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Location *" className={inputCls} style={inputStyle} />
        <select value={form.remote_policy} onChange={(e) => set('remote_policy', e.target.value)} className={inputCls} style={inputStyle}>
          {Object.entries(REMOTE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <textarea value={form.summary} onChange={(e) => set('summary', e.target.value)} placeholder="Short summary (250 chars)" maxLength={250} rows={2} className={inputCls} style={inputStyle} />
      <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Full description *" rows={4} className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.application_url} onChange={(e) => set('application_url', e.target.value)} placeholder="Application URL" className={inputCls} style={inputStyle} />
        <input value={form.application_email} onChange={(e) => set('application_email', e.target.value)} placeholder="Or application email" className={inputCls} style={inputStyle} />
      </div>
      <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60" style={{ background: accent, color: '#fff' }}>
        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting</> : 'Post Role'}
      </button>
    </form>
  );
}
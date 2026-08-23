import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { CATEGORY_OPTIONS, DURATION_OPTIONS } from './introConfig';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border bg-white outline-none focus:ring-1';
const inputStyle = { borderColor: B.border, color: B.navy };

// Member availability composer. A Fellow posts what they make themselves
// available for — chosen from curated categories, never a price tag. The
// chamber surfaces it; introductions happen off-board.
export default function AvailabilityComposer({ user, accent = B.navy, onSubmitted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const toggleCat = (c) => setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }
    setSaving(true);
    try {
      await base44.entities.Service.create({
        title: title.trim(),
        description: description.trim(),
        provider_user_email: user?.email,
        provider_name: user?.full_name,
        provider_type: 'community',
        category: categories,
        duration_minutes: duration,
        is_active: true,
        is_draft: false,
      });
      toast.success('Availability posted to the chamber.');
      setTitle(''); setDescription(''); setCategories([]); setDuration(60);
      onSubmitted?.();
    } catch {
      toast.error('Could not post availability. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: B.border, background: B.cream }}>
      <div className="flex items-center gap-2">
        <Send className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Make Yourself Available</span>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What you offer (e.g. Strategy advisory)" className={inputCls} style={inputStyle} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you make yourself available for *" rows={3} className={inputCls} style={inputStyle} />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggleCat(c)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors"
            style={categories.includes(c) ? { background: accent, color: '#fff' } : { background: '#fff', color: B.muted, border: `1px solid ${B.border}` }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px]" style={{ color: B.muted }}>Typical intro length</span>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="px-2 py-1 rounded-lg text-sm border bg-white outline-none" style={inputStyle}>
          {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
        </select>
      </div>
      <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60" style={{ background: accent, color: '#fff' }}>
        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting</> : 'Post Availability'}
      </button>
    </form>
  );
}
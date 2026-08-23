import { useState } from 'react';
import { Scissors, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { MILESTONE_RITUALS, MILESTONE_TYPES } from './ribbonCuttingConfig';

// Compact composer for creating a member-company milestone convening. Creates
// an Event with the chamber_ritual taxonomy preset, so it lands in the Ribbon
// Cuttings surface. Admin-gated by the parent view.
export default function RibbonCuttingComposer({ user, accent = B.navy, onSubmitted }) {
  const [title, setTitle] = useState('');
  const [ritual, setRitual] = useState('Ribbon Cutting');
  const [when, setWhen] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !when) { toast.error('Add a title and date.'); return; }
    setSaving(true);
    try {
      const meta = MILESTONE_TYPES[ritual];
      await base44.entities.Event.create({
        title: title.trim(),
        event_date: new Date(when).toISOString(),
        experience_type: meta.exp,
        chamber_ritual: ritual,
        location: location.trim(),
        host_email: user?.email,
        host_name: user?.full_name,
        source: 'official',
        is_official: true,
        status: 'upcoming',
        attendees: [],
        rsvp_count: 0,
      });
      toast.success('Ribbon cutting published.');
      setTitle(''); setWhen(''); setLocation('');
      onSubmitted?.();
    } catch {
      toast.error('Could not publish. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm border bg-white outline-none focus:ring-1';
  const inputStyle = { borderColor: B.border, color: B.navy };

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: B.border, background: B.cream }}>
      <div className="flex items-center gap-2">
        <Scissors className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>New Ribbon Cutting</span>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Company / milestone name" className={inputCls} style={inputStyle} />
      <div className="grid grid-cols-2 gap-2">
        <select value={ritual} onChange={(e) => setRitual(e.target.value)} className={inputCls} style={inputStyle}>
          {MILESTONE_RITUALS.map((r) => <option key={r} value={r}>{MILESTONE_TYPES[r].label}</option>)}
        </select>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputCls} style={inputStyle} />
      </div>
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className={inputCls} style={inputStyle} />
      <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-60" style={{ background: accent, color: '#fff' }}>
        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing</> : 'Publish'}
      </button>
    </form>
  );
}
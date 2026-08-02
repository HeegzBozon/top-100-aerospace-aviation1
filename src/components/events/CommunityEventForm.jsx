import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EXPERIENCE_TYPES = [
  'Workshop',
  'Office Hours',
  'Live Build',
  'Build Challenge',
  'AMA',
  'Mission Theatre',
  'Awards',
  'Social',
  'Celebration',
  'Meetup',
  'Training',
];

const GUILDS = ['Builders', 'Mission Control', 'Local Legends', 'Investors', 'Alumni', 'Open Community'];

const FIELD = 'w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#c9a87c]/60 focus:outline-none focus:ring-1 focus:ring-[#c9a87c]/40 transition-colors';

export default function CommunityEventForm({ user, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    experience_type: 'Workshop',
    guild: 'Open Community',
    description: '',
    event_date: '',
    location: '',
    meeting_url: '',
    cover_image_url: '',
    capacity: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      toast.info('Sign in to host an event');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        experience_type: form.experience_type,
        guild: form.guild,
        event_date: new Date(form.event_date).toISOString(),
        location: form.location.trim() || 'Virtual',
        meeting_url: form.meeting_url.trim(),
        cover_image_url: form.cover_image_url.trim(),
        capacity: form.capacity ? Number(form.capacity) : 0,
        status: 'upcoming',
        source: 'community',
        moderation_status: 'pending',
        is_official: false,
        is_public: false,
        host_email: user.email,
        host_name: user.full_name || user.email,
        organizer: user.full_name || user.email,
        submitted_by_email: user.email,
        attendees: [],
        rsvp_count: 0,
        tags: [form.experience_type, form.guild],
      };
      await base44.entities.Event.create(payload);
      toast.success('Submitted for review — you will be notified when it goes live.');
      onDone?.();
      setForm({ title: '', experience_type: 'Workshop', guild: 'Open Community', description: '', event_date: '', location: '', meeting_url: '', cover_image_url: '', capacity: '' });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-[#c9a87c]">
        <Sparkles className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-[0.22em]">Host an Experience</span>
      </div>
      <p className="-mt-2 text-xs leading-relaxed text-white/50">
        Community members & ambassadors can submit an event. It goes to a short moderation queue before appearing on the official calendar — keeping the verified-reputation bar.
      </p>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Event Title</Label>
        <Input value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="e.g. Connectors: Live Build" className={FIELD} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Format</Label>
          <Select value={form.experience_type} onValueChange={(v) => set('experience_type', v)}>
            <SelectTrigger className={FIELD}>{form.experience_type}</SelectTrigger>
            <SelectContent>
              {EXPERIENCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Guild</Label>
          <Select value={form.guild} onValueChange={(v) => set('guild', v)}>
            <SelectTrigger className={FIELD}>{form.guild}</SelectTrigger>
            <SelectContent>
              {GUILDS.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Date & Time</Label>
        <Input type="datetime-local" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} required className={FIELD} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Location</Label>
          <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="City or 'Virtual'" className={FIELD} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Capacity</Label>
          <Input type="number" min="0" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} placeholder="0 = unlimited" className={FIELD} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Meeting / Stream URL</Label>
        <Input value={form.meeting_url} onChange={(e) => set('meeting_url', e.target.value)} placeholder="https://…" className={FIELD} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-white/60">Description</Label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="What will people learn or experience?"
          className={`${FIELD} min-h-[84px] resize-none`}
        />
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all hover:shadow-[0_0_30px_rgba(201,168,124,0.45)] disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #c9a87c, #d8b98d)', color: '#07111f' }}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? 'Submitting…' : 'Submit for Review'}
      </motion.button>
    </form>
  );
}
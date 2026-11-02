import { useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C } from '@/components/crm/crmConfig';
import { PURPOSES, FORMATS } from './meetingConfig';

const field = 'w-full rounded-md bg-white px-3 py-2 text-sm outline-none';

// Ask someone for time: who, what for, when, and how you'll meet.
export default function BookMeetingForm({ user, initialName = '', source, onBooked }) {
  const [f, setF] = useState({ recipient_name: initialName, recipient_email: '', purpose: 'intro', format: 'video', start_time: '', duration_minutes: 30, agenda: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.recipient_email)) return setError('Enter a valid email for who you are meeting.');
    if (!f.start_time) return setError('Pick a date and time.');
    setBusy(true); setError('');
    try {
      await base44.entities.MeetingRequest.create({
        ...f, duration_minutes: Number(f.duration_minutes), start_time: new Date(f.start_time).toISOString(),
        requester_email: user.email, requester_name: user.full_name, status: 'requested', source,
      });
      setF({ ...f, recipient_name: '', recipient_email: '', start_time: '', agenda: '' });
      onBooked?.();
    } catch (err) { setError(err.message || 'Could not send the request.'); }
    finally { setBusy(false); }
  };

  const box = { border: `1px solid ${C.border}`, color: C.navy };
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl bg-white/60 p-4 sm:grid-cols-2" style={{ border: `1px solid ${C.border}` }}>
      <input className={field} style={box} placeholder="Their name" value={f.recipient_name} onChange={set('recipient_name')} />
      <input className={field} style={box} type="email" placeholder="Their email" value={f.recipient_email} onChange={set('recipient_email')} />
      <select className={field} style={box} value={f.purpose} onChange={set('purpose')}>{PURPOSES.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select>
      <select className={field} style={box} value={f.format} onChange={set('format')}>{FORMATS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select>
      <input className={field} style={box} type="datetime-local" value={f.start_time} onChange={set('start_time')} />
      <select className={field} style={box} value={f.duration_minutes} onChange={set('duration_minutes')}>{[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select>
      <textarea className={`${field} sm:col-span-2`} style={box} rows={2} maxLength={400} placeholder="What's it for? (optional)" value={f.agenda} onChange={set('agenda')} />
      {error && <p className="text-xs text-red-700 sm:col-span-2">{error}</p>}
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white sm:col-span-2" style={{ background: '#B87333' }}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />} Request meeting
      </button>
    </form>
  );
}
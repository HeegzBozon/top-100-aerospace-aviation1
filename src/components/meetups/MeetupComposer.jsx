import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import moment from 'moment';
import { B, FORMATS, ACCESS_TIERS, COVERS } from './meetupConfig';
import { base44 } from '@/api/base44Client';

const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none';
const inputStyle = { border: `1px solid ${B.border}`, background: '#fff', color: B.navy };
const labelCls = 'block text-xs font-medium mb-1.5';

export default function MeetupComposer({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '18:00',
    experience_type: 'Meetup',
    member_tier: 'Member',
    location: '',
    cover_image_url: COVERS[1].url,
    capacity: 0,
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.date) return;
    setLoading(true);
    try {
      const dt = moment(`${form.date}T${form.time || '18:00'}`);
      const ev = await base44.entities.Event.create({
        title: form.title,
        description: form.description,
        event_date: dt.toISOString(),
        experience_type: form.experience_type,
        member_tier: form.member_tier,
        location: form.location,
        cover_image_url: form.cover_image_url,
        capacity: Number(form.capacity) || 0,
        host_email: user.email,
        host_name: user.full_name,
        host_avatar_url: user.avatar_url || '',
        attendees: [],
        rsvp_count: 0,
        status: 'upcoming',
        source: 'community',
        is_official: false,
        is_public: false,
      });
      onCreated(ev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(22,41,63,0.55)' }}>
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto" style={{ background: B.cream }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl" style={{ color: B.navy }}>Host a Meetup</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={20} style={{ color: B.muted }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls} style={{ color: B.navy }}>Title</label>
            <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="An evening with the committee" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: B.navy }}>Date</label>
              <input type="date" className={inputCls} style={inputStyle} value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls} style={{ color: B.navy }}>Time</label>
              <input type="time" className={inputCls} style={inputStyle} value={form.time} onChange={(e) => set('time', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: B.navy }}>Format</label>
              <select className={inputCls} style={inputStyle} value={form.experience_type} onChange={(e) => set('experience_type', e.target.value)}>
                {FORMATS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: B.navy }}>Access tier</label>
              <select className={inputCls} style={inputStyle} value={form.member_tier} onChange={(e) => set('member_tier', e.target.value)}>
                {ACCESS_TIERS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: B.navy }}>Location</label>
            <input className={inputCls} style={inputStyle} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Antalya, Türkiye — or Virtual" />
          </div>

          <div>
            <label className={labelCls} style={{ color: B.navy }}>Capacity (0 = unlimited)</label>
            <input type="number" min="0" className={inputCls} style={inputStyle} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
          </div>

          <div>
            <label className={labelCls} style={{ color: B.navy }}>Cover — verified asset library</label>
            <div className="grid grid-cols-3 gap-2">
              {COVERS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => set('cover_image_url', c.url)}
                  className="aspect-video rounded-lg overflow-hidden border-2"
                  style={{ borderColor: form.cover_image_url === c.url ? B.gold : 'transparent' }}
                >
                  {c.url ? (
                    <img src={c.url} alt={c.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full" style={{ background: B.sand }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: B.navy }}>Description</label>
            <textarea rows={3} className={inputCls} style={inputStyle} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What this gathering is for, and who should be in the room." />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !form.title || !form.date}
          className="w-full mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold"
          style={{ background: loading || !form.title || !form.date ? B.muted : B.navy, color: '#fff' }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          Create meetup
        </button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { CheckCircle2, Loader2, X } from 'lucide-react';

// A Fellow declares or cancels attendance on a Conference Room.
// RSVPs are Fellow-owned records (RLS enforces ownership); attendance is
// display-only coordination signal until independently verified.
export default function RsvpControl({ room, myRsvp, user, accent, onChanged }) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const canRsvp = room.status === 'open' || room.status === 'live';

  const submit = async () => {
    if (!user?.email) return;
    setBusy(true);
    try {
      await base44.entities.ConferenceRsvp.create({
        room_id: room.id,
        conference_name: room.conference_name,
        fellow_email: user.email,
        fellow_name: user.full_name || '',
        fellow_avatar_url: user.avatar_url || '',
        focus_area: focus || '',
        status: 'attending',
        notes: notes || '',
        declared_at: new Date().toISOString(),
      });
      setOpen(false);
      setFocus('');
      setNotes('');
      onChanged();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!myRsvp) return;
    setBusy(true);
    try {
      await base44.entities.ConferenceRsvp.delete(myRsvp.id);
      onChanged();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  if (!canRsvp) return null;

  if (myRsvp) {
    return (
      <div className="flex items-center justify-between gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: accent }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> You're attending
          {myRsvp.focus_area ? <span className="font-normal" style={{ color: B.muted }}>· {myRsvp.focus_area}</span> : null}
        </span>
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
          style={{ color: B.muted }}
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Cancel
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
        style={{ background: `${accent}10`, color: accent, border: `1px solid ${accent}33` }}
      >
        <CheckCircle2 className="w-3.5 h-3.5" /> I'm attending
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg p-3" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {(room.focus_areas || []).length > 0 && (
        <div className="mb-2">
          <label className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: B.muted }}>Focus area</label>
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="w-full text-xs rounded-md px-2 py-1.5"
            style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
          >
            <option value="">General attendance</option>
            {(room.focus_areas || []).map((f) => (
              <option key={f.key} value={f.label}>{f.label}</option>
            ))}
          </select>
        </div>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional coordination note (who you want to meet, what you're looking for)…"
        rows={2}
        className="w-full text-xs rounded-md px-2 py-1.5 mb-2 resize-none"
        style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-50"
          style={{ background: accent, color: '#fff' }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Confirm
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[10px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: B.muted }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
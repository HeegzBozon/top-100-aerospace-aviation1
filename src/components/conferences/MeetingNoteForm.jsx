import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B, placeLabel } from './conferenceConfig';

// A note filed from a conference, in the reader's own private rolodex. What is written here
// belongs to whoever wrote it — the other party sees nothing, exchanges nothing, and is not
// told it exists. The note is the recall: who they were, what was said, and the one line the
// follow-up is built from.
export default function MeetingNoteForm({ room, person, existing, user, onSaved, onCancel }) {
  const [note, setNote] = useState(existing?.notes || '');
  const [next, setNext] = useState(existing?.next_step || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const name = person?.fellow_name || person?.fellow_email || '';

  const save = async () => {
    if (!user?.email || !note.trim()) return;
    setBusy(true);
    setError('');
    try {
      const fields = {
        owner_email: user.email,
        full_name: person?.fellow_name || person?.fellow_email || 'Fellow',
        email: person?.fellow_email || '',
        conference_name: room?.conference_name || '',
        met_on: new Date().toISOString().slice(0, 10),
        met_context: [person?.focus_area, room?.venue || placeLabel(room)].filter(Boolean).join(' · '),
        notes: note.trim(),
        next_step: next.trim(),
        last_touch: new Date().toISOString(),
        source: 'manual',
      };

      const saved = existing?.id
        ? await base44.entities.ConferenceContact.update(existing.id, fields)
        : await base44.entities.ConferenceContact.create(fields);

      onSaved?.(saved);
    } catch (saveError) {
      setError('The note could not be filed. Nothing was lost — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-1.5 rounded-sm p-2.5" style={{ background: B.sand, border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>
          Note on {name}
        </p>
        <button type="button" onClick={onCancel} aria-label="Close" style={{ color: B.muted }}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="What was said, and what matters to them…"
        className="mt-1.5 w-full resize-none rounded-sm px-2 py-1.5 text-[12px]"
        style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
      />
      <input
        value={next}
        onChange={(e) => setNext(e.target.value)}
        placeholder="The next step, if there is one"
        className="mt-1.5 w-full rounded-sm px-2 py-1.5 text-[12px]"
        style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
      />

      {error && <p className="mt-1.5 text-[11px]" style={{ color: '#8c2f2f' }}>{error}</p>}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy || !note.trim()}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
          style={{ background: B.copper, color: '#fff' }}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null} File note
        </button>
        <span className="text-[10px] italic" style={{ color: B.muted }}>Private to you</span>
      </div>
    </div>
  );
}
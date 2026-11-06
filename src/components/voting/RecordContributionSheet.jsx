import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';

// The two ways a reader can give the record something back: a correction to a field it
// prints, or a note about the person it belongs to. Both land in the same filing the
// desk already reviews (ProfileEditRequest), so nothing new has to be moderated — a
// correction names the field it proposes to change, a note is filed against the record
// as context and writes nothing over it.
const FIELDS = [
  { value: 'bio', label: 'Biography', multiline: true },
  { value: 'description', label: 'Summary', multiline: true },
  { value: 'six_word_story', label: 'Six-word story' },
  { value: 'one_word', label: 'One word' },
  { value: 'elevator_pitch', label: 'Elevator pitch', multiline: true },
  { value: 'professional_role', label: 'Role' },
  { value: 'achievements', label: 'Achievements', multiline: true },
  { value: 'skills', label: 'Practice' },
  { value: 'career_history', label: 'Flightography', multiline: true },
];

export default function RecordContributionSheet({ nominee, token, mode = 'edit', open, onClose }) {
  // The door a reader came in by is the one already chosen; the other is one press away,
  // so either entry point (the panel's footer, a card's own key) offers both.
  const [tab, setTab] = useState(mode);
  const note = tab === 'note';
  const [field, setField] = useState('bio');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [source, setSource] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const name = nominee?.name || 'this record';
  const selected = FIELDS.find((f) => f.value === field);

  const send = async () => {
    if (!value.trim()) return setError(note ? 'Write the note first.' : 'Write the correction first.');
    if (!note && !reason.trim()) return setError('Say why the record should change.');
    setError('');
    setSending(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ProfileEditRequest.create({
        nominee_id: nominee.id,
        field_name: note ? 'community_note' : field,
        current_value: note ? '' : String(nominee[field] ?? ''),
        proposed_value: value.trim(),
        reason: reason.trim() || value.trim(),
        source_url: source.trim(),
        submitted_by: user.email,
        status: 'pending',
      });
      toast.success(note ? 'Note sent to the desk' : 'Correction sent to the desk');
      setValue('');
      setReason('');
      setSource('');
      onClose();
    } catch {
      setError('That did not send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { background: 'white', border: `1px solid ${brand.navy}1F`, color: brand.navy };
  const labelStyle = { color: ink.soft };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border-0 p-0" style={{ background: brand.cream }}>
        <DialogHeader className="border-b px-5 py-3.5" style={{ borderColor: `${brand.navy}10` }}>
          <DialogTitle className="text-sm font-bold" style={{ color: brand.navy }}>
            {note ? 'Add a community note' : 'Request a correction'}
          </DialogTitle>
          <p className="text-[11px]" style={{ color: ink.soft }}>
            {note
              ? `Context the desk should hold about ${name}.`
              : `What ${name}'s record is getting wrong, and where to check it.`}
          </p>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="flex gap-1.5">
            {[['edit', 'Correction'], ['note', 'Community note']].map(([key, label]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setTab(key); setError(''); }}
                  className="flex-1 rounded-lg px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={active
                    ? { background: brand.navy, color: '#F7F3EA' }
                    : { background: 'white', border: `1px solid ${brand.navy}1F`, color: ink.soft }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {!note && (
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em]" style={labelStyle}>Field</span>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full rounded-lg px-2.5 py-2 text-[13px] outline-none"
                style={inputStyle}
              >
                {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em]" style={labelStyle}>
              {note ? 'The note' : 'What it should say'}
            </span>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              maxLength={1200}
              className="w-full resize-none rounded-lg px-2.5 py-2 text-[13px] leading-relaxed outline-none"
              style={inputStyle}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em]" style={labelStyle}>
              {note ? 'Why it matters (optional)' : 'Why'}
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={600}
              className="w-full resize-none rounded-lg px-2.5 py-2 text-[13px] leading-relaxed outline-none"
              style={inputStyle}
            />
          </label>

          {!note && (
            <label className="block">
              <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em]" style={labelStyle}>
                Where to check it (optional)
              </span>
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                inputMode="url"
                placeholder="https://"
                className="w-full rounded-lg px-2.5 py-2 text-[13px] outline-none"
                style={inputStyle}
              />
            </label>
          )}

          {error && <p className="text-[11.5px]" style={{ color: '#A63B2A' }}>{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em] disabled:opacity-60"
              style={{ background: brand.navy, color: '#F7F3EA' }}
            >
              {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Send to the desk
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.14em]"
              style={{ background: 'white', border: `1px solid ${brand.navy}1F`, color: ink.body }}
            >
              Close
            </button>
          </div>
          <p className="text-[10px] leading-snug" style={{ color: ink.soft }}>
            Filed as {token ? `record ${token}` : 'a record'} correction. Nothing on the record changes until the desk reviews it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
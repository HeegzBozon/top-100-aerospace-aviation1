import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import ContactField from './ContactField';
import ContactTagPicker from './ContactTagPicker';
import { C, CONTACT_KEYS, EMPTY_CONTACT, PERSON_FIELDS, SHOW_FIELDS, TAG_SUGGESTIONS, isEmailShaped, splitName } from './crmConfig';

// The draft, read from the card and then read by the Fellow who was there. Nothing is
// saved until it is confirmed here, and an address that is not shaped like one is
// refused at this line rather than stored and discovered later.
export default function ContactDraftForm({ initial, cardUri, saving, submitLabel = 'Save to the rolodex', onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...EMPTY_CONTACT, ...(initial || {}) });
  const [errors, setErrors] = useState({});

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!draft.full_name.trim()) next.full_name = 'A contact needs a name.';
    if (draft.email.trim() && !isEmailShaped(draft.email)) {
      next.email = 'That address is not shaped like an email.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    const names = draft.first_name && draft.last_name ? {} : splitName(draft.full_name);
    const payload = {};
    CONTACT_KEYS.forEach((key) => {
      payload[key] = key === 'tags' ? draft.tags || [] : draft[key] || '';
    });

    onSave({
      ...payload,
      ...names,
      full_name: draft.full_name.trim(),
      email: draft.email.trim(),
      card_file_uri: cardUri || draft.card_file_uri || '',
      source: cardUri || draft.card_file_uri ? 'card' : 'manual',
    });
  };

  const areaStyle = {
    border: `1px solid ${C.border}`,
    background: C.surface,
    color: C.navy,
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-2xl p-4 md:p-5"
      style={{ background: C.paper, border: `1px solid ${C.border}` }}
    >
      {cardUri ? (
        <p className="mb-4 text-[11px] leading-relaxed" style={{ color: C.muted }}>
          Read from the card. Correct anything the card got wrong, and fill what it did not
          carry — the card stays attached to the record.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {PERSON_FIELDS.map((field) => (
          <ContactField
            key={field.key}
            field={field}
            value={draft[field.key]}
            onChange={set}
            error={errors[field.key]}
          />
        ))}
      </div>

      <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: C.copper }}>
        The show
      </p>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {SHOW_FIELDS.map((field) => (
          <ContactField key={field.key} field={field} value={draft[field.key]} onChange={set} />
        ))}
      </div>

      <p className="mt-5 text-[8px] font-bold uppercase tracking-[0.28em]" style={{ color: C.copper }}>
        The follow-up
      </p>
      <div className="mt-2 space-y-3">
        <ContactTagPicker
          tags={draft.tags}
          suggestions={TAG_SUGGESTIONS}
          onChange={(tags) => set('tags', tags)}
        />
        <label className="block">
          <span className="block text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: C.muted }}>
            What was agreed next
          </span>
          <input
            value={draft.next_step || ''}
            onChange={(event) => set('next_step', event.target.value)}
            placeholder="Send the mission brief when it lands"
            className="mt-1 w-full rounded-lg px-3 py-2 text-[13px] outline-none"
            style={areaStyle}
          />
        </label>
        <label className="block">
          <span className="block text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: C.muted }}>
            Notes: what was said, what matters to them
          </span>
          <textarea
            value={draft.notes || ''}
            onChange={(event) => set('notes', event.target.value)}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg px-3 py-2 text-[13px] leading-relaxed outline-none"
            style={areaStyle}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] disabled:opacity-60"
          style={{ background: C.copper, color: C.cream }}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ border: `1px solid ${C.border}`, color: C.navy, background: C.surface }}
        >
          <X className="h-3.5 w-3.5" /> Not now
        </button>
      </div>
    </form>
  );
}
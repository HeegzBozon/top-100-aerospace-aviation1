import { useState } from 'react';
import { Check, Loader2, PencilLine, ShieldCheck } from 'lucide-react';
import {
  B, HEAT, RELATIONSHIP_TYPES, emailLooksReal,
} from './journeyConfig';
import {
  Chip, Field, GhostKey, Key, Panel, SectionLabel, inputStyle,
} from './bits';

const BLANK = {
  full_name: '',
  company: '',
  email: '',
  linkedin_url: '',
  relationship_type: 'peer',
  heat: 'warm',
  notes: '',
  promise: '',
  next_step: '',
};

// CAPTURE — the ten seconds after the handshake.
//
// The single action the whole journey protects: who, what they need, what was promised.
// It is one thumb, it never asks for more than it needs, and it refuses to save anyone
// whose details were not offered. If the floor has no line the row is held on the device
// and written the moment the line returns.
export default function CapturePanel({ onCapture }) {
  const [form, setForm] = useState(BLANK);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError('');
    if (!form.full_name.trim()) {
      setError('A name is the one thing you cannot get back later.');
      return;
    }
    if (!emailLooksReal(form.email)) {
      setError('That email does not look complete. Correct it, or leave it blank.');
      return;
    }
    if (!consent) {
      setError('Confirm they agreed before you keep their details.');
      return;
    }

    setStatus('saving');
    try {
      const result = await onCapture({
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
        promise: form.promise.trim(),
        next_step: form.next_step.trim(),
      });
      setStatus(result?.queued ? 'queued' : 'saved');
    } catch {
      setStatus('idle');
      setError('It did not save. Try once more.');
    }
  };

  const again = () => {
    setForm(BLANK);
    setConsent(false);
    setStatus('idle');
    setError('');
  };

  if (status === 'saved' || status === 'queued') {
    return (
      <Panel>
        <div className="flex items-start gap-2">
          {status === 'saved'
            ? <Check className="mt-0.5 h-4 w-4" style={{ color: B.copper }} />
            : <PencilLine className="mt-0.5 h-4 w-4" style={{ color: B.copper }} />}
          <div>
            <p className="font-heading text-[17px]" style={{ color: B.navy }}>
              {status === 'saved' ? 'On the record.' : 'Held on this device.'}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
              {status === 'saved'
                ? 'They are in your debrief tonight, and in the follow-up queue.'
                : 'There is no line here. The row is written the moment there is one — nothing is lost.'}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <GhostKey onClick={again}>Capture the next one</GhostKey>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <SectionLabel count={status === 'saving' ? 'saving' : undefined}>Ten seconds</SectionLabel>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: B.muted }}>
        Note it while you are still standing there. Everything else can be filled in tonight.
      </p>

      <div className="mt-3 flex flex-col gap-2.5">
        <Field label="Name">
          <input
            value={form.full_name}
            onChange={(event) => set('full_name', event.target.value)}
            placeholder="Who did you just meet?"
            autoComplete="off"
            style={inputStyle}
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Company">
            <input
              value={form.company}
              onChange={(event) => set('company', event.target.value)}
              placeholder="Organization"
              style={inputStyle}
            />
          </Field>
          <Field label="Email">
            <input
              value={form.email}
              onChange={(event) => set('email', event.target.value)}
              placeholder="If given"
              inputMode="email"
              autoComplete="off"
              style={inputStyle}
            />
          </Field>
        </div>

        <Field label="They are">
          <div className="mt-1 flex flex-wrap gap-1.5">
            {RELATIONSHIP_TYPES.map((type) => (
              <Chip
                key={type.key}
                active={form.relationship_type === type.key}
                onClick={() => set('relationship_type', type.key)}
              >
                {type.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="The conversation">
          <div className="mt-1 flex flex-wrap gap-1.5">
            {HEAT.map((level) => (
              <Chip
                key={level.key}
                active={form.heat === level.key}
                onClick={() => set('heat', level.key)}
              >
                {level.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="The note" hint="Who they are, what they need, what they said.">
          <textarea
            rows={2}
            value={form.notes}
            onChange={(event) => set('notes', event.target.value)}
            placeholder="Running the cryo line at Surrey; needs a qualified supplier by Q2."
            className="resize-none"
            style={inputStyle}
          />
        </Field>

        <Field label="What you promised" hint="The thing you now owe them.">
          <input
            value={form.promise}
            onChange={(event) => set('promise', event.target.value)}
            placeholder="Send the qualification deck"
            style={inputStyle}
          />
        </Field>

        <Field label="The next step">
          <input
            value={form.next_step}
            onChange={(event) => set('next_step', event.target.value)}
            placeholder="A call the week after the show"
            style={inputStyle}
          />
        </Field>

        <label className="flex items-start gap-2 rounded-sm px-2.5 py-2" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-current"
            style={{ accentColor: B.copper }}
          />
          <span className="text-[11px] leading-relaxed" style={{ color: B.navy }}>
            <ShieldCheck className="mr-1 inline h-3 w-3" style={{ color: B.copper }} />
            They agreed to have their details kept. Only you can read this record.
          </span>
        </label>

        {error && <p className="text-[11px]" style={{ color: '#a33' }}>{error}</p>}

      </div>

      {/* The key rides the foot of the glass, so the capture is always under the thumb. */}
      <div
        className="sticky bottom-0 -mx-4 -mb-4 mt-2 flex items-center justify-between gap-2 px-4 py-2.5"
        style={{ background: '#fff', borderTop: `1px solid ${B.border}` }}
      >
        <span className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: B.muted }}>
          One thumb, ten seconds
        </span>
        <Key onClick={submit} disabled={status === 'saving'}>
          {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
          Capture
        </Key>
      </div>
    </Panel>
  );
}
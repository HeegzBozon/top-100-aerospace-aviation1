import { useState } from 'react';
import BusinessCardCapture from './BusinessCardCapture';
import ContactDraftForm from './ContactDraftForm';
import { C } from './crmConfig';

// The add-a-card feature: a card photographed or typed, read into a draft, corrected by the
// person who was there, and only then written. Nothing is saved until it is confirmed here,
// and a failure leaves the way to type it in.
export default function ContactCapture({ crm, onSaved }) {
  const [draft, setDraft] = useState(null);
  const [cardUri, setCardUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const open = (fields, uri) => {
    setError('');
    setCardUri(uri || '');
    setDraft(fields || {});
  };

  const save = async (payload) => {
    setSaving(true);
    try {
      await crm.save(payload);
      setDraft(null);
      setCardUri('');
      onSaved?.(payload.full_name);
    } catch {
      setError('That contact could not be saved. Try it once more.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {error ? (
        <p role="alert" className="mb-3 text-[11.5px]" style={{ color: C.copper }}>
          {error}
        </p>
      ) : null}

      {draft ? (
        <ContactDraftForm
          initial={draft}
          cardUri={cardUri}
          saving={saving}
          onSave={save}
          onCancel={() => {
            setDraft(null);
            setCardUri('');
          }}
        />
      ) : (
        <BusinessCardCapture onDraft={open} onManual={() => open({}, '')} />
      )}
    </div>
  );
}
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import BusinessCardCapture from './BusinessCardCapture';
import ContactDraftForm from './ContactDraftForm';
import { C } from './crmConfig';

// The capture, from a hand to the rolodex: a card photographed, a draft read from it, the
// draft corrected by the person who was there, and only then a record. Nothing is written
// until the member presses save, and a failure at any point leaves the way to type it in.
export default function ContactCapture({ crm, innerRef }) {
  const [draft, setDraft] = useState(null);
  const [cardUri, setCardUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const open = (fields, uri) => {
    setNotice('');
    setCardUri(uri || '');
    setDraft(fields || {});
  };

  const save = async (payload) => {
    setSaving(true);
    try {
      await crm.save(payload);
      setDraft(null);
      setCardUri('');
      setNotice(`${payload.full_name} is in the rolodex.`);
    } catch {
      setNotice('That contact could not be saved. Try it once more.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={innerRef}>
      {notice ? (
        <p
          role="status"
          className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color: C.copper }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> {notice}
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
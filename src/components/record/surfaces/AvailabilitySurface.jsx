import { useState } from 'react';
import IntentStudioPanel from '@/components/profile/intent/IntentStudioPanel';

// Availability: the switches the Fellow holds alone, and the two lines that say what
// they want next. Saved through the one function allowed to write them, so the
// approved sets are enforced somewhere other than the screen.
export default function AvailabilitySurface({ settings, accent, onSaveSettings }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (patch) => {
    setSaving(true);
    setError('');
    try {
      await onSaveSettings(patch);
    } catch (failure) {
      setError(failure?.response?.data?.error || 'That change was rejected.');
      throw failure;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8">
      <IntentStudioPanel
        part="availability"
        settings={settings}
        accent={accent}
        onSave={save}
        saving={saving}
        error={error}
      />
    </div>
  );
}
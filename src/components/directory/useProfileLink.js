import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ensureFellowSettings } from '@/lib/ensureFellowSettings';

// The member's profile settings, read and written from the Directory. Every write goes
// through the same server-validated save the profile uses, so nothing bypasses its rules.
export default function useProfileLink() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then((me) => ensureFellowSettings(me))
      .then((row) => setSettings(row || null))
      .catch(() => setSettings(null));
  }, []);

  const save = async (patch) => {
    await base44.functions.invoke('saveProfileSettings', patch);
    setSettings((s) => ({ ...(s || {}), ...patch }));
  };

  return { settings, save };
}

// What a complete profile holds, as the Directory asks for it.
export const profileSteps = (settings, intel) => [
  ['Career stage', !!intel?.stage],
  ['Your goals', !!intel?.goals?.length],
  ['Who you would like to meet', !!settings?.who_id_like_to_meet],
  ['Six-word story', !!settings?.six_word_story],
  ['Your field', !!settings?.domain_accent],
];
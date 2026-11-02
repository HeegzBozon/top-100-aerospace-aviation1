import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The member's own answers to "Why", kept on their account so every tab can tailor itself.
export default function useDirectoryIntel() {
  const [intel, setIntel] = useState({ stage: '', goals: [] });
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((me) => { setSignedIn(true); if (me?.directory_intel) setIntel(me.directory_intel); })
      .catch(() => setSignedIn(false))
      .finally(() => setLoading(false));
  }, []);

  const save = async (next) => {
    setIntel(next);
    if (signedIn) await base44.auth.updateMe({ directory_intel: { ...next, updated_at: new Date().toISOString() } });
  };

  return { intel, save, signedIn, loading };
}
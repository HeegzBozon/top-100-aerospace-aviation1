import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The room needs one thing the kit row does not hold: the Fellow's episode, because an
// episode is only shareable once it has a published address.
export default function useMediaRoom(email) {
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(!!email);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    setFailed(false);
    base44.entities.EpisodeIntake.filter({ fellow_email: email })
      .then((rows) => {
        if (alive) setEpisode(rows?.[0] || null);
      })
      .catch(() => {
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [email]);

  return { episode, loading, failed };
}
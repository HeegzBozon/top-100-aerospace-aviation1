import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// The Fellow's episode, read once per record. One intake per Fellow identity:
// the newest record is the one the pipeline reads, so an intake opened again
// after a withdrawal resolves to the live one rather than to history.
export default function useEpisodeIntake(fellowEmail) {
  const [intake, setIntake] = useState(null);
  const [loading, setLoading] = useState(!!fellowEmail);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!fellowEmail) {
      setIntake(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await base44.entities.EpisodeIntake.filter(
        { fellow_email: fellowEmail },
        { sort: '-created_date', limit: 1 }
      );
      const rows = res?.items || (Array.isArray(res) ? res : []);
      setIntake(rows[0] || null);
    } catch (e) {
      setError(e?.message || 'The episode record could not be read.');
    } finally {
      setLoading(false);
    }
  }, [fellowEmail]);

  useEffect(() => {
    load();
  }, [load]);

  return { intake, loading, error, reload: load };
}
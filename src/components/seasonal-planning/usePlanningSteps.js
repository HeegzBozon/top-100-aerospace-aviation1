import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// One saved record per agenda item: shared on the platform board, private on the personal one.
export default function usePlanningSteps(user, scope, seasonKey) {
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = { scope, season_key: seasonKey, ...(scope === 'personal' ? { created_by_id: user.id } : {}) };
    base44.entities.PlanningStep.filter(q, { limit: 100 })
      .then((page) => setRecords(Object.fromEntries(page.items.map((r) => [r.step_key, r]))))
      .catch((e) => setError(e.message || 'Could not load the itinerary'))
      .finally(() => setLoading(false));
  }, [user.id, scope, seasonKey]);

  const save = useCallback(async (stepKey, patch) => {
    const existing = records[stepKey];
    const saved = existing
      ? await base44.entities.PlanningStep.update(existing.id, patch)
      : await base44.entities.PlanningStep.create({ scope, season_key: seasonKey, step_key: stepKey, ...patch });
    setRecords((r) => ({ ...r, [stepKey]: { ...existing, ...saved } }));
  }, [records, scope, seasonKey]);

  return { records, loading, error, save };
}
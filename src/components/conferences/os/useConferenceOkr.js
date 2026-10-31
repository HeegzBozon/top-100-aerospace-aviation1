import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { OKR_TEMPLATES } from './okrTemplates';

async function countOr(query) {
  try { return await base44.entities.ConferenceContact.count(query); } catch { return null; }
}

// The Fellow's own objective (or the first template until one is saved) and the
// private readings its key results are measured against.
export default function useConferenceOkr() {
  const [okr, setOkr] = useState(null);
  const [values, setValues] = useState({ loading: true });

  useEffect(() => {
    base44.entities.ConferenceObjective.list('-updated_date', 1)
      .then((rows) => setOkr(rows[0] || null))
      .catch(() => setOkr(null));
    Promise.all([
      countOr({}),
      countOr({ follow_up_sent: true }),
      countOr({ outcome: { $in: ['meeting', 'opportunity', 'won'] } }),
      countOr({ outcome: 'won' }),
    ]).then(([captured, sent, outcomes, won]) => setValues({ loading: false, captured, sent, outcomes, won }));
  }, []);

  const save = async (draft) => {
    const data = { template_key: draft.template_key, objective: draft.objective, key_results: draft.key_results };
    const saved = okr?.id
      ? await base44.entities.ConferenceObjective.update(okr.id, data)
      : await base44.entities.ConferenceObjective.create(data);
    setOkr(saved);
  };

  const fallback = OKR_TEMPLATES[0];
  return { okr: okr || { template_key: fallback.key, ...fallback }, saved: !!okr, values, save };
}
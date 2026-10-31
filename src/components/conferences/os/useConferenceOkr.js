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
      base44.entities.ConferenceContact.filter({ outcome: { $in: ['won', 'lost'] } }, '-updated_date', 200).catch(() => []),
    ]).then(([captured, sent, outcomes, won, closed]) => {
      // Lead time: met → deal won. Cycle time: first follow-up → closed (won or lost).
      const days = (a, b) => (new Date(b) - new Date(a)) / 86400000;
      const avg = (list) => (list.length ? Math.round(list.reduce((s, n) => s + n, 0) / list.length) : null);
      const wins = closed.filter((c) => c.outcome === 'won');
      const lead = avg(wins.map((c) => days(c.met_on || c.created_date, c.updated_date)).filter((n) => n >= 0));
      const cycle = avg(closed.filter((c) => c.follow_up_sent_at).map((c) => days(c.follow_up_sent_at, c.updated_date)).filter((n) => n >= 0));
      const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : null;
      setValues({ loading: false, captured, sent, outcomes, won, lead, cycle, winRate });
    });
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